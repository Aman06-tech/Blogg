import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { HiUser, HiLogout, HiViewGrid, HiPencil } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice.js";
import { signoutSuccess } from "../redux/user/userSlice.js";
import { useState } from "react";

export default function Header() {
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const CurrentUser = useSelector((state) => state.user);
  const user = CurrentUser.currentUser;
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm}`);
    }
  };

  return (
    <Navbar className="border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm">
      <Link
        to="/"
        className="self-center transition-transform hover:scale-105"
      >
        <span className="text-xl sm:text-2xl font-bold">
          <span className="text-blue-600">daily</span>
          <span className="text-slate-700 dark:text-slate-200 relative">
            bloggs
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 rounded-full"></span>
          </span>
        </span>
      </Link>
      <form onSubmit={handleSearchSubmit}>
        <TextInput
          type="text"
          placeholder="Search posts..."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
      <Button
        className="w-12 h-10 lg:hidden"
        color="gray"
        onClick={() => {
          const term = prompt('Search posts:');
          if (term) navigate(`/?search=${term}`);
        }}
      >
        <AiOutlineSearch />
      </Button>
      <div className="flex gap-2 md:order-2">
        <Button
          className="w-12 h-10 hidden sm:inline transition-transform hover:scale-110"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'light' ? <FaSun className="text-amber-500" /> : <FaMoon className="text-slate-300" />}
        </Button>
        {user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="user"
                img={user.profilePicture}
                rounded
                className="transition-transform hover:scale-110 ring-2 ring-slate-300 dark:ring-slate-600"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">@{user.username}</span>
              <span className="block text-sm font-medium truncate text-slate-500">
                {user.email}
              </span>
            </Dropdown.Header>
            <Link to="/dashboard?tab=profile">
              <Dropdown.Item icon={HiUser}>
                Profile
              </Dropdown.Item>
            </Link>
            <Link to="/dashboard">
              <Dropdown.Item icon={HiViewGrid}>
                Dashboard
              </Dropdown.Item>
            </Link>
            <Link to="/create-post">
              <Dropdown.Item icon={HiPencil}>
                Create Post
              </Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout} icon={HiLogout} className="text-red-600">
              Sign Out
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button color="dark" pill className="transition-transform hover:scale-105">
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link to="/" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as={"div"}>
          <Link to="/about" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">About</Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
