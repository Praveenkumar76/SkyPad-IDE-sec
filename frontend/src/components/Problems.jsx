import React from 'react';
import DashboardNavbar from './DashboardNavbar';
import { problemsData } from '../data/problemsData';
import { MdSearch } from 'react-icons/md';

const Problems = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden">
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
          <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
        </div>
        
        <div className="relative z-10">
          {/* Main Content Area */}
          <div className="p-6">
            {/* Header and Search */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">All Problems</h2>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-white/10 backdrop-blur-md text-white placeholder-gray-300 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-violet-400 w-64"
                  />
                  <MdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                </div>
                
                <DashboardNavbar />
              </div>
            </div>

            {/* Problems Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {problemsData.map((problem) => (
                <div
                  key={problem.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Problem Image */}
                    <div className="w-20 h-20 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
                      <img
                        src={problem.img}
                        alt={problem.title}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl hidden items-center justify-center text-white font-bold text-2xl"
                      >
                        {problem.title.charAt(0)}
                      </div>
                    </div>
                    
                    {/* Problem Title */}
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {problem.title}
                    </h3>
                    
                    {/* Problems Count */}
                    <p className="text-gray-300 text-sm mb-3">
                      {problem.problemsCount} Problems
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-400 to-purple-500 h-2 rounded-full w-0 group-hover:w-2/3 transition-all duration-700"></div>
                    </div>
                    
                    {/* Hover Effect Text */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-violet-300 text-xs font-medium">Click to explore →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-violet-400">{problemsData.length}</h3>
                  <p className="text-gray-300 text-sm">Total Categories</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-violet-400">
                    {problemsData.reduce((total, problem) => total + problem.problemsCount, 0)}
                  </h3>
                  <p className="text-gray-300 text-sm">Total Problems</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-violet-400">0</h3>
                  <p className="text-gray-300 text-sm">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Problems;