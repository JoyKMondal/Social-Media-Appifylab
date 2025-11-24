import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../shared/context/auth-context";
import logo from "../../assets/images/logo.svg";

const Navbar = () => {
  const { isLoggedIn, logout, loggedInUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSearchEvent = (e) => {
    const value = e.target.value;
    if (e.keyCode === 13 && value.length) {
      navigate(`/search/${value}`);
      e.target.value = "";
    }
  };

  return (
    <div className="navbar bg-base-100 z-100">
      <div className="navbar-start">
        {/* <Link className="btn btn-ghost text-xl">Blog App</Link> */}
        <Link className="mr-2 none items-center md:flex" href="/">
          <img src={logo} alt="Image" className="w-screen md:w-full h-6 md:h-9" />
        </Link>
        <label className="input input-bordered flex items-center bg-gray-100 rounded-full overflow-hidden gap-2 w-11/12 md:w-1/2 hide md:show">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-50"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            onKeyDown={handleSearchEvent}
            className="grow"
            placeholder="Search"
          />
        </label>
      </div>
      <div className="navbar-end gap-5">
        {isLoggedIn && (
          <Link
            to="/editor"
            className="h-[80px] flex items-center font-bold border-b-4 border-transparent hover:border-blue-400 hover:text-blue-400 py-4 px-5 transition-all duration-400 hide md:show"
          >
            <i className="fi fi-rr-file-edit text-2xl"></i>
          </Link>
        )}
        {/* {!isLoggedIn && (
          <>
            <Link to="/auth?mode=sign-in" className="btn text-xl hide md:show">
              <i className="fi fi-br-enter"></i>
              <span>Sign In</span>
            </Link>
            <Link to="/auth?mode=sign-up" className="btn text-xl hide md:show">
              <i className="fi fi-tr-sign-up"></i>
              <span>Sign Up</span>
            </Link>
          </>
        )} */}
        {isLoggedIn && (
          <Link className="h-[80px] flex items-center font-bold border-b-4 border-transparent hover:border-blue-400 hover:text-blue-400 py-4 px-5 transition-all duration-400 hide md:show">
            <i className="fi fi-rr-home text-2xl"></i>
          </Link>
        )}
        {isLoggedIn && (
          <Link className="h-[80px] flex items-center font-bold border-b-4 border-transparent hover:border-blue-400 hover:text-blue-400 py-4 px-5 transition-all duration-400 hide md:show">
            <i className="fi fi-rr-member-list text-2xl"></i>
          </Link>
        )}
        {isLoggedIn && (
          <Link
            to="/dashboard/notifications"
            className="h-[80px] flex items-center font-bold border-b-4 border-transparent hover:border-blue-400 hover:text-blue-400 py-4 px-5 transition-all duration-400 hide md:show"
            // className="btn btn-ghost btn-circle"
          >
            <i
              className={`fi ${
                isLoggedIn && loggedInUser?.newNotification
                  ? "fi-ss-bell-notification-social-media"
                  : "fi-ss-bell"
              } text-2xl`}
            ></i>
          </Link>
        )}

        {isLoggedIn && (
          <div className="dropdown dropdown-end z-50">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost"
            >
              {/* <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src={loggedInUser?.personal_info.profileImage}
                />
              </div> */}
              <div className="w-10 md:w-6 md:h-6 rounded-full overflow-hidden">
                <img
                  alt="Tailwind CSS Navbar component"
                  src={loggedInUser?.personal_info.profileImage}
                />
              </div>
              <span className="capitalize hide md:show">{loggedInUser?.personal_info.firstName}</span>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link
                  to="/editor"
                  className="p-4 px-6 text-xl hidden max-md:flex"
                >
                  <i className="fi fi-rr-file-edit"></i>
                  <span>Write</span>
                </Link>
                <Link
                  to={`/user/${loggedInUser?.personal_info.username}`}
                  className="p-4 px-6 text-xl"
                >
                  <i className="fi fi-rr-user"></i>
                  <sapn>Profile</sapn>
                </Link>
              </li>
              <li>
                <Link to="/dashboard/posts" className="p-4 px-6 text-xl">
                  <i className="fi fi-rr-dashboard-monitor"></i>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/settings/edit-profile" className="p-4 px-6 text-xl">
                  <i className="fi fi-rr-settings"></i>
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <Link onClick={() => logout()} className="p-4 px-6 text-xl">
                  <i className="fi fi-br-exit"></i>
                  <span>Sign Out</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
