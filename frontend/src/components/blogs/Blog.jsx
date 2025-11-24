import { Link } from "react-router-dom";
import { extractTimeInPost } from "../../utils/extractTime";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import { BsThreeDots } from "react-icons/bs";
import { useHttpClient } from "../../shared/hooks/http-hook";
import CommentDrawer, { fetchComments } from "../comments/CommentDrawer";
import AnimationWrapper from "../../shared/components/animation/page-animation";
import { BlogActions } from "./PostElements/BlogActions";
import toast from "react-hot-toast";

export const blogObject = {
  title: "",
  description: "",
  content: [],
  tags: [],
  creator: { personal_info: {} },
  activity: {},
  banner: "",
  publishedAt: "",
};

export const BlogActionsContext = createContext({});

const Blog = ({ blog, author }) => {
  const { firstName, lastName, username, profileImage } = author;
  const {
    publishedAt,
    _id,
    title,
    banner,
    isPrivate,
    activity: { total_likes, total_comments },
    blogId,
  } = blog;

  const { loggedInUser, token } = useContext(AuthContext);
  const { sendRequest } = useHttpClient();

  const [loading, setLoading] = useState(false);

  const [blogs, setBlogs] = useState(blogObject);

  const [showComments, setShowComments] = useState(false);
  const [previousCommentsLoaded, setPreviousCommentsLoaded] = useState(0);

  const formattedTime = extractTimeInPost(publishedAt);
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || "Anonymous";

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const responseData = await sendRequest(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/blogs/blog-details`,
        "POST",
        JSON.stringify({
          blogId: blogId,
        }),
        {
          "Content-Type": "application/json",
        }
      );

      const commentsData = await fetchComments({
        blog_id: responseData?.blog?._id,
        setParentComponentCount: setPreviousCommentsLoaded,
      });

      setBlogs({
        ...responseData.blog,
        comments: commentsData?.results?.comment,
      });
    } catch (err) {
      setBlogs([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  console.log(blogs, "blogs")

  const handleDeleteBlog = async (e, blogId) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/blogs/delete-blog`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ blogId: blogId }),
        }
      );

      const data = await response.json();
      toast.success(data.message);

      // setBlogs((prevBlogs) =>
      //   prevBlogs?.filter((blog) => blog.blogId !== blogId)
      // );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchBlogDetails();
  }, [blogId]);

  return (
    <AnimationWrapper>
      <BlogActionsContext.Provider
        value={{
          blog: blogs,
          setBlog: setBlogs,
          showComments,
          setShowComments,
          previousCommentsLoaded,
          setPreviousCommentsLoaded,
        }}
      >
        <CommentDrawer />
        <div className="bg-white border border-[#efefef] p-4 shadow-xl shadow-[#dadada] rounded-md">
          {/* post header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/user/${username}`}>
                <img
                  src={profileImage}
                  alt=""
                  className="w-12 h-12 rounded-full border border-[#efefef]"
                />
              </Link>
              <div className="flex flex-col justify-center gap-2">
                <Link to={`/user/${username}`}>
                  <p className="font-medium capitalize text-2xl hover:underline">
                    {displayName}
                  </p>
                </Link>
                <p className="-mt-1 text-gray-400 text-ms">
                  {formattedTime}
                  <span>{" . "}</span>
                  <span>{isPrivate ? "Private" : "Public"}</span>
                </p>
              </div>
            </div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn m-1">
                <BsThreeDots className="text-2xl text-[#515151]" />
              </div>
              <ul
                tabIndex="-1"
                className="dropdown-content menu bg-white rounded-box z-1 w-96 p-2 shadow-md"
              >
                <li className="m-[0 0 16px 0]">
                  <Link
                    to="#"
                    className="font-medium text-xl leading-4 gap-4 text-[#666666] transition-all duration-200 ease-in-out"
                  >
                    <span className="flex justify-center items-center bg-[#ebf2ff] p-3 rounded-full m-[0 8px 0 0]">
                      <i className="fi fi-rr-bookmark text-xl text-blue-400"></i>
                    </span>
                    Save Post
                  </Link>
                </li>
                <li className="m-[0 0 16px 0]">
                  <Link
                    to="#"
                    className="font-medium text-xl leading-4 gap-4 text-[#666666] transition-all duration-200 ease-in-out"
                  >
                    <span className="flex justify-center items-center bg-[#ebf2ff] p-3 rounded-full m-[0 8px 0 0]">
                      <i className="fi fi-rs-bell text-xl text-blue-400"></i>
                    </span>
                    Turn On Notification
                  </Link>
                </li>
                <li className="m-[0 0 16px 0]">
                  <Link
                    to="#"
                    className="font-medium text-xl leading-4 gap-4 text-[#666666] transition-all duration-200 ease-in-out"
                  >
                    <span className="flex justify-center items-center bg-[#ebf2ff] p-3 rounded-full m-[0 8px 0 0]">
                      <i className="fi fi-rr-square-x text-xl text-blue-400"></i>
                    </span>
                    Hide
                  </Link>
                </li>

                {loggedInUser?.personal_info?.username === username && (
                  <li className="m-[0 0 16px 0]">
                    <Link
                      to={`/editor/${blogId}`}
                      className="font-medium text-xl leading-4 gap-4 text-[#666666] transition-all duration-200 ease-in-out"
                    >
                      <span className="flex justify-center items-center bg-[#ebf2ff] p-3 rounded-full m-[0 8px 0 0]">
                        <i className="fi fi-rs-edit text-xl text-blue-400"></i>
                      </span>
                      Edit Post
                    </Link>
                  </li>
                )}
                {loggedInUser?.personal_info?.username === username && (
                  <li className="m-[0 0 16px 0]">
                    <button
                      onClick={(e) => handleDeleteBlog(e, blogId)}
                      className="font-medium text-xl leading-4 gap-4 text-[#666666] transition-all duration-200 ease-in-out"
                    >
                      <span className="flex justify-center items-center bg-[#ebf2ff] p-3 rounded-full m-[0 8px 0 0]">
                        <i className="fi fi-rr-trash text-xl text-blue-400"></i>
                      </span>
                      Delete Post
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Post Caption */}
          <p className="mt-5 text-[#515151] text-md">{title}</p>

          {/* Post Image */}
          <div className="w-full border border-[#efefef] bg-[#f8f8f8] mt-5 rounded-md">
            <img
              src={banner}
              alt=""
              className="w-full object-cover rounded-md"
            />
          </div>

          {/* post bottom */}
          <BlogActions />
        </div>
      </BlogActionsContext.Provider>
    </AnimationWrapper>
  );
};

export default Blog;
