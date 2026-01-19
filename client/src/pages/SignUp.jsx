import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { motion } from "framer-motion";
import { HiUser, HiMail, HiLockClosed } from "react-icons/hi";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    setValidationErrors({ ...validationErrors, [e.target.id]: '' });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      errors.username = 'Username must not exceed 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      errors.password = 'Password must include uppercase, lowercase, number, and special character';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      if (res.ok) {
        navigate('/sign-in');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Left side - Branding */}
          <div className="flex-1 bg-slate-900 dark:bg-slate-950 p-6 sm:p-8 md:p-12 text-white flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Join Our Community</h1>
              <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8">
                Create an account to start sharing your thoughts and connect with amazing people.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="text-slate-300">Create and publish posts</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="text-slate-300">Join discussions</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="text-slate-300">Build your audience</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 p-6 sm:p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">Fill in your details to get started</p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="username" value="Username" className="mb-2 block text-slate-700 dark:text-slate-300" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <HiUser className="w-5 h-5 text-slate-400" />
                    </div>
                    <TextInput
                      type="text"
                      placeholder="johndoe"
                      id="username"
                      onChange={handleChange}
                      className="pl-10"
                      color={validationErrors.username ? 'failure' : 'gray'}
                    />
                  </div>
                  {validationErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" value="Email Address" className="mb-2 block text-slate-700 dark:text-slate-300" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <HiMail className="w-5 h-5 text-slate-400" />
                    </div>
                    <TextInput
                      type="email"
                      placeholder="your@email.com"
                      id="email"
                      onChange={handleChange}
                      className="pl-10"
                      color={validationErrors.email ? 'failure' : 'gray'}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" value="Password" className="mb-2 block text-slate-700 dark:text-slate-300" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <HiLockClosed className="w-5 h-5 text-slate-400" />
                    </div>
                    <TextInput
                      type="password"
                      placeholder="Create a strong password"
                      id="password"
                      onChange={handleChange}
                      className="pl-10"
                      color={validationErrors.password ? 'failure' : 'gray'}
                    />
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>

                {errorMessage && (
                  <Alert color="failure" className="mb-4">
                    {errorMessage}
                  </Alert>
                )}

                <Button
                  color="dark"
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner size='sm' />
                      <span className='pl-3'>Creating account...</span>
                    </>
                  ) : "Create Account"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <OAuth />
              </form>

              <div className="flex gap-2 text-sm mt-6 justify-center">
                <span className="text-slate-600 dark:text-slate-400">Already have an account?</span>
                <Link to="/sign-in" className="text-slate-900 dark:text-white font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
