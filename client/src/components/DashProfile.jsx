import { Alert, Button, Modal, TextInput, Label } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import {
  HiOutlineExclamationCircle,
  HiCamera,
  HiPencil,
  HiMail,
  HiLockClosed,
  HiLogout,
  HiTrash,
  HiDocumentText,
  HiCalendar,
  HiShieldCheck
} from "react-icons/hi";
import { motion } from "framer-motion";

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setimageFile] = useState(null);
  const [imageFileUrl, setimageFileUrl] = useState(null);
  const [imageFileUploadProgress, setimageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  // Fetch user's posts count
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts?userId=${currentUser._id}&limit=100`);
        const data = await res.json();
        if (res.ok) {
          setUserPosts(data.posts);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser._id) {
      fetchUserPosts();
    }
  }, [currentUser._id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setimageFile(file);
      setimageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setimageFileUploadProgress(progress.toFixed(0));
      },
      // eslint-disable-next-line no-unused-vars
      (error) => {
        setImageFileUploadError(
          "Could not upload image (file must be less than 2MB)"
        );
        setimageFileUploadProgress(null);
        setimageFile(null);
        setimageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setimageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError("Please wait for image upload to complete");
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("Profile updated successfully!");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message)
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  const memberSince = new Date(currentUser.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          {/* Cover Background */}
          <div className="h-32 bg-slate-900 dark:bg-slate-950 relative">
            <div className="absolute inset-0 [background-size:20px_20px] [background-image:radial-gradient(#475569_1px,transparent_1px)] dark:[background-image:radial-gradient(#334155_1px,transparent_1px)]"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 relative z-10">
              {/* Avatar */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={filePickerRef}
                  hidden
                />
                <div
                  className="relative w-32 h-32 cursor-pointer group"
                  onClick={() => filePickerRef.current.click()}
                >
                  {imageFileUploadProgress && (
                    <CircularProgressbar
                      value={imageFileUploadProgress || 0}
                      text={`${imageFileUploadProgress}%`}
                      strokeWidth={5}
                      styles={{
                        root: {
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 10,
                        },
                        path: {
                          stroke: `rgb(59, 130, 246)`,
                        },
                        text: {
                          fill: '#fff',
                          fontSize: '24px',
                          fontWeight: 'bold',
                        },
                        trail: {
                          stroke: 'rgba(255,255,255,0.3)',
                        }
                      }}
                    />
                  )}
                  <img
                    src={imageFileUrl || currentUser.profilePicture}
                    alt="user"
                    className={`rounded-2xl w-full h-full object-cover border-4 border-white dark:border-slate-800 shadow-lg ring-2 ring-slate-200 dark:ring-slate-700 transition-transform duration-300 group-hover:scale-[1.02] ${
                      imageFileUploadProgress &&
                      imageFileUploadProgress < 100 &&
                      "opacity-60"
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <HiCamera className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 sm:mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentUser.username}
                  </h1>
                  {currentUser.isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                      <HiShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 sm:mb-2">
                <Link to="/create-post">
                  <Button color="dark" size="sm">
                    <HiPencil className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiDocumentText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{userPosts.length}</p>
                <p className="text-xs text-slate-500">Posts</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <HiCalendar className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{memberSince.split(',')[0]}</p>
                <p className="text-xs text-slate-500">Joined</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {imageFileUploadError && (
          <Alert color="failure" className="mb-4">{imageFileUploadError}</Alert>
        )}
        {updateUserSuccess && (
          <Alert color="success" className="mb-4">{updateUserSuccess}</Alert>
        )}
        {updateUserError && (
          <Alert color="failure" className="mb-4">{updateUserError}</Alert>
        )}
        {error && (
          <Alert color="failure" className="mb-4">{error}</Alert>
        )}

        {/* Edit Profile Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <HiPencil className="w-5 h-5" />
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 mb-2 block">
                Username
              </Label>
              <TextInput
                type="text"
                id="username"
                placeholder="Username"
                defaultValue={currentUser.username}
                onChange={handleChange}
                icon={HiPencil}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 mb-2 block">
                Email Address
              </Label>
              <TextInput
                type="email"
                id="email"
                placeholder="Email"
                defaultValue={currentUser.email}
                onChange={handleChange}
                icon={HiMail}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 mb-2 block">
                New Password
              </Label>
              <TextInput
                type="password"
                id="password"
                placeholder="Leave blank to keep current password"
                onChange={handleChange}
                icon={HiLockClosed}
              />
            </div>

            <Button
              type="submit"
              color="dark"
              className="w-full"
              disabled={loading || imageFileUploading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              color="gray"
              onClick={handleSignout}
              className="flex items-center gap-2"
            >
              <HiLogout className="w-4 h-4" />
              Sign Out
            </Button>
            <Button
              color="failure"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2"
            >
              <HiTrash className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Delete Account Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 mb-4 mx-auto" />
            <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
              Delete Account
            </h3>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, Delete My Account
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
