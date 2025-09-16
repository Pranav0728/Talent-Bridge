import Link from "next/link";
import React from "react";
export default function HeroSection() {
  return (
    <section id="home" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your Dream Job or Perfect Hire
        </h2>
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
          Connect talented professionals with amazing opportunities. Whether you're job hunting or talent seeking, we bridge the gap.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
            <Link href="/register">
            Sign Up
            </Link>
          </button>
          <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-400 transition duration-300">
            <Link href="/login">
            Sign In
            </Link>
          </button>
        </div>
      </div>
    </section>
    
  );
}
