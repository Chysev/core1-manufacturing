import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, X, Edit } from 'lucide-react';
import DashboardLayout from '../../components/Layout/Layout';
import { useNavigate } from '@tanstack/react-router';
import { isAuthenticated } from '../../lib/useToken';

interface DemandForecast {
  id: string;
  month: string;
  sales: number;
}

const DemandForecast = () => {
  const navigate = useNavigate();

  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedForecast, setSelectedForecast] =
    useState<DemandForecast | null>(null);
  const [formData, setFormData] = useState({
    month: '',
    sales: 0,
  });

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const calculateMovingAverage = (
    data: number[],
    windowSize: number
  ): number[] => {
    let result: number[] = [];
    if (data.length < windowSize) return result;
    for (let i = 0; i <= data.length - windowSize; i++) {
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += data[i + j];
      }
      result.push(sum / windowSize);
    }
    return result;
  };

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchForecasts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'https://backend-core1.jjm-manufacturing.com/api/forecast/list'
      );
      setForecasts(response.data);
    } catch (error) {
      showToast('Failed to fetch forecasts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        'https://backend-core1.jjm-manufacturing.com/api/forecast/create',
        formData
      );
      showToast('Forecast created successfully', 'success');
      setIsCreateModalOpen(false);
      setFormData({ month: '', sales: 0 });
      fetchForecasts();
    } catch (error) {
      showToast('Failed to create forecast', 'error');
      console.error('Create forecast error:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForecast) return;
    try {
      await axios.patch(
        `https://backend-core1.jjm-manufacturing.com/api/forecast/${selectedForecast.id}`,
        formData
      );
      showToast('Forecast updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedForecast(null);
      setFormData({ month: '', sales: 0 });
      fetchForecasts();
    } catch (error) {
      showToast('Failed to update forecast', 'error');
      console.error('Update forecast error:', error);
    }
  };

  const handleDelete = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.delete(
        `https://backend-core1.jjm-manufacturing.com/api/forecast/${id}`
      );
      showToast('Forecast deleted successfully', 'success');
      fetchForecasts();
    } catch (error) {
      showToast('Failed to delete forecast', 'error');
    }
  };

  const openViewModal = (forecast: DemandForecast) => {
    setSelectedForecast(forecast);
    setIsViewModalOpen(true);
  };

  const openEditModal = (forecast: DemandForecast) => {
    setSelectedForecast(forecast);
    setFormData({ month: forecast.month, sales: forecast.sales });
    setIsEditModalOpen(true);
  };

  // Calculate moving average for sales with a window size of 3
  const salesData = forecasts.map((f) => f.sales);
  const movingAverages = calculateMovingAverage(salesData, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Demand Forecasts
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Forecast
          </button>
        </div>

        {/* Forecasts Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forecasts.map((forecast) => (
                <tr key={forecast.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {forecast.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {forecast.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openViewModal(forecast)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(forecast)}
                      className="text-green-600 hover:text-green-900 mx-2"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e: React.FormEvent) =>
                        handleDelete(forecast.id, e)
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {forecasts.length === 0 && !isLoading && (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={3}>
                    No forecasts available.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={3}>
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Moving Average Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Moving Averages (Window: 3)
          </h2>
          {salesData.length < 3 ? (
            <p className="text-gray-700">
              Not enough data to calculate moving averages.
            </p>
          ) : (
            <ul className="list-disc list-inside">
              {movingAverages.map((avg, idx) => (
                <li key={idx}>
                  Window {idx + 1}: {avg.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Forecast</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <input
                    type="text"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales
                  </label>
                  <input
                    type="number"
                    value={formData.sales}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sales: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Forecast
                </button>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedForecast && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Forecast Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <p className="text-gray-900">{selectedForecast.month}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales
                  </label>
                  <p className="text-gray-900">{selectedForecast.sales}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedForecast && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Forecast</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <input
                    type="text"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales
                  </label>
                  <input
                    type="number"
                    value={formData.sales}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sales: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update Forecast
                </button>
              </form>
            </div>
          </div>
        )}

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

export default DemandForecast;
