import React, { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'L\'adresse email est requise.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide.';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis.';
    } else if (password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log('Login attempt:', { email, password });
      // You can call your API here
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({ ...errors, email: undefined });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors({ ...errors, password: undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.email 
              ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'
          } bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all duration-200 backdrop-blur-sm shadow-sm`}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 animate-pulse">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.password 
              ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'
          } bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all duration-200 backdrop-blur-sm shadow-sm`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 animate-pulse">
            {errors.password}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between mt-1">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer" 
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
            Remember me
          </span>
        </label>
        <a href="#" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
          Forgot password?
        </a>
      </div>
      <button
        type="submit"
        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:transform active:scale-[0.98] flex justify-center items-center gap-2"
      >
        Sign in
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </form>
  );
}

