import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

export default function LoginPage({ onLogin }: { onLogin?: () => void }) {
  const [isLoginView, setIsLoginView] = useState(true);

  return (

    
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md p-8 sm:p-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/50 dark:border-gray-800 m-4 relative z-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight transition-all duration-300">
            {isLoginView ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm sm:text-base">
            {isLoginView ? 'Please enter your details to sign in.' : 'Fill in your details to get started.'}
          </p>
        </div>
        
        <div className="flex justify-center w-full">
          {isLoginView ? <LoginForm onLogin={onLogin} /> : <SignupForm onLogin={onLogin} />}
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200/60 dark:border-gray-800/60">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLoginView(!isLoginView)}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              {isLoginView ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
