import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";
import { motion } from "framer-motion";
import { HiMail, HiLockClosed } from "react-icons/hi";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const { loading, error: errorMessage } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    // Clear validation error for this field
    setValidationErrors({ ...validationErrors, [e.target.id]: '' });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        dispatch(signInFailure(data.message));
        return;
      }
      
      dispatch(signInSuccess(data.user));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Left side - Branding */}
          <div className="flex-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-12 text-white flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-lg opacity-90 mb-6">
                Sign in to continue your journey and explore amazing content.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <p>Access exclusive content</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <p>Engage with the community</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <p>Create and share posts</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 p-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Enter your credentials to access your account</p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email" value="Email Address" className="mb-2 block" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <HiMail className="w-5 h-5 text-gray-400" />
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
                  <Label htmlFor="password" value="Password" className="mb-2 block" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <HiLockClosed className="w-5 h-5 text-gray-400" />
                    </div>
                    <TextInput
                      type="password"
                      placeholder="••••••••"
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
                  gradientDuoTone="purpleToPink"
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner size='sm' />
                      <span className='pl-3'>Signing in...</span>
                    </>
                  ) : "Sign In"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <OAuth />
              </form>

              <div className="flex gap-2 text-sm mt-6 justify-center">
                <span className="text-gray-600 dark:text-gray-400">Don't have an account?</span>
                <Link to="/sign-up" className="text-indigo-500 font-bold hover:underline">
                  Sign Up
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}