"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Modern subtle patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#ffffff08,transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_300px,#ffffff08,transparent)]"></div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="relative inline-flex items-center px-6 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="animate-pulse absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500"></span>
              <span className="text-sm font-medium text-white/80 pl-4">
                Now Open for Student Applications 📚
              </span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl sm:text-8xl font-bold mb-8 tracking-tight text-white"
          >
            Intel<span className="font-light">lica</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl sm:text-2xl text-white/70 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Connect with expert teachers, join interactive courses, and master
            new skills through hands-on assignments.
            <span className="block mt-2 text-white/50">
              Your journey to excellence starts here.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex gap-6 justify-center items-center flex-col sm:flex-row"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/courses"
              className="group w-full sm:w-auto px-8 py-4 bg-white text-black rounded-2xl font-medium relative overflow-hidden flex items-center justify-center gap-2"
            >
              <span className="relative z-10">Browse Courses</span>
              <motion.svg
                className="w-4 h-4 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </motion.svg>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/register"
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white"
            >
              Register Now
              <motion.span
                className="inline-block"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                →
              </motion.span>
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "50+", label: "Expert Teachers" },
            { number: "100+", label: "Interactive Courses" },
            { number: "92%", label: "Completion Rate" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white">
                Intel<span className="font-light">lica</span>
              </span>
              <span className="text-white/60 font-light">© 2024</span>
            </div>
            <div className="flex gap-8">
              {["Privacy", "Terms", "Contact", "Blog"].map((item, index) => (
                <a
                  key={index}
                  href={`/${item.toLowerCase()}`}
                  className="text-white/60 hover:text-white transition-colors duration-300 font-light"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
