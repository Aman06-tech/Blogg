import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { HiHome, HiArrowLeft } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        {/* Animated 404 */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-9xl md:text-[200px] font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to another location.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/">
            <Button gradientDuoTone="purpleToPink" size="lg">
              <HiHome className="mr-2 w-5 h-5" />
              Go Home
            </Button>
          </Link>
          <Button
            color="gray"
            size="lg"
            onClick={() => window.history.back()}
          >
            <HiArrowLeft className="mr-2 w-5 h-5" />
            Go Back
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mt-12"
        >
          <svg
            className="w-64 h-64 mx-auto opacity-20"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              className="text-purple-600 dark:text-purple-400"
              d="M47.1,-57.1C59.9,-45.8,68.5,-29.2,71.6,-11.9C74.7,5.4,72.2,23.4,63.3,37.8C54.4,52.2,39,63,22.6,67.4C6.2,71.8,-11.2,69.8,-27.1,63.4C-43,57,-57.4,46.2,-65.3,31.8C-73.2,17.4,-74.6,-0.6,-69.8,-16.3C-65,-32,-54,-45.4,-40.8,-56.6C-27.6,-67.8,-12.3,-76.8,2.3,-79.5C16.9,-82.2,34.3,-68.4,47.1,-57.1Z"
              transform="translate(100 100)"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
