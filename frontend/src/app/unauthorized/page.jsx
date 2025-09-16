'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Home, ArrowLeft, AlertCircle } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Clean Card Design */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Header */}
          <div className="text-center p-6 border-b border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-sm text-gray-600">
              You don't have permission to access this page
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700">
                  This area is restricted to authorized users only. 
                  If you believe this is an error, please contact your administrator.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Go Back
              </button>

              <Link
                href="/"
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors text-center block"
              >
                <Home className="w-4 h-4 inline mr-2" />
                Return to Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact support</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            TalentBridge Security • Protected Platform
          </p>
        </div>
      </div>
    </div>
  );
}