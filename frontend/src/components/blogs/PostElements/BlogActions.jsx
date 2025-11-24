import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../shared/context/auth-context";
import { AiFillLike } from "react-icons/ai";
import { LuMessageCircle } from "react-icons/lu";
import { IoMdShareAlt } from "react-icons/io";
import axios from "axios";
import { BlogActionsContext } from "../Blog";
import { useHttpClient } from "../../../shared/hooks/http-hook";
import { useNavigate } from "react-router-dom";

export const BlogActions = () => {
  let {
    blog: {
      _id,
      title,
      blogId,
      activity: { total_likes, total_comments },
      creator: {
        personal_info: { username },
      },
    },
    setBlog,
  } = useContext(BlogActionsContext);

  const [liked, setLiked] = useState(false);

  const { sendRequest } = useHttpClient();
  const { loggedInUser, isLoggedIn, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL
          }/api/blogs/is-liked/${_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLiked(response.data.likedByUser);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    if (_id) checkIfLiked();
  }, [_id, token]);

  const handleLikeClick = async () => {
    if (!isLoggedIn) {
      return navigate("/login");
    }

    try {
      const response = await sendRequest(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_URL
        }/api/blogs/toggle-like-blog`,
        "POST",
        JSON.stringify({ _id: _id }),
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      setBlog((prevBlog) => ({
        ...prevBlog,
        activity: {
          ...prevBlog.activity,
          total_likes: response.blog.activity.total_likes,
        },
      }));
      setLiked(response.likedByUser);
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between border border-[#efefef] mt-3">
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center">
            <span
              className={`ml-2 text-gray-500 flex items-center gap-2 ${
                liked ? "text-red" : ""
              }`}
            >
              <i
                className={`fi text-2xl ${
                  liked ? "fi-sr-thumbs-up" : "fi-rr-social-network"
                }`}
              ></i>
              {/* <span>{total_likes}</span> */}
            </span>
          </div>
          <p className="text-[#515151]">{total_likes}</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[#515151]">{total_comments} Comments</p>
          <p className="text-[#515151]">{0} Share</p>
        </div>
      </div>

      {/* Post Footer */}
      <div className="flex items-center justify-center text-center pt-3">
        <button
          className={`text-[#515151] flex justify-center items-center gap-2 w-1/3 my-4 mx-auto hover:bg-gray-200 ${
            liked ? "text-red" : ""
          }`}
          onClick={handleLikeClick}
          style={{ cursor: "pointer" }}
        >
          <i
            className={`fi text-2xl ${
              liked ? "fi-sr-thumbs-up" : "fi-rr-social-network"
            }`}
          ></i>
          <span className="text-xl">Like</span>
        </button>

        <div className="drawer-content w-1/3 my-4 mx-auto hover:bg-gray-200 cursor-pointer">
          <label
            htmlFor="my-drawer-4"
            className={`drawer-button text-[#515151] flex justify-center items-center gap-2`}
          >
            <i className={`fi fi-rs-comment text-2xl`}></i>
            <span className="text-xl">Comment</span>
          </label>
        </div>

        <button
          className={`text-[#515151] flex justify-center items-center gap-2 w-1/3 my-4 mx-auto hover:bg-gray-200`}
          onClick={handleLikeClick}
          style={{ cursor: "pointer" }}
        >
          <i className={`fi text-2xl fi fi-rr-redo`}></i>
          <span className="text-xl">Share</span>
        </button>
      </div>
    </div>
  );
};
