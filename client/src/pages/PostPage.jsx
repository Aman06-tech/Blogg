import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button, Spinner } from "flowbite-react";
import { HiArrowLeft, HiCalendar, HiTag, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useSelector } from "react-redux";
import CommentSection from "../components/CommentSection";
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
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug, currentUser]);

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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <Link to="/">
          <Button gradientDuoTone="purpleToPink">Go back home</Button>
        </Link>
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back Button */}
        <Link to="/">
          <Button color="gray" className="mb-6">
            <HiArrowLeft className="mr-2 w-5 h-5" />
            Back to Home
          </Button>
        </Link>

        {/* Post Header */}
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Featured Image */}
          {post && post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          )}

          {/* Post Content */}
          <div className="p-8">
            {/* Category and Date */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <HiTag className="w-4 h-4 mr-2 text-indigo-600" />
                <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full font-medium">
                  {post && post.category}
                </span>
              </div>
              <div className="flex items-center">
                <HiCalendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                <span>
                  {post && new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-gray-500">
                {post && (post.content.length / 1000).toFixed(0)} min read
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post && post.title}
            </h1>

            {/* Divider */}
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mb-8"></div>

            {/* Post Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-pre:bg-gray-800 prose-pre:text-gray-100"
              dangerouslySetInnerHTML={{ __html: post && DOMPurify.sanitize(post.content) }}
            ></div>

            {/* Like Button Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    liked
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900'
                  }`}
                >
                  {liked ? (
                    <HiHeart className="w-6 h-6" />
                  ) : (
                    <HiOutlineHeart className="w-6 h-6" />
                  )}
                  <span>
                    {post.numberOfLikes > 0
                      ? `${post.numberOfLikes} ${post.numberOfLikes === 1 ? 'Like' : 'Likes'}`
                      : 'Like this post'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Comment Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          <CommentSection postId={post._id} />
        </div>

        {/* Back to Home */}
        <div className="mt-10 text-center">
          <Link to="/">
            <Button gradientDuoTone="purpleToPink" size="lg">
              <HiArrowLeft className="mr-2 w-5 h-5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
