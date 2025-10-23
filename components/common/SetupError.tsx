
import React from 'react';
import GlassCard from './GlassCard';

const SetupError: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <GlassCard className="w-full max-w-2xl mx-4 border-red-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Configuration Needed</h1>
          <p className="text-gray-700 mb-6">
            Your Sainath application is almost ready! To connect to your centralized database, you need to provide your Supabase credentials.
          </p>
          <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="font-semibold mb-2">For Vercel Deployment:</p>
             <p className="text-gray-600 mb-2">
                Go to your Vercel project's **Settings &gt; Environment Variables** section and add the following two keys:
             </p>
             <pre className="bg-gray-800 text-white p-3 rounded-md my-2 text-sm overflow-x-auto">
                {`VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL\nVITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`}
            </pre>
            <p className="font-semibold mt-4 mb-2">For Local Development:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>
                Create a file named <code className="bg-gray-200 px-1 py-0.5 rounded">.env.local</code> in the root directory of your project.
              </li>
              <li>
                Open the file and add the same two lines as above, replacing the placeholders with your actual Supabase credentials.
              </li>
              <li>
                You can find your credentials in your Supabase project settings under the "API" section.
              </li>
               <li>
                After saving the file, restart your development server.
              </li>
            </ol>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default SetupError;
