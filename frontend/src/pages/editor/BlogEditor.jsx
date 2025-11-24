/* eslint-disable react-hooks/exhaustive-deps */
import { useState, Fragment } from "react";

import AnimationWrapper from "../../shared/components/animation/page-animation";
import EditorImageUpload from "../../shared/components/FormElements/EditorImageUpload";
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_MINLENGTH } from "../../shared/util/validators";
import { useContext } from "react";
import { EditorContext } from "./EditorPage";
import BlogInput from "../../shared/components/FormElements/BlogInput";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

const BlogEditor = () => {
  const { blog, setBlog } = useContext(EditorContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { error, sendRequest, clearError } = useHttpClient();
  const { token } = useContext(AuthContext);
  const blogId = useParams().blogId || null;
  console.log(blogId, "blogId in BlogEditor");

  const { title, banner } = blog;
  const [isPrivatePost, setIsPrivatePost] = useState(false);

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const handlePublishPost = async (event) => {
    event.preventDefault();

    let blogObject = {
      title,
      banner,
      isPrivate: isPrivatePost,
    };

    try {
      setLoading(true);
      const responseData = await sendRequest(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/blogs/create-blog`,
        "POST",
        JSON.stringify({ ...blogObject, id: blogId }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        }
      );

      setTimeout(() => {
        navigate("/dashboard/blogs");
      }, 500);
      console.log(responseData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (!blog) {
    return null;
  }

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <div className="min-w-full">
        <div className="navbar">
          <div className="navbar-start">
            <Link className="btn btn-ghost text-xl capitalize">
              {blogId ? "Edit Post" : "New Post"}
            </Link>
          </div>
          <div className="navbar-end gap-5">
            <button
              disabled={!banner?.length || !title?.length || loading}
              onClick={handlePublishPost}
              className="btn-dark"
              type="submit"
            >
              {loading
                ? blogId == null
                  ? "Creating Post..."
                  : "Updating Post..."
                : blogId == null
                ? "Create Post"
                : "Update Post"}
            </button>
          </div>
        </div>

        <AnimationWrapper>
          <div className="editor-section h-cover">
            <EditorImageUpload
              id="file"
              center
              onInput={inputHandler}
              errorText="Please provide an image"
            />

            <BlogInput
              id="title"
              element="textarea"
              validators={[VALIDATOR_MINLENGTH(5)]}
              errorText="Please enter a valid title"
              placeholder="Post Title"
              onInput={inputHandler}
              initialValue={blog.title}
              initialValid={true}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivatePost}
                onChange={(e) => setIsPrivatePost(e.target.checked)}
                className="w-6 h-6 text-blue-600 rounded"
              />
              <span className="text-gray-600 dark:text-gray-300 text-xl">
                Mark it As Private Post
              </span>
            </label>
          </div>
        </AnimationWrapper>
      </div>
    </Fragment>
  );
};

export default BlogEditor;
