import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, FileInput, Select, TextInput, Spinner, Modal } from "flowbite-react";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { app } from "../firebase";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import {
  HiUpload,
  HiPhotograph,
  HiDocumentText,
  HiTag,
  HiLightningBolt,
  HiSparkles,
  HiX,
  HiArrowLeft,
  HiEye,
  HiBookOpen,
  HiPencil,
  HiClock,
  HiCalendar,
  HiHeart,
  HiChip,
  HiRefresh,
  HiCheck,
  HiClipboardCopy
} from "react-icons/hi";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState(null);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);

  // Inline AI states
  const [showInlineAi, setShowInlineAi] = useState(false);
  const [inlineAiPosition, setInlineAiPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState(null);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const quillRef = useRef(null);

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // Calculate read time
  const getReadTime = (content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    return Math.ceil(words / wordsPerMinute) || 1;
  };

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
          setImageUploadError("Upload failed. Please try again.");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
            toast.success("Image uploaded successfully!");
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setFile(null);
  };

  // AI Enhancement Functions
  const handleAiEnhance = async (enhanceType) => {
    const content = formData.content?.replace(/<[^>]*>/g, '') || '';
    if (!content || content.trim().length < 10) {
      toast.error("Please write some content first (at least 10 characters)");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setEnhancedContent(null);

    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, enhanceType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to enhance content");
      }

      setEnhancedContent(data.enhancedContent);
      setShowEnhancedPreview(true);
      toast.success("Content enhanced successfully!");
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      setAiError(error.message);
      toast.error(error.message || "Failed to enhance content");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateTitles = async () => {
    const content = formData.content?.replace(/<[^>]*>/g, '') || formData.title || '';
    if (!content || content.trim().length < 10) {
      toast.error("Please write some content or a title first");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/ai/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate titles");
      }

      setTitleSuggestions(data.titles);
      setShowTitleSuggestions(true);
      toast.success("Title suggestions generated!");
    } catch (error) {
      console.error("Title Generation Error:", error);
      setAiError(error.message);
      toast.error(error.message || "Failed to generate titles");
    } finally {
      setAiLoading(false);
    }
  };

  const applyEnhancedContent = () => {
    if (enhancedContent) {
      setFormData({ ...formData, content: `<p>${enhancedContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>` });
      setShowEnhancedPreview(false);
      setEnhancedContent(null);
      toast.success("Enhanced content applied!");
    }
  };

  const selectTitle = (title) => {
    setFormData({ ...formData, title });
    setShowTitleSuggestions(false);
    toast.success("Title selected!");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Inline AI - Handle text selection in Quill editor
  const handleTextSelection = useCallback(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const selection = quill.getSelection();

    if (selection && selection.length > 0) {
      const text = quill.getText(selection.index, selection.length);
      if (text.trim().length >= 3) {
        setSelectedText(text);
        setSelectionRange(selection);

        // Get position for the floating toolbar
        const bounds = quill.getBounds(selection.index, selection.length);
        const editorContainer = quill.container.getBoundingClientRect();

        setInlineAiPosition({
          top: bounds.top + editorContainer.top - 50,
          left: bounds.left + editorContainer.left + (bounds.width / 2),
        });
        setShowInlineAi(true);
      }
    } else {
      // Delay hiding to allow clicking on toolbar
      setTimeout(() => {
        if (!document.querySelector('.inline-ai-toolbar:hover')) {
          setShowInlineAi(false);
        }
      }, 200);
    }
  }, []);

  // Inline AI - Enhance selected text
  const handleInlineAiEnhance = async (enhanceType) => {
    if (!selectedText || selectedText.trim().length < 3) {
      toast.error("Please select some text first");
      return;
    }

    setAiLoading(true);
    setShowInlineAi(false);

    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: selectedText, enhanceType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to enhance content");
      }

      // Replace selected text with enhanced content
      if (quillRef.current && selectionRange) {
        const quill = quillRef.current.getEditor();
        quill.deleteText(selectionRange.index, selectionRange.length);
        quill.insertText(selectionRange.index, data.enhancedContent);
        quill.setSelection(selectionRange.index + data.enhancedContent.length);
      }

      toast.success(`Text ${enhanceType === 'grammar' ? 'fixed' : enhanceType + 'd'} successfully!`);
    } catch (error) {
      console.error("Inline AI Error:", error);
      toast.error(error.message || "Failed to enhance text");
    } finally {
      setAiLoading(false);
      setSelectedText("");
      setSelectionRange(null);
    }
  };

  // Setup Quill selection listener
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.on('selection-change', handleTextSelection);

      return () => {
        quill.off('selection-change', handleTextSelection);
      };
    }
  }, [handleTextSelection]);

  // Close inline AI and AI menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.inline-ai-toolbar') && !e.target.closest('.ql-editor')) {
        setShowInlineAi(false);
      }
      // Close AI menu when clicking outside
      if (!e.target.closest('.ql-ai-assist') && !e.target.closest('[class*="ai-menu"]') && showAiMenu) {
        setShowAiMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAiMenu]);

  // Quill modules with custom toolbar including AI button
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
        ['ai-assist'], // Custom AI button
      ],
    }
  };

  // Add custom AI button to Quill toolbar after mount
  useEffect(() => {
    const addAiButton = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar && !toolbar.querySelector('.ql-ai-assist')) {
        const aiButton = document.querySelector('.ql-ai-assist');
        if (aiButton) {
          aiButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>`;
          aiButton.title = 'AI Assistant';
          aiButton.style.color = '#8b5cf6';
        }
      }
    };

    // Small delay to ensure toolbar is rendered
    const timer = setTimeout(addAiButton, 100);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { value: "uncategorized", label: "Select a category", icon: "📁" },
    { value: "technology", label: "Technology", icon: "💻" },
    { value: "personal", label: "Personal", icon: "✨" },
    { value: "educational", label: "Educational", icon: "📚" },
    { value: "creative", label: "Creative Writing", icon: "🎨" },
    { value: "news", label: "News & Current Affairs", icon: "📰" },
    { value: "professional", label: "Professional", icon: "💼" },
    { value: "climate", label: "Climate & Environment", icon: "🌍" },
    { value: "medical", label: "Health & Medical", icon: "🏥" },
    { value: "multimedia", label: "Multimedia", icon: "🎬" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard?tab=posts" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <HiArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HiPencil className="w-5 h-5" />
                  Create New Post
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Draft your next masterpiece</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                color="gray"
                size="sm"
                className="hidden sm:flex"
                onClick={() => setShowPreview(true)}
                disabled={!formData.title && !formData.content}
              >
                <HiEye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                color="dark"
                size="sm"
                onClick={handleSubmit}
                disabled={publishing || !formData.title || !formData.content}
              >
                {publishing ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <HiUpload className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Editor Area */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Title Input */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                <input
                  type="text"
                  placeholder="Enter your post title..."
                  className="w-full text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  value={formData.title || ''}
                />
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">
                    {formData.title?.length || 0} characters
                    {formData.title?.length > 60 && (
                      <span className="text-amber-500 ml-2">Consider a shorter title for SEO</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Featured Image */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <HiPhotograph className="w-5 h-5 text-slate-500" />
                    Featured Image
                  </h3>
                  {formData.image && (
                    <button
                      onClick={removeImage}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <HiX className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                {formData.image ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-xl overflow-hidden"
                  >
                    <img
                      src={formData.image}
                      alt="Featured"
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </motion.div>
                ) : (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={imageUploadProgress !== null}
                    />
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <HiPhotograph className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {imageUploadProgress ? `Uploading... ${imageUploadProgress}%` : 'Drop your image here, or click to browse'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      {imageUploadProgress && (
                        <div className="w-full max-w-xs mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${imageUploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {imageUploadError && (
                  <Alert color="failure" className="mt-4">{imageUploadError}</Alert>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Content Editor */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <HiDocumentText className="w-5 h-5 text-slate-500" />
                  Content
                </h3>
                <div className="prose-editor relative [&_.ql-toolbar]:border-slate-200 [&_.ql-toolbar]:dark:border-slate-700 [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:bg-slate-50 [&_.ql-toolbar]:dark:bg-slate-800 [&_.ql-container]:border-slate-200 [&_.ql-container]:dark:border-slate-700 [&_.ql-container]:rounded-b-xl [&_.ql-container]:min-h-[300px] [&_.ql-container]:sm:min-h-[400px] [&_.ql-editor]:text-slate-900 [&_.ql-editor]:dark:text-slate-100 [&_.ql-editor.ql-blank::before]:text-slate-400">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    modules={quillModules}
                    placeholder="Start writing your story... (Select text for AI options)"
                    onChange={(value) => { setFormData({ ...formData, content: value }) }}
                    value={formData.content || ''}
                  />

                  {/* AI Toolbar Dropdown Menu */}
                  <AnimatePresence>
                    {showAiMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-12 right-4 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 min-w-[200px]"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                          <HiSparkles className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">AI Assistant</span>
                        </div>
                        <button
                          onClick={() => { handleInlineAiEnhance('improve'); setShowAiMenu(false); }}
                          disabled={aiLoading || !selectedText}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <HiSparkles className="w-4 h-4 text-purple-500" />
                          Improve Writing
                        </button>
                        <button
                          onClick={() => { handleInlineAiEnhance('grammar'); setShowAiMenu(false); }}
                          disabled={aiLoading || !selectedText}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <HiCheck className="w-4 h-4 text-green-500" />
                          Fix Grammar
                        </button>
                        <button
                          onClick={() => { handleInlineAiEnhance('expand'); setShowAiMenu(false); }}
                          disabled={aiLoading || !selectedText}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <HiDocumentText className="w-4 h-4 text-blue-500" />
                          Expand Content
                        </button>
                        <button
                          onClick={() => { handleInlineAiEnhance('summarize'); setShowAiMenu(false); }}
                          disabled={aiLoading || !selectedText}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <HiBookOpen className="w-4 h-4 text-amber-500" />
                          Summarize
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                          <button
                            onClick={() => { handleGenerateTitles(); setShowAiMenu(false); }}
                            disabled={aiLoading}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <HiLightningBolt className="w-4 h-4 text-rose-500" />
                            Generate Titles
                          </button>
                        </div>
                        {!selectedText && (
                          <p className="px-3 py-2 text-xs text-slate-400 italic">
                            Select text first for enhance options
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Loading Indicator */}
                  {aiLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center rounded-xl z-10">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-lg">
                        <Spinner size="sm" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">AI is working...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline AI hint */}
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <HiSparkles className="w-3 h-3" />
                  Click the sparkle icon in toolbar or select text for AI tools
                </p>
              </div>
            </motion.div>

            {/* Error Display */}
            {publishError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert color="failure">{publishError}</Alert>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Category Selection */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <HiTag className="w-5 h-5 text-slate-500" />
                  Category
                </h3>
                <Select
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  value={formData.category || 'uncategorized'}
                  className="w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </Select>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {categories.slice(1, 5).map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                        formData.category === cat.value
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {/* AI Assistant Panel - Simplified */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-4 sm:p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <HiChip className="w-5 h-5 text-purple-500" />
                  AI Assistant
                </h3>

                {/* Inline AI Instructions */}
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <HiSparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Inline AI</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Select any text in the editor to see AI options: Improve, Fix, Expand, or Shorten
                      </p>
                    </div>
                  </div>
                </div>

                {/* Generate Titles - Keep this as it's useful */}
                <button
                  onClick={handleGenerateTitles}
                  disabled={aiLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all text-left disabled:opacity-50"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <HiLightningBolt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">Generate Titles</p>
                    <p className="text-xs text-slate-500">Get AI-suggested headlines</p>
                  </div>
                  {aiLoading && <Spinner size="sm" />}
                </button>

                {aiError && (
                  <Alert color="failure" className="mt-4 text-sm">{aiError}</Alert>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              {/* Writing Tips */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <HiLightningBolt className="w-5 h-5 text-amber-500" />
                  Writing Tips
                </h3>
                <ul className="space-y-3">
                  {[
                    { icon: "✍️", text: "Start with a compelling hook to grab attention" },
                    { icon: "📝", text: "Use short paragraphs for better readability" },
                    { icon: "🖼️", text: "Add a featured image to increase engagement" },
                    { icon: "🏷️", text: "Choose the right category for discoverability" },
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-lg">{tip.icon}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              {/* Publishing Checklist */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <HiSparkles className="w-5 h-5 text-purple-500" />
                  Ready to Publish?
                </h3>
                <ul className="space-y-2">
                  {[
                    { label: "Add a title", done: !!formData.title },
                    { label: "Write content", done: !!formData.content && formData.content !== '<p><br></p>' },
                    { label: "Upload featured image", done: !!formData.image },
                    { label: "Select a category", done: formData.category && formData.category !== 'uncategorized' },
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        item.done
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {item.done ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                        )}
                      </div>
                      <span className={`text-sm ${
                        item.done
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Mobile Publish Button */}
                <Button
                  color="dark"
                  className="w-full mt-6 lg:hidden"
                  onClick={handleSubmit}
                  disabled={publishing || !formData.title || !formData.content}
                >
                  {publishing ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <HiUpload className="w-4 h-4 mr-2" />
                      Publish Post
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPreview(false)}
            />

            {/* Modal Content */}
            <div className="relative min-h-screen flex items-start justify-center p-4 pt-10 sm:pt-20">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-4xl bg-slate-50 dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Preview Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <HiEye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Preview Mode</h3>
                        <p className="text-xs text-slate-500">This is how your post will appear to readers</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <HiX className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Preview Content - Mimics PostPage */}
                <div className="p-4 sm:p-6">
                  <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Featured Image */}
                    {formData.image ? (
                      <div className="relative">
                        <img
                          src={formData.image}
                          alt={formData.title || 'Featured image'}
                          className="w-full h-48 sm:h-64 md:h-80 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="h-48 sm:h-64 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <div className="text-center">
                          <HiPhotograph className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">No featured image</p>
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="p-4 sm:p-6 md:p-8">
                      {/* Category, Date, and Read Time */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center">
                          <HiTag className="w-4 h-4 mr-2 text-slate-500" />
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize">
                            {formData.category || 'uncategorized'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <HiCalendar className="w-4 h-4 mr-2" />
                          <span className="text-xs sm:text-sm">
                            {new Date().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <HiClock className="w-4 h-4 mr-2" />
                          <span className="text-xs sm:text-sm">{getReadTime(formData.content)} min read</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                        {formData.title || 'Your Post Title'}
                      </h1>

                      {/* Author Info */}
                      <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200 dark:border-slate-800">
                        <img
                          src={currentUser?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                          alt={currentUser?.username}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                            {currentUser?.username || 'Author'}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500">Author</p>
                        </div>
                      </div>

                      {/* Post Content */}
                      {formData.content ? (
                        <div
                          className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none
                            prose-headings:text-slate-900 dark:prose-headings:text-white
                            prose-p:text-slate-700 dark:prose-p:text-slate-300
                            prose-a:text-blue-600 hover:prose-a:text-blue-700
                            prose-strong:text-slate-900 dark:prose-strong:text-white
                            prose-code:text-blue-600 dark:prose-code:text-blue-400
                            prose-pre:bg-slate-800 prose-pre:text-slate-100
                            prose-img:rounded-xl prose-img:shadow-md"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }}
                        />
                      ) : (
                        <div className="text-center py-12">
                          <HiDocumentText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500">Start writing to see your content here</p>
                        </div>
                      )}

                      {/* Like Button Preview */}
                      <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <button
                            disabled
                            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm sm:text-base cursor-not-allowed opacity-70"
                          >
                            <HiHeart className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Like this post</span>
                          </button>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Likes will be enabled after publishing
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Preview Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      color="gray"
                      onClick={() => setShowPreview(false)}
                    >
                      <HiPencil className="w-4 h-4 mr-2" />
                      Continue Editing
                    </Button>
                    <Button
                      color="dark"
                      onClick={(e) => {
                        setShowPreview(false);
                        handleSubmit(e);
                      }}
                      disabled={publishing || !formData.title || !formData.content}
                    >
                      {publishing ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <HiUpload className="w-4 h-4 mr-2" />
                          Publish Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Suggestions Modal */}
      <AnimatePresence>
        {showTitleSuggestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTitleSuggestions(false)}
            />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <HiLightningBolt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Title Suggestions</h3>
                        <p className="text-xs text-slate-500">Click to select a title</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTitleSuggestions(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <HiX className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {titleSuggestions.map((title, index) => (
                      <button
                        key={index}
                        onClick={() => selectTitle(title)}
                        className="w-full p-4 text-left bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-slate-900 dark:text-white font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                            {title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      color="gray"
                      className="flex-1"
                      onClick={handleGenerateTitles}
                      disabled={aiLoading}
                    >
                      <HiRefresh className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button
                      color="dark"
                      className="flex-1"
                      onClick={() => setShowTitleSuggestions(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Content Preview Modal */}
      <AnimatePresence>
        {showEnhancedPreview && enhancedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEnhancedPreview(false)}
            />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <HiSparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Enhanced Content</h3>
                        <p className="text-xs text-slate-500">Review the AI-enhanced version</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEnhancedPreview(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <HiX className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                        {enhancedContent}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3">
                  <Button
                    color="gray"
                    onClick={() => copyToClipboard(enhancedContent)}
                  >
                    <HiClipboardCopy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => setShowEnhancedPreview(false)}
                  >
                    Discard
                  </Button>
                  <Button
                    color="dark"
                    className="flex-1 sm:flex-none"
                    onClick={applyEnhancedContent}
                  >
                    <HiCheck className="w-4 h-4 mr-2" />
                    Apply to Post
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline AI Floating Toolbar */}
      <AnimatePresence>
        {showInlineAi && !aiLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="inline-ai-toolbar fixed z-50"
            style={{
              top: `${inlineAiPosition.top}px`,
              left: `${inlineAiPosition.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-1.5 flex items-center gap-1">
              <button
                onClick={() => handleInlineAiEnhance('improve')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                title="Improve writing"
              >
                <HiSparkles className="w-3.5 h-3.5 text-purple-500" />
                Improve
              </button>
              <button
                onClick={() => handleInlineAiEnhance('grammar')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Fix grammar"
              >
                <HiCheck className="w-3.5 h-3.5 text-green-500" />
                Fix
              </button>
              <button
                onClick={() => handleInlineAiEnhance('expand')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Expand content"
              >
                <HiDocumentText className="w-3.5 h-3.5 text-blue-500" />
                Expand
              </button>
              <button
                onClick={() => handleInlineAiEnhance('summarize')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                title="Summarize"
              >
                <HiBookOpen className="w-3.5 h-3.5 text-amber-500" />
                Shorten
              </button>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-0.5"></div>
              <button
                onClick={() => setShowInlineAi(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Close"
              >
                <HiX className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Arrow pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
