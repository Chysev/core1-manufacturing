"use client"

import React, { useState, useEffect } from 'react';
import { Lock, User, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from '@tanstack/react-router';
import emailValidator from '../../lib/emailValidator';
import { isNotAuthenticated } from '../../lib/useToken';
import Axios from '../../lib/Axios';

interface LoginForm {
  email: string;
  password: string;
}

interface Toast {
  show: boolean;
  message: string;
  type: string;
}

interface CustomInputProps {
  type: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  error?: string;
  id: string;
  name: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  placeholder,
  required,
  value,
  onChange,
  icon: Icon,
  error,
  id,
  name,
}) => {
  return (
    <div className="space-y-1">
      <div className={`relative rounded-md shadow-sm ${error ? 'ring-2 ring-red-500' : ''}`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className={`block w-full pl-10 pr-3 py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'
            } focus:border-transparent transition-all duration-200`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center mt-1" id={`${id}-error`}>
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [toast, setToast] = useState<Toast>({
    show: false,
    message: '',
    type: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Ensure that only unauthenticated users see this page.
  useEffect(() => {
    isNotAuthenticated(navigate);
  }, [navigate]);

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!form.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailValidator(form.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (form.password.length < 1) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await Axios.post(
        '/auth/login',
        form
      );
      if (res) {
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          navigate({ to: '/dashboard/production' });
        }, 1000);
      } else {
        showToast('Invalid response from server', 'error');
      }
    } catch (error: any) {
      if (error && error.response && error.response.data) {
        showToast(error.response.data.message, 'error');
      } else {
        showToast('Login failed. Please check your credentials.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 rounded-full shadow-md">
                <img src="/Logo.jpg" alt="Logo" className="h-16 w-16 rounded-full" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-blue-100 mt-1">Sign in to your account</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <CustomInput
                  id="email"
                  name="email"
                  icon={Mail}
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  error={errors.email}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>
                <CustomInput
                  id="password"
                  name="password"
                  icon={Lock}
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  error={errors.password}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Contact administrator
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} JJM Manufacturing. All rights reserved.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
