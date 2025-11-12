
import { Avatar, Button } from "flowbite-react";
import { FaCheckCircle, FaUsers, FaLightbulb, FaRocket, FaHeart } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      
      {/* Hero Section */}
      <section className="px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About Our Journey
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We're passionate storytellers, developers, and innovators sharing knowledge 
            to help you build amazing things.
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                We believe that knowledge should be accessible to everyone. Our mission is to create 
                high-quality, practical content that empowers developers, designers, and tech enthusiasts 
                to build better solutions and advance their careers.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                From beginner tutorials to advanced architectural patterns, we cover the full spectrum 
                of modern web development, always focusing on real-world applications and best practices.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <Avatar 
                  img="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=300&fit=crop&crop=face" 
                  rounded={true} 
                  size="xl"
                  className="w-48 h-48 animate-float shadow-2xl"
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse-glow"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our values guide everything we do, from the content we create to the community we build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaCheckCircle,
                title: "Quality First",
                description: "Every article is thoroughly researched, tested, and reviewed to ensure accuracy and value."
              },
              {
                icon: FaUsers,
                title: "Community Driven",
                description: "We listen to our readers and create content that addresses real challenges and needs."
              },
              {
                icon: FaRocket,
                title: "Innovation Focus",
                description: "We explore cutting-edge technologies and share insights on emerging trends and tools."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="px-6 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl"
          >
            <FaHeart className="text-4xl mx-auto mb-6 animate-float" />
            <h2 className="text-4xl font-bold mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Connect with like-minded developers, share your knowledge, and grow together. 
              Our community is built on mutual support and continuous learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link to="/sign-up" className="flex-1">
                <Button 
                  color="white" 
                  size="xl" 
                  className="w-full text-indigo-600 font-semibold hover:bg-gray-50"
                >
                  Get Started
                  <HiArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button 
                  color="light" 
                  size="xl" 
                  className="w-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-indigo-600 font-semibold"
                >
                  Explore Articles
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
