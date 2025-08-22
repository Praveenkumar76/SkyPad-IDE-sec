// Hero Data
export const heroData = {
  preHeadline: {
    text: "For Aspirants",
    className: "text-violet-400 tracking-wider text-sm md:text-base mb-4 uppercase fade-in-up fade-in-up-delay-1",
    fontFamily: "var(--font-climate)"
  },
  mainHeadline: {
    text: "Create . Compete . Collaborate",
    className: "text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-bold mb-6 leading-tight whitespace-nowrap w-full flex justify-center fade-in-up fade-in-up-delay-2",
    fontFamily: "var(--font-zen)"
  },
  subtitle: {
    text: "A coding space to learn, grow, and connect with others through real-world programming experiences.",
    className: "text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto fade-in-up fade-in-up-delay-3",
    fontFamily: "var(--font-bitcount)"
  },
  ctaButton: {
    text: "Get Started",
    className: "bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25 button-glow",
    action: "/signup"
  }
};

// About Us Data
export const aboutData = {
  title: {
    main: "About",
    highlight: " Us"
  },
  description: "We're passionate about helping programmers sharpen their skills, prepare for coding interviews, and excel in competitive programming. Our platform delivers the ultimate environment for learning, practicing, and competing through a rich collection of challenges, contests, and resources.",
  cards: [
    {
      id: 1,
      icon: {
        viewBox: "0 0 24 24",
        path: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      },
      title: "Innovation",
      description: "A modern coding platform designed with advanced features to make problem-solving efficient, engaging, and impactful."
    },
    {
      id: 2,
      icon: {
        viewBox: "0 0 24 24",
        path: "M13 10V3L4 14h7v7l9-11h-7z"
      },
      title: "Performance",
      description: "Optimized for lightning-fast problem loading, smooth code execution, and instant result feedback."
    },
    {
      id: 3,
      icon: {
        viewBox: "0 0 24 24",
        path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      },
      title: "Security",
      description: "Secure authentication, and fair competition rules to ensure a trustworthy environment."
    }
  ]
};

// Features Data
export const featuresData = {
  title: {
    main: "Powerful",
    highlight: " Features"
  },
  description: "Everything you need to master algorithms, data structures, and competitive coding.",
  leftFeatures: [
    {
      id: 1,
      title: "Extensive Problem Library",
      description: "Thousands of problems across difficulty levels, covering every major topic in computer science and programming."
    },
    {
      id: 2,
      title: "Real-time Contests",
      description: "Compete in timed contests with programmers from around the globe, with live rankings and leaderboards."
    },
    {
      id: 3,
      title: "Editorials & Hints",
      description: "Step-by-step editorial solutions, hints, and multiple approaches for every problem to enhance learning."
    }
  ],
  rightFeatures: [
    {
      id: 4,
      title: "Multi-language Support",
      description: "Code in 5+ programming languages with syntax highlighting and fast compilation."
    },
    {
      id: 5,
      title: "Learning Tracks",
      description: "Structured learning paths for Data Structures, Algorithms, and interview preparation."
    }
  ]
};