import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FileInput, Select, TextInput, Label, Spinner } from "flowbite-react";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { app } from "../firebase";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { HiUpload, HiPhotograph, HiDocumentText, HiTag } from "react-icons/hi";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const navigate = useNavigate();

  // Auto upload image when file is selected
  useEffect(() => {
    if (file) {
      handleUploadImage();
    }
  }, [file]);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError(error);
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setPublishing(true);
      setPublishError(null);
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        setPublishing(false);
        return;
      }
      if (res.ok) {
        setPublishError(null);
        setPublishing(false);
        toast.success("Blog post published successfully!");
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError("Something went wrong");
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Create New Post
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Share your thoughts with the world</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Title and Category Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                  <HiDocumentText className="w-5 h-5" />
                  <span className="font-medium">Post Title</span>
                </Label>
                <TextInput
                  type="text"
                  placeholder="Enter an engaging title..."
                  required
                  id="title"
                  sizing="lg"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category" className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                  <HiTag className="w-5 h-5" />
                  <span className="font-medium">Category</span>
                </Label>
                <Select
                  id="category"
                  sizing="lg"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="uncategorized">Select a category</option>
                  <option value="personal">Personal Blog</option>
                  <option value="professional">Professional Blog</option>
                  <option value="educational">Educational Blog</option>
                  <option value="news">News and Current Affairs</option>
                  <option value="technology">Technology Blog</option>
                  <option value="creative">Creative Writing</option>
                  <option value="multimedia">Multimedia Blog</option>
                  <option value="climate">Climate Blog</option>
                  <option value="medical">Medical Blog</option>
                </Select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <HiPhotograph className="w-5 h-5" />
                <span className="font-medium">Featured Image</span>
                {imageUploadProgress && (
                  <span className="text-sm text-slate-500">
                    (Uploading: {imageUploadProgress}%)
                  </span>
                )}
              </Label>
              <div className="border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={imageUploadProgress !== null}
                  helperText="Image will upload automatically when selected"
                />
                {imageUploadProgress && (
                  <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                      <div
                        className="bg-slate-900 dark:bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${imageUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
              {formData.image && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={formData.image}
                    alt="upload"
                    className="w-full h-72 object-cover"
                  />
                </motion.div>
              )}
            </div>

            {/* Content Editor Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <HiDocumentText className="w-5 h-5" />
                <span className="font-medium">Content</span>
              </Label>
              <ReactQuill
                theme="snow"
                placeholder="Write your amazing content here..."
                className="h-72 mb-12"
                required
                onChange={(value) => { setFormData({ ...formData, content: value }) }}
              />
            </div>

            {/* Publish Button */}
            {publishError && <Alert color="failure">{publishError}</Alert>}
            <Button
              type="submit"
              color="dark"
              size="lg"
              className="w-full"
              disabled={publishing}
            >
              {publishing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <HiUpload className="mr-2 w-5 h-5" />
                  Publish Post
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
