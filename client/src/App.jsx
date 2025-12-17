import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute.jsx";
import OnlyAdminPrivateRoute from "./components/OnlyAdminPrivateRoute.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import UpdatePost from "./pages/updatePost.jsx";
import PostPage from "./pages/PostPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";


export default function App() {
  const { theme } = useSelector((state) => state.theme);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Header />
        <Routes>
          <Route>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />

            {/* Protected Routes - Require Login */}
            <Route element={<PrivateRoute />}>
              <Route path="/post/:postSlug" element={<PostPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-post"  element={<CreatePost />} />
              <Route path="/update-post/:postId"  element={<UpdatePost />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
