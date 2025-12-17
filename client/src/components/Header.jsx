import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { HiUser, HiCog, HiLogout, HiViewGrid } from "react-icons/hi";
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
    <Navbar className="border-b-2 sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white transition-transform hover:scale-105"
      >
        <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
          Aman's Blog
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
          {theme === 'light' ? <FaSun /> : <FaMoon />}
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
                className="transition-transform hover:scale-110 ring-2 ring-purple-500"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-semibold">@{user.username}</span>
              <span className="block text-sm font-medium truncate text-gray-500">
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
              <Dropdown.Item icon={HiCog}>
                Create Post
              </Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout} icon={HiLogout}>
              Sign Out
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientDuoTone="purpleToPink" outline pill className="transition-transform hover:scale-105">
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link to="/" className="transition-colors">Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as={"div"}>
          <Link to="/about" className="transition-colors">About</Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}