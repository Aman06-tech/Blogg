import { Button } from "flowbite-react";
import { HiArrowRight, HiCheckCircle, HiUsers, HiLightBulb } from "react-icons/hi";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Hero Section */}
      <section className="px-6 py-20 lg:py-28 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About Us
          </motion.h1>
          <motion.p
            className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto"
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
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                We believe that knowledge should be accessible to everyone. Our mission is to create
                high-quality, practical content that empowers developers, designers, and tech enthusiasts
                to build better solutions and advance their careers.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
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
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">50+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Articles</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">1K+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Readers</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">10+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Topics</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">Free</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Forever</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-20 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our values guide everything we do, from the content we create to the community we build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: HiCheckCircle,
                title: "Quality First",
                description: "Every article is thoroughly researched, tested, and reviewed to ensure accuracy and value."
              },
              {
                icon: HiUsers,
                title: "Community Driven",
                description: "We listen to our readers and create content that addresses real challenges and needs."
              },
              {
                icon: HiLightBulb,
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
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <div className="bg-slate-900 dark:bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="text-white dark:text-slate-900 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-6">
              Join Our Community
            </h2>
            <p className="text-lg mb-8 text-slate-300">
              Connect with like-minded developers, share your knowledge, and grow together.
              Our community is built on mutual support and continuous learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button color="light" size="lg">
                  Get Started
                  <HiArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/">
                <Button color="dark" size="lg" className="border border-slate-600">
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
