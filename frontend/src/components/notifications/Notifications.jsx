import { Link } from "react-router-dom";
import { extractTime } from "../../utils/extractTime";

const Notifications = ({ notification }) => {
  const { type, createdAt } = notification;

  let blogId,
    seen,
    title,
    firstName,
    lastName,
    username,
    profileImage,
    mainComment;

  if (type === "like") {
    ({
      blog: { blogId, title },
      seen,
      user: {
        personal_info: { firstName, lastName, username, profileImage },
      },
    } = notification);
  } else if (type === "comment") {
    ({
      blog: { blogId, title },
      seen,
      user: {
        personal_info: { firstName, lastName, username, profileImage },
      },
      comment: { comment: mainComment },
    } = notification);
  } else if (type === "reply") {
    ({
      blog: { blogId, title },
      seen,
      user: {
        personal_info: { firstName, lastName, username, profileImage },
      },
      replied_on_comment: { comment: mainComment },
    } = notification);
  }
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || "Anonymous";

  return (
    <div
      className={`p-4 mb-4 ${
        !seen && "font-bold"
      } bg-white border-b border-grey transition-all duration-500 list-none`}
    >
      <Link to={`/blog/${blogId}`}>
        <div className="flex items-start justify-center">
          <Link to={`/user/${username}`}>
            <img
              src={profileImage}
              alt="Profile Image"
              className="w-12 h-12 rounded-full mr-4"
            />
          </Link>

          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <Link to={`/user/${username}`}>
                  <span className="mr-4 hover:underline capitalize">
                    {displayName}
                  </span>
                </Link>
                <Link to={`/user/${username}`}>
                  <span className="text-gray-500">{username}</span>
                </Link>
                <span className="ml-2">
                  {type === "like"
                    ? "liked your blog"
                    : type === "comment"
                    ? "commented on"
                    : "replied on"}
                </span>
              </div>
            </div>

            {type === "reply" ? (
              <h1 className="bg-grey hover:bg-white p-3 mt-2 font-inter text-2xl max-md:text-xl">
                &ldquo;{mainComment}&rdquo;
              </h1>
            ) : (
              <h1 className="mt-2 font-inter text-2xl max-md:text-xl">
                &ldquo;{title}&rdquo;
              </h1>
            )}

            {type !== "like" ? (
              <p className="text-gray-700 text-xl my-4">{mainComment}</p>
            ) : (
              ""
            )}

            <p className="text-gray-700 mt-2">{extractTime(createdAt)}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Notifications;
