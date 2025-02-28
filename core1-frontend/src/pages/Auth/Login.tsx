import React, { useState, useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from '@tanstack/react-router';
import emailValidator from '../../lib/emailValidator';
import { isNotAuthenticated } from '../../lib/useToken';

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
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  placeholder,
  required,
  value,
  onChange,
  icon: Icon,
}) => {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
      <Icon className="h-5 w-5 text-gray-500 mr-2" />
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full focus:outline-none"
      />
    </div>
  );
};

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailValidator(form.email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/auth/login', form);
      if (res) {
        navigate({ to: '/dashboard/production' });
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo image inside the form */}
          <div className="flex justify-center">
            <img src="/Logo.jpg" alt="Logo" className="h-20 w-auto" />
          </div>
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <CustomInput
              icon={User}
              type="email"
              placeholder="Enter your email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-control">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <CustomInput
              icon={Lock}
              type="password"
              placeholder="Enter your password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="form-control mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Login;
