import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, X } from 'lucide-react';
import DashboardLayout from '../../components/Layout/Layout';
import { isAuthenticated } from '../../lib/useToken';
import { useNavigate } from '@tanstack/react-router';

type PROD_SCHED_STATUS = 'ONTIME' | 'DELAYED' | 'BEHIND_SCHEDULE';

interface ProductionSchedule {
  id: string;
  status: PROD_SCHED_STATUS;
  description?: string;
  start: string;
  end: string;
  workOrders?: any[];
}

const MasterProduction = () => {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ProductionSchedule | null>(null);
  const [formData, setFormData] = useState({
    status: 'ONTIME' as PROD_SCHED_STATUS,
    description: '',
    start: '',
    end: '',
  });

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        'https://backend-core1.jjm-manufacturing.com/api/prodSched/list'
      );
      setSchedules(response.data);
    } catch (error) {
      showToast('Failed to fetch schedules', 'error');
    } finally {
      return;
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
      };

      await axios.post(
        'https://backend-core1.jjm-manufacturing.com/api/prodSched/create',
        formattedData
      );
      showToast('Schedule created successfully', 'success');
      setIsCreateModalOpen(false);
      setFormData({
        status: 'ONTIME',
        description: '',
        start: '',
        end: '',
      });
      fetchSchedules();
    } catch (error) {
      showToast('Failed to create schedule', 'error');
      console.error('Create error:', error);
    }
  };

  const handleDelete = async (id: string, e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.delete('https://backend-core1.jjm-manufacturing.com/api/prodSched/${id}`);

      showToast('Schedule deleted successfully', 'success');
      fetchSchedules();
    } catch (error) {
      showToast('Failed to delete schedule', 'error');
    }
  };

  const getStatusColor = (status: PROD_SCHED_STATUS) => {
    switch (status) {
      case 'ONTIME':
        return 'bg-green-100 text-green-800';
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800';
      case 'BEHIND_SCHEDULE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Production Schedules
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getStatusColor(schedule.status)}`}
                    >
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {schedule.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(schedule.start).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(schedule.end).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setIsViewModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e: React.FormEvent) =>
                        handleDelete(schedule.id, e)
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Schedule</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as PROD_SCHED_STATUS,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ONTIME">On Time</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="BEHIND_SCHEDULE">Behind Schedule</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) =>
                      setFormData({ ...formData, start: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) =>
                      setFormData({ ...formData, end: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Schedule
                </button>
              </form>
            </div>
          </div>
        )}

        {isViewModalOpen && selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Schedule Details</h2>
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
                    Status
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedSchedule.status)}`}
                  >
                    {selectedSchedule.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900">
                    {selectedSchedule.description || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedSchedule.start).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedSchedule.end).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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

export default MasterProduction;
