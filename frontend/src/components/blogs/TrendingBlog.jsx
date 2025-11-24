import { Link } from "react-router-dom";
import { extractTimeInPost } from "../../utils/extractTime";

const TrendingBlog = ({ blog, index }) => {
  const {
    title,
    blogId,
    creator: {
      personal_info: { firstName, lastName, username, profileImage },
    },
    activity: { total_likes, total_comments, total_reads },
    publishedAt,
  } = blog;

  const formattedTime = extractTimeInPost(publishedAt);

  return (
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-5 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600">
      <div className="flex gap-6">
        {/* Index Number */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <img
              src={profileImage}
              alt={firstName}
              className="w-9 h-9 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 object-cover"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/user/${username}`}>
                <span className="font-medium text-gray-900 dark:text-white capitalize hover:underline">
                  {firstName} {lastName || ""}
                </span>
              </Link>
              <span className="text-gray-500">@{username}</span>
              <span className="text-gray-400">· {formattedTime}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          {/* Stats Row */}
          <div className="flex items-center gap-6 text-sm">
            {/* Likes */}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{total_likes || 0} Likes</span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="font-medium">
                {total_comments || 0} Comments
              </span>
            </div>

            {/* Reads */}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="font-medium">{total_reads || 0} Reads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingBlog;
