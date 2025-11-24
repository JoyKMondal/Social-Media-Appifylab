// controllers\blog.controller.js
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");
const User = require("../models/users.model");
const Blog = require("../models/blog.model");
const Notification = require("../models/notification.model");
const Comment = require("../models/comment.model");

function convertTitleToId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const uniqueId = uuidv4();
  return `${slug}-${uniqueId}`;
}

const createBlog = async (req, res, next) => {
  const errors = validationResult(req);

  let creatorId = req.userData.userId;

  let { title, banner, isPrivate, id } = req.body;

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const blogId = id || convertTitleToId(title);

  try {
    if (id) {
      const existingBlog = await Blog.findOne({ blogId: id });

      if (!existingBlog) {
        return next(new HttpError("Blog not found!", 404));
      }

      if (existingBlog.creator.toString() !== creatorId) {
        return next(
          new HttpError("You are not allowed to edit this blog.", 403)
        );
      }

      existingBlog.title = title;
      existingBlog.banner = banner;
      existingBlog.isPrivate = Boolean(isPrivate);

      const updatedBlog = await existingBlog.save();

      res.status(200).json({
        message: "Blog updated successfully!",
        blog: updatedBlog,
      });
    } else {
      const createdBlog = new Blog({
        blogId,
        title,
        banner,
        creator: creatorId,
        isPrivate: Boolean(isPrivate),
      });

      const savedBlog = await createdBlog.save();

      let incrementBy = 1;

      const updatedUser = await User.findByIdAndUpdate(
        creatorId,
        {
          $inc: { "account_info.total_posts": incrementBy },
          $push: { blogs: savedBlog._id },
        },
        { new: true }
      );

      if (!updatedUser) {
        return next(new HttpError("User not found!", 404));
      }

      res.status(201).json({
        message: "Blog created and user updated",
        blog: savedBlog,
        user: updatedUser,
      });
    }
  } catch (err) {
    console.log(err);
    const error = new HttpError(err.message, 500);
    return next(error);
  }
};

// const getLatestBlogs = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page);
//     const maxLimit = parseInt(req.query.limit);

//     const skip = (page - 1) * maxLimit;

//     const blogs = await Blog.find({ draft: false })
//       .populate(
//         "creator",
//         "personal_info.profileImage personal_info.username personal_info.firstName personal_info.lastName -_id"
//       )
//       .sort({ publishedAt: -1 })
//       .select("blogId title banner activity publishedAt")
//       .skip(skip)
//       .limit(maxLimit);

//     const totalBlogs = await Blog.countDocuments({ draft: false });

//     if (!blogs || blogs.length === 0) {
//       const error = new HttpError("No blogs found.", 404);
//       return next(error);
//     }

//     res.status(200).json({
//       blogs: blogs,
//       currentPage: page,
//       totalPages: Math.ceil(totalBlogs / maxLimit),
//       totalBlogs: totalBlogs,
//     });
//   } catch (err) {
//     const error = new HttpError(err.message, 500);
//     return next(error);
//   }
// };

const getLatestBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const maxLimit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * maxLimit;

    // MUST be logged in → req.user is attached by auth middleware
    if (!req.userData || !req.userData.userId) {
      return next(new HttpError("Authentication required to view blogs.", 401));
    }

    const currentUserId = req.userData.userId;

    const query = {
      $or: [
        { isPrivate: false }, // all public blogs
        { isPrivate: true, creator: currentUserId }, // my private blogs only
      ],
    };

    const blogs = await Blog.find(query)
      .populate(
        "creator",
        "personal_info.profileImage personal_info.username personal_info.firstName personal_info.lastName -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blogId title banner activity publishedAt isPrivate creator")
      .skip(skip)
      .limit(maxLimit);
    // .lean();

    const totalBlogs = await Blog.countDocuments(query);

    query;

    return res.status(200).json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / maxLimit),
      totalBlogs,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Failed to fetch blogs.", 500));
  }
};

