import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFFEF0] flex flex-col items-center justify-center px-6">
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000] p-12 max-w-lg w-full text-center">
            <div className="bg-[#FFD60A] border-2 border-black w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#000]">
                <span className="text-4xl font-black">404</span>
            </div>
            <h1 className="text-5xl font-black text-black mb-4">Page Not Found</h1>
            <p className="text-gray-700 font-medium mb-8 text-lg">
                Oops! The page you're looking for doesn't exist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-[#FFD60A] border-2 border-black font-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
                >
                    Go Home
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 bg-white border-2 border-black font-bold hover:bg-[#FFD60A] hover:shadow-[2px_2px_0px_#000] shadow-[4px_4px_0px_#000] transition-all"
                >
                    Go Back
                </button>
            </div>
        </div>
        <p className="mt-8 text-sm text-gray-500 font-medium">© {new Date().getFullYear()} AutoBank Pro</p>
    </div>
  );
};

export default NotFound;
