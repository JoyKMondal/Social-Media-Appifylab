/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import BlogEditor from "./BlogEditor";
import { createContext } from "react";
import { useParams } from "react-router-dom";
import LoadingComponent from "../../shared/components/UIElements/LoadingComponent";
import { useHttpClient } from "../../shared/hooks/http-hook";

const completeBlog = {
  title: "",
  banner: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const EditorPage = () => {
  const [blog, setBlog] = useState(completeBlog);
  const [loading, setLoading] = useState(false);
  const { sendRequest } = useHttpClient();

  const blogId = useParams().blogId;

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const responseData = await sendRequest(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/blogs/blog-details`,
        "POST",
        JSON.stringify({
          blogId: blogId,
          mode: "edit",
        }),
        {
          "Content-Type": "application/json",
        }
      );

      setBlog(responseData.blog);
    } catch (err) {
      setBlog([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      setLoading(true);
    }

    fetchBlog();
  }, [blogId]);

  return (
    <EditorContext.Provider
      value={{ blog, setBlog }}
    >
      {
        loading ? (
          <LoadingComponent asOverlay />
        ) : (
          <BlogEditor />
        )
      }
    </EditorContext.Provider>
  );
};

export default EditorPage;