const getTrendingBlogs = async (req, res, next) => {
  try {
    let maxLimit = 5;

    if (!req.userData || !req.userData.userId) {
      return next(new HttpError("Authentication required to view blogs.", 401));
    }
    const currentUserId = req.userData.userId;

    const query = {
      $or: [
        { isPrivate: false }, // all public blogs
        { isPrivate: true, creator: currentUserId }, // my private blogs only
      ],
    };

    const blogs = await Blog.find(query)
      .populate(
        "creator",
        "personal_info.profileImage personal_info.username personal_info.firstName personal_info.lastName -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blogId title activity publishedAt")
      .limit(maxLimit);

    if (!blogs || blogs.length === 0) {
      const error = new HttpError("No blogs found.", 404);
      return next(error);
    }

    res.status(200).json({
      blogs,
    });
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }
};

const postUserBlogs = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ "personal_info.username": username });

    if (!user) {
      const error = new HttpError("User not found.", 404);
      return next(error);
    }

    const creator = user._id;

    const page = parseInt(req.query.page) || 1;
    const maxLimit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * maxLimit;

    const query = {
      $or: [
        { isPrivate: false }, // all public blogs
        { isPrivate: true, creator }, // my private blogs only
      ],
    };

    const blogs = await Blog.find(query)
      .populate(
        "creator",
        "personal_info.profileImage personal_info.username personal_info.firstName personal_info.lastName -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blogId title banner activity publishedAt")
      .skip(skip)
      .limit(maxLimit);

    const totalBlogs = await Blog.countDocuments({
      creator: creator,
    });

    if (!blogs || blogs.length === 0) {
      const error = new HttpError("No blogs found for this user.", 404);
      return next(error);
    }

    res.status(200).json({
      blogs: blogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / maxLimit),
      totalBlogs: totalBlogs,
    });
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }
};

const postSearchBlogs = async (req, res, next) => {
  try {
    let { tag } = req.body;
    if (!tag) return next(new HttpError("Tag is required", 400));

    const page = parseInt(req.query.page) || 1;
    const maxLimit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * maxLimit;

    // Convert tag to lowercase for case-insensitive search
    const tagLower = tag.toLowerCase();

    const blogs = await Blog.find({
      firstName: { $in: [tagLower] }, // $in for array contains
      isPrivate: false,
    })
      .populate(
        "creator",
        "personal_info.profileImage personal_info.username personal_info.firstName personal_info.lastName -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blogId title banner activity publishedAt")
      .skip(skip)
      .limit(maxLimit);

    const totalBlogs = await Blog.countDocuments({
      firstName: { $in: [tagLower] },
      isPrivate: false,
    });

    res.status(200).json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / maxLimit),
      totalBlogs,
    });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

const getUsersByBlogTags = async (req, res, next) => {
  try {
    let { tag } = req.body;
    if (!tag) return next(new HttpError("Tag is required", 400));

    const tagLower = tag.toLowerCase();

    const usersWithBlogs = await Blog.aggregate([
      {
        $match: {
          firstName: { $in: [tagLower] },
          isPrivate: false,
        },
      },
      {
        $group: { _id: "$creator" },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id", // ← FIXED: was "__id"
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: false, // Optional: skip if no user
        },
      },
      {
        $project: {
          "userDetails.personal_info": 1,
        },
      },
    ]);

    if (!usersWithBlogs.length) {
      return next(new HttpError("No users found with that tag", 404));
    }

    res.json({
      users: usersWithBlogs.map((u) => u.userDetails),
    });
  } catch (err) {
    console.error("getUsersByBlogTags error:", err);
    next(new HttpError("Server error", 500));
  }
};

