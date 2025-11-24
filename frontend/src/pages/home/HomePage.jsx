/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import InPageNavigation from "./InPageNavigation";
import BlogSkeleton from "../../components/skeletons/BlogSkeleton";
import Blog from "../../components/blogs/Blog";
import AnimationWrapper from "../../shared/components/animation/page-animation";
import TrendingBlog from "../../components/blogs/TrendingBlog";
import TrendingSkeleton from "../../components/skeletons/TrendingSkeleton";
import NoDataFound from "../../components/skeletons/NoDataFound";
import axios from "axios";

const HomePage = () => {
  const { loading } = useContext(AuthContext);

  let [blogs, setBlogs] = useState(null);
  let [totalBlogsCount, setTotalBlogsCount] = useState(0);
  let [trendingBlogs, setTrendingBlogs] = useState(null);

  let [pageState, setPageState] = useState("All Posts");

  const { token } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  let blogLimit = 4;

  const fetchBlogs = async (page = 1) => {
    try {
      const responseData = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_URL
        }/api/blogs/latest-blogs?page=${page}&limit=${blogLimit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBlogs(responseData?.data.blogs);
      setTotalBlogsCount(responseData?.data?.totalBlogs);
      setCurrentPage(responseData?.data.currentPage);
      setTotalPages(responseData?.data.totalPages);
    } catch (err) {
      setBlogs([]);
      console.error(err);
    }
  };

  const fetchTrendingBlogs = async () => {
    try {
      const responseData = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/blogs/trending-blogs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTrendingBlogs(responseData?.data?.blogs);
    } catch (err) {
      setTrendingBlogs([]);
      console.error(err);
    }
  };

  useEffect(() => {
    if (pageState === "All Posts") {
      fetchBlogs(currentPage);
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <Fragment>
      {loading && <LoadingSpinner asOverlay />}
      <div className="section h-cover flex justify-center gap-10">
        <div className="w-full md:w-3/5">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            smHidden={["trending blogs"]}
          >
            <div className="px-4 py-4 md:px-6">
              {blogs === null ? (
                [...Array(4)].map((_, idx) => <BlogSkeleton key={idx} />)
              ) : blogs.length ? (
                blogs.map((blog, index) => {
                  return (
                    <AnimationWrapper
                      key={blog.blogId}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    >
                      <Blog blog={blog} author={blog.creator.personal_info} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataFound message="No posts found" />
              )}

              {blogs !== null && totalBlogsCount > blogLimit ? (
                <div className="join grid grid-cols-2 my-4">
                  <button
                    onClick={handlePreviousPage}
                    className="join-item btn btn-outline text-xl"
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={handleNextPage}
                    className="join-item btn btn-outline text-xl"
                  >
                    Next
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>

            <div>
              {trendingBlogs === null ? (
                [...Array(3)].map((_, idx) => <BlogSkeleton key={idx} />)
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, index) => (
                  <AnimationWrapper
                    key={blog.blogId}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <TrendingBlog blog={blog} index={index} />
                  </AnimationWrapper>
                ))
              ) : (
                <NoDataFound message="No trending posts found" />
              )}
            </div>
          </InPageNavigation>
        </div>

        <div className="w-full md:w-2/5 mx-auto hidden lg:block">
          <h2 className="font-bold font-inter py-4 flex items-center gap-1">
            <span className="text-xl md:text-2xl">Trending Posts</span>
            <i className="fi fi-rr-arrow-trend-up text-xl md:text-2xl"></i>
          </h2>

          <div className="py-4">
            {trendingBlogs === null ? (
              [...Array(2)].map((_, idx) => <TrendingSkeleton key={idx} />)
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, index) => (
                <AnimationWrapper
                  key={blog.blogId}
                  transition={{ duration: 1, delay: index * 0.1 }}
                >
                  <TrendingBlog blog={blog} index={index} />
                </AnimationWrapper>
              ))
            ) : (
              <NoDataFound message="No trending posts found" />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default HomePage;
