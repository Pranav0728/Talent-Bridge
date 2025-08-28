import React from 'react'

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h3>
            <p className="text-lg text-gray-600">Join thousands of satisfied users who found their perfect match</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="ml-4">
                  <h5 className="font-semibold">Sarah Johnson</h5>
                  <p className="text-sm text-gray-600">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Found my dream job at a top tech company within 2 weeks of joining TalentBridge. The AI matching is incredibly accurate!"
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h5 className="font-semibold">Michael Chen</h5>
                  <p className="text-sm text-gray-600">HR Manager</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Hired 5 exceptional candidates for our startup. The quality of applicants is outstanding compared to other platforms."
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  E
                </div>
                <div className="ml-4">
                  <h5 className="font-semibold">Emily Rodriguez</h5>
                  <p className="text-sm text-gray-600">Marketing Director</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Finally, a platform that understands both job seekers and employers. Made our hiring process 50% faster!"
              </p>
            </div>
          </div>
        </div>
      </section>
  )
}
