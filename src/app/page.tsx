export default function Home() {
  return (
    <div className="min-h-screen pt-20 bg-white dark:bg-black">
      {/* Hero Section with Dynamic Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#ffffff,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#1a1a1a,transparent)]"></div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center">
          <h1 className="text-6xl sm:text-8xl font-bold text-black dark:text-white mb-8 tracking-tight">
            Intel<span className="font-light">lica</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto font-light">
            Where knowledge meets innovation. Transform your learning journey
            with our cutting-edge platform.
          </p>
          <div className="flex gap-6 justify-center items-center">
            <a
              href="/courses"
              className="group px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-all duration-300 font-medium relative overflow-hidden"
            >
              <span className="relative z-10">Explore Courses</span>
              <div className="absolute inset-0 bg-gray-800 dark:bg-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </a>
            <a
              href="/trial"
              className="group px-8 py-4 border-2 border-black dark:border-white text-black dark:text-white rounded-full hover:scale-105 transition-all duration-300 font-medium"
            >
              Start Free Trial
            </a>
          </div>
        </div>

        {/* Features Grid with Hover Effects */}
        <div className="mt-32 pt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              title: "Expert-Led Courses",
              description: "Learn from industry leaders and innovators.",
              icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
            },
            {
              title: "Interactive Learning",
              description: "Engage with real-world projects and challenges.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
            {
              title: "Certified Growth",
              description: "Earn credentials that matter in the industry.",
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 mb-6 relative">
                <div className="absolute inset-0 bg-black dark:bg-white rounded-xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white dark:text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-3 text-black dark:text-white group-hover:translate-x-2 transition-transform duration-300">
                {feature.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 group-hover:translate-x-2 transition-transform duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="relative border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-6">
            <div className="text-gray-600 dark:text-gray-400 font-light">
              © 2024 Intellica. All rights reserved.
            </div>
            <div className="flex gap-8">
              {["Privacy", "Terms", "Contact"].map((item, index) => (
                <a
                  key={index}
                  href={`/${item.toLowerCase()}`}
                  className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300 font-light"
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
