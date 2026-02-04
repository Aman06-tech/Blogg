import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button, Spinner } from "flowbite-react";
import {
  HiArrowLeft,
  HiHeart,
  HiOutlineHeart,
  HiClock,
  HiBookmark,
  HiOutlineBookmark,
  HiShare,
  HiLink,
  HiChevronRight,
} from "react-icons/hi";
import { FaTwitter, FaLinkedin } from "react-icons/fa";
import { useSelector } from "react-redux";
import CommentSection from "../components/CommentSection";
import Avatar from "../components/Avatar";
import AdSense from "../components/AdSense";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

export default function PostPage() {
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [tableOfContents, setTableOfContents] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          setError(false);
          setLoading(false);
          if (currentUser && data.posts[0].likes.includes(currentUser._id)) {
            setLiked(true);
          }
          // Check if post is bookmarked
          if (currentUser) {
            try {
              const bookmarkRes = await fetch(`/api/bookmark/check/${data.posts[0]._id}`);
              const bookmarkData = await bookmarkRes.json();
              if (bookmarkRes.ok) {
                setBookmarked(bookmarkData.bookmarked);
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug, currentUser]);

  // Extract headings for table of contents
  useEffect(() => {
    if (post?.content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.content, "text/html");
      const headings = doc.querySelectorAll("h1, h2, h3");
      const toc = Array.from(headings).map((heading, index) => ({
        id: `heading-${index}`,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1)),
      }));
      setTableOfContents(toc);
    }
  }, [post?.content]);

  // Add IDs to headings in content and track active section
  useEffect(() => {
    if (contentRef.current && tableOfContents.length > 0) {
      const headings = contentRef.current.querySelectorAll("h1, h2, h3");
      headings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: "-100px 0px -70% 0px" }
      );

      headings.forEach((heading) => observer.observe(heading));
      return () => observer.disconnect();
    }
  }, [tableOfContents]);

  const handleLike = async () => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        toast.info('Please sign in to like this post');
        return;
      }
      const res = await fetch(`/api/post/likePost/${post._id}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setLiked(!liked);
        if (!liked) {
          toast.success('Post liked!');
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleBookmark = async () => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        toast.info('Please sign in to bookmark this post');
        return;
      }
      const res = await fetch(`/api/bookmark/toggle/${post._id}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
      }
    } catch (error) {
      console.log(error.message);
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || '';

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const getReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    return Math.ceil(words / wordsPerMinute) || 1;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-slate-950">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white dark:bg-slate-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Article not found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/">
            <Button color="dark">
              <HiArrowLeft className="mr-2 w-5 h-5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <HiChevronRight className="w-4 h-4 text-slate-400" />
            <Link to={`/?category=${post?.category}`} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors capitalize">
              {post?.category}
            </Link>
            <HiChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
              {post?.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
          {/* Main Content */}
          <article className="min-w-0">
            {/* Article Header */}
            <header className="mb-8">
              {/* Category Badge */}
              <Link
                to={`/?category=${post?.category}`}
                className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full mb-4 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                {post?.category}
              </Link>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 dark:text-white leading-tight mb-6">
                {post?.title}
              </h1>

              {/* Author & Meta */}
              <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                {post?.author && (
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={post.author.profilePicture}
                      name={post.author.username}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {post.author.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <HiClock className="w-4 h-4" />
                  <span>{getReadTime(post?.content)} min read</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      liked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {liked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                    <span>{post?.numberOfLikes || 0}</span>
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full transition-all ${
                      bookmarked
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {bookmarked ? <HiBookmark className="w-4 h-4" /> : <HiOutlineBookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post?.image && (
              <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* In-Article Ad */}
            <div className="my-8">
              <AdSense
                adSlot="8158947495"
                adFormat="fluid"
                adLayout="in-article"
              />
            </div>

            {/* Article Content */}
            <div
              ref={contentRef}
              className="prose prose-slate dark:prose-invert max-w-none
                prose-headings:scroll-mt-24
                prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:font-bold prose-h1:text-slate-900 dark:prose-h1:text-white prose-h1:mt-10 prose-h1:mb-4
                prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:font-semibold prose-h2:text-slate-900 dark:prose-h2:text-white prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800
                prose-h3:text-lg prose-h3:sm:text-xl prose-h3:font-semibold prose-h3:text-slate-900 dark:prose-h3:text-white prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-7 prose-p:my-4
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-code:text-sm prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:text-slate-800 dark:prose-code:text-slate-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-normal
                prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-800 prose-pre:my-6
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:my-6
                prose-ul:my-4 prose-ul:text-slate-600 dark:prose-ul:text-slate-300
                prose-ol:my-4 prose-ol:text-slate-600 dark:prose-ol:text-slate-300
                prose-li:my-1
                prose-img:rounded-lg prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post?.content || '') }}
            />

            {/* In-Article Ad after content */}
            <div className="my-8">
              <AdSense
                adSlot="8158947495"
                adFormat="fluid"
                adLayout="in-article"
              />
            </div>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              {/* Share Section */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Share this article:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Share on Twitter"
                    >
                      <FaTwitter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Share on LinkedIn"
                    >
                      <FaLinkedin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Copy link"
                    >
                      <HiLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      liked
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {liked ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                    {post?.numberOfLikes > 0 ? `${post.numberOfLikes}` : 'Like'}
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      bookmarked
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {bookmarked ? <HiBookmark className="w-5 h-5" /> : <HiOutlineBookmark className="w-5 h-5" />}
                    {bookmarked ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Author Card */}
              {post?.author && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={post.author.profilePicture}
                      name={post.author.username}
                      size="xl"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Written by</p>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {post.author.username}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Thanks for reading! If you found this article helpful, consider sharing it with others.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </footer>

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              <CommentSection postId={post?._id} />
            </div>
          </article>

          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              {/* Table of Contents */}
              {tableOfContents.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    On this page
                  </h4>
                  <nav className="space-y-1">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={`block w-full text-left text-sm py-1.5 transition-colors ${
                          item.level === 2 ? 'pl-0' : item.level === 3 ? 'pl-4' : 'pl-0'
                        } ${
                          activeSection === item.id
                            ? 'text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span className={`block truncate ${
                          activeSection === item.id
                            ? 'border-l-2 border-blue-600 dark:border-blue-400 pl-3 -ml-[2px]'
                            : 'border-l-2 border-transparent pl-3 -ml-[2px]'
                        }`}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Quick Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      liked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {liked ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                    <span>{liked ? 'Liked' : 'Like this article'}</span>
                    {post?.numberOfLikes > 0 && (
                      <span className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {post.numberOfLikes}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      bookmarked
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {bookmarked ? <HiBookmark className="w-5 h-5" /> : <HiOutlineBookmark className="w-5 h-5" />}
                    <span>{bookmarked ? 'Saved' : 'Save for later'}</span>
                  </button>

                  <button
                    onClick={() => handleShare('copy')}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <HiShare className="w-5 h-5" />
                    <span>Share article</span>
                  </button>
                </div>
              </div>

              {/* Back to top */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <HiArrowLeft className="w-4 h-4 rotate-90" />
                Back to top
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
