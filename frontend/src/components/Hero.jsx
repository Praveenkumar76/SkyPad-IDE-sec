import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { heroData, aboutData, featuresData } from "../data/heroData";

const cardHover =
  "transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20";

const Hero = ({ navigate }) => {
  return (
    <>
      <Navbar />
      <div className="bg-black text-white">
        {/* Hero Section */}

        <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 md:px-8 lg:px-0">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-violet-900/20 to-black"></div>
          {/* Background watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none watermark-pulse">
            <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
          </div>
          <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto text-center">
            {/* Pre-headline */}
            <p
              className="text-violet-400 tracking-wider text-sm md:text-base mb-4 uppercase fade-in-up fade-in-up-delay-1"
              style={{ fontFamily: "var(--font-climate)" }}
            >
              For Aspirants
            </p>
            {/* Main headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-bold mb-6 leading-tight whitespace-nowrap w-full flex justify-center fade-in-up fade-in-up-delay-2">
              <span
                style={{ fontFamily: "var(--font-zen)" }}
                className="text-white block"
              >
                Create . Compete . Collaborate
              </span>
            </h1>
            {/* Subtitle */}
            <p
              className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto fade-in-up fade-in-up-delay-3"
              style={{ fontFamily: "var(--font-bitcount)" }}
            >
              A coding space to learn, grow, and connect with others through
              real-world programming experiences.
            </p>
            {/* CTA Button */}
            <div className="flex justify-center w-full fade-in-up fade-in-up-delay-3">
              <button
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25 button-glow"
                onClick={() => navigate && navigate("/signup")}
              >
                Get Started
              </button>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-black to-violet-900/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="text-white">About </span>
                <span className="text-violet-400">Us</span>
              </h2>
              <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
                {aboutData.description}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aboutData.cards.map((card) => (
                <div
                  key={card.id}
                  className={`bg-violet-900/20 p-6 rounded-lg border border-violet-500/20 ${cardHover}`}
                >
                  <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox={card.icon.viewBox}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={card.icon.path}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {card.title}
                  </h3>
                  <p className="text-gray-300">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-black">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="text-white">{featuresData.title.main}</span>
                <span className="text-violet-400">
                  {featuresData.title.highlight}
                </span>
              </h2>
              <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
                {featuresData.description}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {featuresData.leftFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className={`flex items-start space-x-4 ${cardHover}`}
                  >
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {featuresData.rightFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className={`flex items-start space-x-4 ${cardHover}`}
                  >
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Hero;