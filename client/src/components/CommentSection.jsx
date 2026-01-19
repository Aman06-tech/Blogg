import { Alert, Button, Modal, Textarea } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import Avatar from './Avatar';
import { HiOutlineExclamationCircle, HiChat } from 'react-icons/hi';
import { toast } from 'react-toastify';

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200) {
      return;
    }
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComment('');
        setCommentError(null);
        setComments([data, ...comments]);
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : c
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = async (comment, editedContent) => {
    setComments(
      comments.map((c) =>
        c._id === comment._id ? { ...c, content: editedContent } : c
      )
    );
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(comments.filter((c) => c._id !== commentId));
        toast.success('Comment deleted successfully!');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='w-full p-4 sm:p-6'>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <HiChat className="w-5 h-5 text-slate-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Comments
        </h3>
        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-full">
          {comments.length}
        </span>
      </div>

      {currentUser ? (
        <div className='flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400'>
          <p>Commenting as</p>
          <Avatar
            src={currentUser.profilePicture}
            name={currentUser.username}
            size="xs"
            showRing={false}
          />
          <Link
            to={'/dashboard?tab=profile'}
            className='text-slate-700 dark:text-slate-300 font-medium hover:underline'
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className='text-sm text-slate-600 dark:text-slate-400 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl'>
          <span>You must be signed in to comment. </span>
          <Link className='text-blue-600 dark:text-blue-400 font-medium hover:underline' to={'/sign-in'}>
            Sign In
          </Link>
        </div>
      )}

      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className='border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6 bg-slate-50 dark:bg-slate-800/50'
        >
          <Textarea
            placeholder='Write a comment...'
            rows='3'
            maxLength='200'
            onChange={(e) => setComment(e.target.value)}
            value={comment}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-slate-400 resize-none"
          />
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4'>
            <p className='text-slate-500 dark:text-slate-400 text-xs sm:text-sm'>
              {200 - comment.length} characters remaining
            </p>
            <Button color="dark" type='submit' size="sm">
              Post Comment
            </Button>
          </div>
          {commentError && (
            <Alert color='failure' className='mt-4'>
              {commentError}
            </Alert>
          )}
        </form>
      )}

      {comments.length === 0 ? (
        <div className='text-center py-8'>
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <HiChat className="w-6 h-6 text-slate-400" />
          </div>
          <p className='text-slate-500 dark:text-slate-400'>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={(commentId) => {
                setShowModal(true);
                setCommentToDelete(commentId);
              }}
            />
          ))}
        </div>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-red-500 mb-4 mx-auto' />
            <h3 className='mb-2 text-xl font-semibold text-slate-900 dark:text-white'>
              Delete Comment
            </h3>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className='flex justify-center gap-4'>
              <Button
                color='failure'
                onClick={() => handleDelete(commentToDelete)}
              >
                Yes, Delete
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
