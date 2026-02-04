import { Button } from "flowbite-react";
import { HiArrowRight, HiSparkles, HiPencil, HiGlobe, HiShieldCheck, HiLightningBolt, HiHeart } from "react-icons/hi";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function AboutPage() {
  const [stats, setStats] = useState({ totalPosts: 0, totalUsers: 0 });
  const { currentUser } = useSelector((state) => state.user);

  // Set page title
  useEffect(() => {
    document.title = 'About Us - DailyBloggs';
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, usersRes] = await Promise.all([
          fetch('/api/post/getposts?limit=1'),
          fetch('/api/user/stats')
        ]);
        const postsData = await postsRes.json();
        const usersData = await usersRes.json();
        setStats({
          totalPosts: postsData.totalPosts || 0,
          totalUsers: usersData.totalUsers || 0
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* Hero Section with Dot Background */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950">
        {/* Dot Grid Background */}
        <div
          className="absolute inset-0 [background-size:20px_20px] [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-white dark:bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 text-sm font-medium mb-6">
              <HiSparkles className="w-4 h-4" />
              <span>About dailybloggs</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Where ideas come to
              <span className="relative inline-block mx-3">
                <span className="relative z-10 text-blue-600">life</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" fill="none">
                  <path d="M2 10C25 4 75 4 98 10" stroke="#f97316" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              We're a community of writers, thinkers, and creators sharing stories that inspire, educate, and spark meaningful conversations.
            </p>

            {/* Stats */}
            <div className="flex gap-8 md:gap-16 justify-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{stats.totalPosts}+</div>
                <div className="text-sm text-slate-500">Articles Published</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}+</div>
                <div className="text-sm text-slate-500">Writers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Free</div>
                <div className="text-sm text-slate-500">Forever</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                dailybloggs started as a college project with a simple belief: everyone has a story worth sharing. What began as an academic endeavor quickly grew into something more — a platform built with passion to give writers a beautiful, distraction-free space to share their thoughts with the world.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Whether you're a seasoned writer or just starting out, our platform empowers you with modern tools to create compelling content that resonates with readers. This project represents countless hours of learning, coding, and dreaming big.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={currentUser ? "/create-post" : "/sign-up"}>
                  <Button color="dark" size="lg">
                    {currentUser ? "Start Writing" : "Join Us Today"}
                    <HiArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <HiPencil className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Write Freely</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Express yourself without limits</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mt-8">
                <HiGlobe className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Reach Everyone</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Share with a global audience</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <HiSparkles className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI Powered</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Smart writing assistance</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mt-8">
                <HiHeart className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Build Community</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Connect with readers</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose dailybloggs?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We provide everything you need to create, publish, and grow your audience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: HiLightningBolt,
                title: "Fast & Simple",
                description: "No complicated setups. Just sign up and start writing. Your first post can be live in minutes."
              },
              {
                icon: HiShieldCheck,
                title: "Secure & Private",
                description: "Your content is yours. We prioritize security and give you full control over your data."
              },
              {
                icon: HiSparkles,
                title: "AI Assistant",
                description: "Get intelligent suggestions, grammar fixes, and topic ideas to enhance your writing."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="bg-slate-900 dark:bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="text-white dark:text-slate-900 w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Explore Diverse Topics
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From technology to creativity, find content that matters to you.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              { name: 'Technology', icon: '💻' },
              { name: 'Personal', icon: '✨' },
              { name: 'Educational', icon: '📚' },
              { name: 'Creative', icon: '🎨' },
              { name: 'News', icon: '📰' },
              { name: 'Medical', icon: '🏥' },
              { name: 'Climate', icon: '🌍' },
              { name: 'Professional', icon: '💼' },
            ].map((topic) => (
              <Link
                key={topic.name}
                to={`/?search=${topic.name.toLowerCase()}`}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all"
              >
                <span className="text-xl">{topic.icon}</span>
                <span className="font-medium">{topic.name}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full filter blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to share your story?
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
                Join our growing community of writers and start publishing your ideas today. It's free, forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={currentUser ? "/create-post" : "/sign-up"}>
                  <button className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                    {currentUser ? "Create Your Post" : "Get Started Free"}
                    <HiArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link to="/">
                  <button className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-slate-600 hover:border-slate-400 text-white font-semibold rounded-xl transition-all duration-300">
                    Browse Articles
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
