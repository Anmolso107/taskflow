import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useState } from 'react';
import { CheckSquare, Moon, Sun, AlertCircle, UserX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'wrong_password' | 'not_found' | 'general'

  const onSubmit = async (data) => {
    try {
      setError('');
      setErrorType('');
      const res = await api.post('/auth/login', data);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error;

      if (status === 401) {
        setErrorType('wrong_password');
        setError('Incorrect email or password. Please try again.');
      } else if (status === 404 || message === 'User not found') {
        setErrorType('not_found');
        setError('No account found with this email.');
      } else {
        setErrorType('general');
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 transition-colors">

      {/* Dark mode toggle */}
      <button onClick={toggle}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
        {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <CheckSquare size={28} className="text-brand-600" />
          <span className="text-2xl font-bold text-brand-600">TaskFlow</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to your account</p>

        {/* Wrong password error */}
        {errorType === 'wrong_password' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Incorrect credentials</p>
              <p className="text-red-500 dark:text-red-400 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Account not found error */}
        {errorType === 'not_found' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2 mb-2">
              <UserX size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm font-medium">Account not found</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="w-full mt-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium py-1.5 rounded-md transition-colors">
              Create an account instead →
            </button>
          </div>
        )}

        {/* General error */}
        {errorType === 'general' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              {...register('email', { required: 'Email is required' })}
              type="email"
              placeholder="you@example.com"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                ${errorType ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              placeholder="••••••••"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                ${errorType === 'wrong_password' ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'}`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-60 mt-2">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          No account?{' '}
          <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}