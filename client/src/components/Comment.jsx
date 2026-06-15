import { useEffect, useState } from 'react';
import moment from 'moment';
import { FaThumbsUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Button, Textarea } from 'flowbite-react';
import Avatar from './Avatar';

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/user/${comment.userId}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getUser();
  }, [comment]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comment.content);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        onEdit(comment, editedContent);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl'>
      <div className='flex-shrink-0'>
        <Avatar
          src={user.profilePicture}
          name={user.username}
          alt={user.username}
          size="md"
          ringColor="slate"
        />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex flex-wrap items-center gap-2 mb-2'>
          <span className='font-semibold text-sm text-slate-900 dark:text-white truncate'>
            {user ? `@${user.username}` : 'anonymous user'}
          </span>
          <span className='text-slate-500 dark:text-slate-400 text-xs'>
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        {isEditing ? (
          <>
            <Textarea
              className='mb-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none'
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={3}
            />
            <div className='flex flex-wrap justify-end gap-2'>
              <Button
                type='button'
                size='xs'
                color='dark'
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                type='button'
                size='xs'
                color='gray'
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className='text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3'>
              {comment.content}
            </p>
            <div className='flex flex-wrap items-center gap-3 text-xs'>
              <button
                type='button'
                onClick={() => onLike(comment._id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                  currentUser && comment.likes.includes(currentUser._id)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <FaThumbsUp className='w-3 h-3' />
                {comment.numberOfLikes > 0 && (
                  <span>{comment.numberOfLikes}</span>
                )}
              </button>
              {currentUser &&
                (currentUser._id === comment.userId || currentUser.isAdmin) && (
                  <>
                    <button
                      type='button'
                      onClick={handleEdit}
                      className='text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                    >
                      Edit
                    </button>
                    <button
                      type='button'
                      onClick={() => onDelete(comment._id)}
                      className='text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                    >
                      Delete
                    </button>
                  </>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