const getBlogById = async (req, res, next) => {
  try {
    const { blogId, mode } = req.body;
    let incrementBy = mode !== "edit" ? 1 : 0;

    const blog = await Blog.findOneAndUpdate(
      { blogId },
      {
        $inc: { "activity.total_reads": incrementBy },
      },
      { new: true }
    )
      .populate(
        "creator",
        "personal_info.firstName personal_info.lastName personal_info.username personal_info.profileImage"
      )
      .select("title banner activity publishedAt blogId");

    if (!blog) {
      return next(new HttpError("Blog not found!", 404));
    }

    await User.findOneAndUpdate(
      { "personal_info.username": blog.creator.personal_info.username },
      {
        $inc: { "account_info.total_reads": incrementBy },
      },
      { new: true }
    );

    res.status(201).json({
      message: "Blog retrived and data updated",
      blog: blog,
    });
  } catch (err) {
    const error = new HttpError(err.message, 500);
    return next(error);
  }
};

const checkUserLike = async (req, res, next) => {
  const { blogId } = req.params;

  try {
    const userLike = await Notification.findOne({
      user: req.userData.userId,
      blog: blogId,
      type: "like",
    });

    res.status(200).json({ likedByUser: !!userLike });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const toggleLikeBlog = async (req, res, next) => {
  const { _id } = req.body;

  try {
    const blog = await Blog.findById(_id);

    if (!blog) {
      return next(new HttpError("Blog not found.", 404));
    }

    const userLike = await Notification.findOne({
      user: req.userData.userId,
      blog: _id,
      type: "like",
    });

    let updatedBlog;

    if (userLike) {
      updatedBlog = await Blog.findOneAndUpdate(
        { _id },
        { $inc: { "activity.total_likes": -1 } },
        { new: true }
      );

      await Notification.findOneAndDelete({
        user: req.userData.userId,
        blog: _id,
        type: "like",
      });

      res.status(200).json({
        blog: updatedBlog,
        message: "Blog unliked successfully.",
        likedByUser: false,
      });
    } else {
      updatedBlog = await Blog.findOneAndUpdate(
        { _id },
        { $inc: { "activity.total_likes": 1 } },
        { new: true }
      );

      const notification = new Notification({
        type: "like",
        blog: _id,
        notification_for: updatedBlog.creator,
        user: req.userData.userId,
      });

      await notification.save();

      res.status(201).json({
        blog: updatedBlog,
        message: "Blog liked successfully.",
        likedByUser: true,
      });
    }
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const commentBlog = async (req, res, next) => {
  try {
    const { _id, blog_author, comments, replyingTo } = req.body;

    if (!comments) {
      return next(
        new HttpError("Write something before sending to backend", 403)
      );
    }

    const userId = req.userData.userId;

    // Create the comment object with isReply set dynamically
    let commentObject = {
      blog_id: _id,
      blog_author: blog_author,
      comment: comments,
      commented_by: userId,
      isReply: !!replyingTo, // Set isReply to true if replyingTo exists, otherwise false
    };

    // If the comment is a reply, add the parent comment reference
    if (replyingTo) {
      commentObject.parent = replyingTo;
    }

    // Create and save the new comment
    const createdComment = new Comment(commentObject);
    const savedComment = await createdComment.save();

    // Destructure relevant fields to send in the response
    let { comment, commentedAt, children } = savedComment;

    // Update the blog to add the new comment and increment comment counts
    const updatedBlog = await Blog.findByIdAndUpdate(
      _id,
      {
        $push: { comments: savedComment._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replyingTo ? 0 : 1, // Increment parent comment count if it's a new comment, not a reply
        },
      },
      { new: true }
    );

    if (!updatedBlog) {
      return next(new HttpError("Blog not found!", 404));
    }

    // Prepare the notification object
    let notificationObject = {
      type: replyingTo ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: req.userData.userId,
      comment: savedComment._id,
    };

    // If the comment is a reply, update the parent comment and notification accordingly
    if (replyingTo) {
      notificationObject.replied_on_comment = replyingTo;

      // Update the parent comment to add this comment as a reply (child)
      let replyDoc = await Comment.findOneAndUpdate(
        { _id: replyingTo },
        { $push: { children: savedComment._id } }
      );

      notificationObject.notification_for = replyDoc.commented_by; // Notify the original commenter
    }

    // Create and save the notification
    const notification = new Notification(notificationObject);
    await notification.save();

    // Send the response with the new comment details
    res.status(201).json({
      comment,
      commentedAt,
      children,
      userId,
      comment_id: savedComment._id,
    });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
};

const getBlogComments = async (req, res, next) => {
  try {
    let { blog_id, skip } = req.body;
    let maxLimit = 5;

    // Fetch parent comments (isReply: false)
    const parentComments = await Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.profileImage personal_info.username personal_info.firstName personal_info.lastName"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({ commentedAt: -1 })
      .lean(); // Use .lean() to return plain JS objects

    // Fetch all replies (isReply: true) for the same blog
    const allReplies = await Comment.find({ blog_id, isReply: true })
      .populate(
        "commented_by",
        "personal_info.profileImage personal_info.username personal_info.firstName personal_info.lastName"
      )
      .sort({ commentedAt: 1 })
      .lean();

    // Step 1: Create a map of replies by parent comment ID
    const repliesMap = {};
    allReplies.forEach((reply) => {
      // Initialize reply array for each parent comment if not already initialized
      if (!repliesMap[reply.parent]) {
        repliesMap[reply.parent] = [];
      }
      reply.childrenLevel = 1; // Default level for direct replies
      repliesMap[reply.parent].push(reply); // Group replies by parent ID
    });

    // Step 2: Assign replies to their parent comment and set the childrenLevel
    parentComments.forEach((parentComment) => {
      parentComment.children = repliesMap[parentComment._id] || []; // Assign replies or empty array if no replies
      parentComment.childrenLevel = 0; // Top-level comment has level 0

      // For each reply, we can also add further nesting if needed (nested replies)
      parentComment.children.forEach((reply) => {
        // If you support replies to replies, you can nest here
        reply.children = repliesMap[reply._id] || []; // Nested replies (children of the reply)
        reply.children.forEach((nestedReply) => {
          nestedReply.childrenLevel = 2; // Nested replies have childrenLevel 2
        });
      });
    });

    res.status(200).json({
      comment: parentComments,
    });
  } catch (err) {
    console.log(err);
    return next(new HttpError(err.message, 500));
  }
};

const getAllBlogs = async (req, res, next) => {
  const { isPrivate, searchQuery } = req.body;

  try {
    const query = {
      creator: req.userData.userId,
    };

    if (isPrivate !== undefined && isPrivate !== null) {
      query.isPrivate = isPrivate;
    }
    if (searchQuery && searchQuery.trim()) {
      query.title = { $regex: searchQuery.trim(), $options: "i" };
    }

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .select("blogId title banner activity publishedAt createdAt")
      .lean(); // ← improves performance

    return res.status(200).json({
      blogs: blogs || [],
      message:
        blogs.length === 0
          ? "No blogs found matching your criteria."
          : undefined,
    });
  } catch (err) {
    const error = new HttpError(
      "Failed to fetch blogs. Please try again.",
      500
    );
    return next(error);
  }
};

const deleteBlogs = async (req, res, next) => {
  try {
    const { blogId } = req.body;
    const userId = req.userData.userId;

    const blog = await Blog.find({ blogId: blogId });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    await Blog.findOneAndDelete({ blogId });
    await Notification.deleteMany({ blog: blog._id });

    await Comment.deleteMany({ blog_id: blog._id });

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: { blogs: blog._id },
        $inc: { "account_info.total_posts": -1 },
      },
      { new: true }
    );

    return res.status(200).json({
      message:
        "Blog, associated notifications, and user data updated successfully",
    });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};

exports.createBlog = createBlog;
exports.getLatestBlogs = getLatestBlogs;

exports.getTrendingBlogs = getTrendingBlogs;
exports.postSearchBlogs = postSearchBlogs;
exports.getUsersByBlogTags = getUsersByBlogTags;
exports.postUserBlogs = postUserBlogs;

exports.getBlogById = getBlogById;

exports.toggleLikeBlog = toggleLikeBlog;
exports.checkUserLike = checkUserLike;

exports.commentBlog = commentBlog;
exports.getBlogComments = getBlogComments;

exports.getAllBlogs = getAllBlogs;
exports.deleteBlogs = deleteBlogs;
