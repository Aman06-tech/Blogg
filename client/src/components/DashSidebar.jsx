import {
  HiUser,
  HiDocumentText,
  HiOutlineUserGroup,
  HiLogout,
  HiHome,
  HiPencil,
  HiCog,
  HiBookmark
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import { useEffect, useState } from "react";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const menuItems = [
    {
      name: "Profile",
      icon: HiUser,
      tab: "profile",
      link: "/dashboard?tab=profile",
    },
    {
      name: "My Posts",
      icon: HiDocumentText,
      tab: "posts",
      link: "/dashboard?tab=posts",
    },
    {
      name: "Saved Articles",
      icon: HiBookmark,
      tab: "bookmarks",
      link: "/dashboard?tab=bookmarks",
    },
    ...(currentUser.isAdmin
      ? [
          {
            name: "All Users",
            icon: HiOutlineUserGroup,
            tab: "users",
            link: "/dashboard?tab=users",
          },
        ]
      : []),
  ];

  return (
    <div className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* User Info Section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar
            src={currentUser.profilePicture}
            name={currentUser.username}
            alt={currentUser.username}
            size="lg"
            rounded="xl"
            status="online"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {currentUser.username}
            </h3>
            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
          </div>
        </div>
        {currentUser.isAdmin && (
          <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-md">
            <HiCog className="w-3 h-3" />
            Admin Account
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.tab}>
              <Link
                to={item.link}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                  tab === item.tab
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Quick Actions */}
        <p className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Quick Actions
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              to="/create-post"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <HiPencil className="w-5 h-5" />
              <span>New Post</span>
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <HiHome className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          onClick={handleSignout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <HiLogout className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
