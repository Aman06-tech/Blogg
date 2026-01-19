import { Button, Dropdown, Navbar } from "flowbite-react";
import Avatar from "./Avatar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { HiUser, HiLogout, HiViewGrid, HiPencil } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice.js";
import { signoutSuccess } from "../redux/user/userSlice.js";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const CurrentUser = useSelector((state) => state.user);
  const user = CurrentUser.currentUser;
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

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
      setIsSearchOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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

      {/* Desktop Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <AiOutlineSearch className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-full text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <AiOutlineClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Mobile Search Toggle Button */}
      <Button
        className="w-10 h-10 lg:hidden"
        color="gray"
        pill
        onClick={toggleSearch}
      >
        <AiOutlineSearch className="w-5 h-5" />
      </Button>

      <div className="flex gap-2 md:order-2">
        <button
          className="w-10 h-10 hidden sm:flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110 hover:rotate-12"
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? (
            <FaSun className="w-5 h-5 text-amber-500 transition-transform duration-300" />
          ) : (
            <FaMoon className="w-5 h-5 text-blue-400 transition-transform duration-300" />
          )}
        </button>
        {user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                src={user.profilePicture}
                name={user.username}
                alt={user.username}
                size="md"
                status="online"
                hoverable
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
        <Navbar.Link active={path === "/"} as={"div"} className="focus:outline-none focus:ring-0">
          <Link to="/" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium outline-none">Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as={"div"} className="focus:outline-none focus:ring-0">
          <Link to="/about" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium outline-none">About</Link>
        </Navbar.Link>
      </Navbar.Collapse>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={toggleSearch}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <AiOutlineClose className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <AiOutlineSearch className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 text-lg"
                  autoFocus
                />
              </div>
            </form>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Press Enter to search or Escape to close
            </p>
          </div>
        </div>
      )}
    </Navbar>
  );
}
