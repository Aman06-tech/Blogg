import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import { BsFacebook, BsGithub, BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

export default function FooterCom() {
  return (
    <Footer container className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-none">
      <div className="w-full max-w-7xl mx-auto py-10">
        <div className="grid w-full justify-between sm:flex md:grid-col-1">
          <div className="mb-8 sm:mb-0">
            <Link
              to="/"
              className="self-center"
            >
              <span className="text-2xl font-bold">
                <span className="text-blue-600">daily</span>
                <span className="text-slate-700 dark:text-slate-200 relative">
                  bloggs
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 rounded-full"></span>
                </span>
              </span>
            </Link>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
              Sharing insights, tutorials, and stories about technology and development.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12">
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider mb-4">About</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/Aman06-tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider mb-4">Follow Us</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/Aman06-tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/amanpal06"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-8"></div>

        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} <Link to="/" className="hover:text-slate-900 dark:hover:text-white">dailybloggs</Link>. All Rights Reserved.
          </span>
          <div className="flex gap-5 mt-4 sm:mt-0">
            <a href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110">
              <BsFacebook size={18} />
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110">
              <BsInstagram size={18} />
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110">
              <BsTwitter size={18} />
            </a>
            <a href="https://github.com/Aman06-tech" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110">
              <BsGithub size={18} />
            </a>
            <a href="https://www.linkedin.com/in/amanpal06" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110">
              <BsLinkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </Footer>
  );
}
