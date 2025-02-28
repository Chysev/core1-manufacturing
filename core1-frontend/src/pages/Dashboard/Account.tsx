import axios from 'axios';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/Layout';
import { useNavigate } from '@tanstack/react-router';
import { isAuthenticated } from '../../lib/useToken';

interface Account {
  _id: string;
  name: string;
  email: string;
  Core: number;
  role: string;
}

const Account = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/user-list');
      console.log(accounts);
      setAccounts(response.data.users);
      showToast('Accounts fetched successfully', 'success');
    } catch (error) {
      console.error('Fetch accounts error:', error);
      showToast('Failed to fetch accounts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
          <button
            onClick={fetchAccounts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Core
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account.Core}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account.role}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={4}>
                    {isLoading
                      ? 'Loading accounts...'
                      : 'No accounts available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </DashboardLayout>
  );
};

export default Account;
