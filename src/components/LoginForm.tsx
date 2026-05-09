import React, { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(''); // clear any previous API error

    if (validate()) {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint URL
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        // 1. Parse JSON safely
        const contentType = response.headers.get("content-type");
        let data: any = null;
        if (contentType && contentType.indexOf("application/json") !== -1) {
          data = await response.json();
        }

        // 2. Handle HTTP Errors properly
        if (!response.ok) {
          let errorMessage = 'Échec de l\'authentification.';
          
          if (response.status === 401 || response.status === 403) {
            errorMessage = 'Email ou mot de passe incorrect.';
          } else if (response.status === 404) {
            errorMessage = 'Service introuvable. Vérifiez l\'URL de l\'API.';
          } else if (response.status >= 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else if (data && data.message) {
            errorMessage = data.message;
          } else if (data && data.error) {
            errorMessage = data.error;
          }

          throw new Error(errorMessage);
        }

        // 3. Save JWT token
        if (data && data.token) {
          localStorage.setItem('jwt_token', data.token);
          console.log('Authentification réussie ! JWT stocké.');
          // window.location.href = '/dashboard'; // Optionally redirect
        } else {
          throw new Error('Aucun token reçu du serveur.');
        }
      } catch (err: any) {
        // 4. Handle Network Errors (like API down, CORS, etc.)
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setApiError('Impossible de se connecter au serveur. Vérifiez votre connexion ou l\'état du serveur.');
        } else {
          setApiError(err.message || 'Une erreur inattendue s\'est produite.');
        }
      } finally {
        setIsLoading(false);
      }
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
      {apiError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800/50 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">
            {apiError}
          </p>
        </div>
      )}
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
        disabled={isLoading}
        className={`w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2 ${
          isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-indigo-600/40 active:transform active:scale-[0.98]'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connexion...
          </>
        ) : (
          <>
            Se connecter
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

