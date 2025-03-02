import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, X, Edit } from 'lucide-react';
import DashboardLayout from '../../components/Layout/Layout';
import { useNavigate } from '@tanstack/react-router';
import { isAuthenticated } from '../../lib/useToken';

interface WorkOrder {
  id: string;
  productId: string;
  quantity: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo: string;
  deadline: string;
  productionScheduleId?: string;
}

interface Product {
  id: string;
  name: string;
}

interface ProductionSchedule {
  id: string;
  description?: string;
}

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );

  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [products, setProducts] = useState<Product[]>([]);
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const [workOrderForm, setWorkOrderForm] = useState({
    productId: '',
    quantity: 0,
    status: 'IN_PROGRESS' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
    assignedTo: '',
    deadline: '',
    productionScheduleId: '',
  });

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchProducts();
    fetchSchedules();
    fetchWorkOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        'https://backend-core1.jjm-manufacturing.com/api/products/list'
      );
      const prods = response.data.map((p: any) => ({ id: p.id, name: p.name }));
      setProducts(prods);
    } catch (error) {
      showToast('Failed to fetch products', 'error');
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        'https://backend-core1.jjm-manufacturing.com/api/prodSched/list'
      );
      const sch = response.data.map((s: any) => ({
        id: s.id,
        description: s.description,
      }));
      setSchedules(sch);
    } catch (error) {
      showToast('Failed to fetch production schedules', 'error');
    }
  };

  const fetchWorkOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'https://backend-core1.jjm-manufacturing.com/api/workOrders/list'
      );
      const orders = response.data.map((order: any) => ({
        ...order,
        productId: order.product?.id || order.productId,
        productionScheduleId: order.prodSched?.id || order.productionScheduleId,
      }));
      setWorkOrders(orders);
    } catch (error) {
      showToast('Failed to fetch work orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        quantity: workOrderForm.quantity,
        status: workOrderForm.status,
        assignedTo: workOrderForm.assignedTo,
        deadline: new Date(workOrderForm.deadline).toISOString(),
        product: { connect: { id: workOrderForm.productId } },
        prodSched: workOrderForm.productionScheduleId
          ? { connect: { id: workOrderForm.productionScheduleId } }
          : undefined,
      };
      await axios.post(
        'https://backend-core1.jjm-manufacturing.com/api/workOrders/create',
        payload
      );
      showToast('Work order created successfully', 'success');
      setIsCreateModalOpen(false);
      setWorkOrderForm({
        productId: '',
        quantity: 0,
        status: 'IN_PROGRESS',
        assignedTo: '',
        deadline: '',
        productionScheduleId: '',
      });
      fetchWorkOrders();
    } catch (error) {
      showToast('Failed to create work order', 'error');
      console.error('Create work order error:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkOrder) return;
    try {
      const payload = {
        quantity: workOrderForm.quantity,
        status: workOrderForm.status,
        assignedTo: workOrderForm.assignedTo,
        deadline: new Date(workOrderForm.deadline).toISOString(),
        product: { connect: { id: workOrderForm.productId } },
        prodSched: workOrderForm.productionScheduleId
          ? { connect: { id: workOrderForm.productionScheduleId } }
          : undefined,
      };
      await axios.patch(
        'https://backend-core1.jjm-manufacturing.com/api/workOrders/${selectedWorkOrder.id}`,
        payload
      );
      showToast('Work order updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedWorkOrder(null);
      setWorkOrderForm({
        productId: '',
        quantity: 0,
        status: 'IN_PROGRESS',
        assignedTo: '',
        deadline: '',
        productionScheduleId: '',
      });
      fetchWorkOrders();
    } catch (error) {
      showToast('Failed to update work order', 'error');
      console.error('Update work order error:', error);
    }
  };

  const handleDelete = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.delete('https://backend-core1.jjm-manufacturing.com/api/workOrders/${id}`);
      showToast('Work order deleted successfully', 'success');
      fetchWorkOrders();
    } catch (error) {
      showToast('Failed to delete work order', 'error');
      console.error('Delete work order error:', error);
    }
  };

  const openViewModal = (order: WorkOrder) => {
    setSelectedWorkOrder(order);
    setIsViewModalOpen(true);
  };

  const openEditModal = (order: WorkOrder) => {
    setSelectedWorkOrder(order);
    setWorkOrderForm({
      productId: order.productId,
      quantity: order.quantity,
      status: order.status,
      assignedTo: order.assignedTo,
      deadline: new Date(order.deadline).toISOString().substring(0, 16),
      productionScheduleId: order.productionScheduleId || '',
    });
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Work Orders</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </button>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prod. Schedule
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {products.find((p) => p.id === order.productId)?.name ||
                      order.productId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.deadline).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.productionScheduleId
                      ? schedules.find(
                          (s) => s.id === order.productionScheduleId
                        )?.description || order.productionScheduleId
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openViewModal(order)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(order)}
                      className="text-green-600 hover:text-green-900 mx-2"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e: React.FormEvent) =>
                        handleDelete(order.id, e)
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {workOrders.length === 0 && !isLoading && (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={7}>
                    No work orders available.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Work Order</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <select
                      value={workOrderForm.productId}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          productId: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={workOrderForm.quantity}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          quantity: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={workOrderForm.status}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          status: e.target.value as
                            | 'PENDING'
                            | 'IN_PROGRESS'
                            | 'COMPLETED',
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={workOrderForm.assignedTo}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          assignedTo: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={workOrderForm.deadline}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Production Schedule
                    </label>
                    <select
                      value={workOrderForm.productionScheduleId}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          productionScheduleId: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a schedule (optional)</option>
                      {schedules.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.description || s.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Work Order
                </button>
              </form>
            </div>
          </div>
        )}

        {isViewModalOpen && selectedWorkOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Work Order Details</h2>
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
                    Product
                  </label>
                  <p className="text-gray-900">
                    {products.find((p) => p.id === selectedWorkOrder.productId)
                      ?.name || selectedWorkOrder.productId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <p className="text-gray-900">{selectedWorkOrder.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <p className="text-gray-900">{selectedWorkOrder.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <p className="text-gray-900">
                    {selectedWorkOrder.assignedTo}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedWorkOrder.deadline).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Schedule
                  </label>
                  <p className="text-gray-900">
                    {selectedWorkOrder.productionScheduleId
                      ? schedules.find(
                          (s) => s.id === selectedWorkOrder.productionScheduleId
                        )?.description || selectedWorkOrder.productionScheduleId
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedWorkOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Work Order</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <select
                      value={workOrderForm.productId}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          productId: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={workOrderForm.quantity}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          quantity: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={workOrderForm.status}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          status: e.target.value as
                            | 'PENDING'
                            | 'IN_PROGRESS'
                            | 'COMPLETED',
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={workOrderForm.assignedTo}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          assignedTo: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={workOrderForm.deadline}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Production Schedule
                    </label>
                    <select
                      value={workOrderForm.productionScheduleId}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          productionScheduleId: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a schedule (optional)</option>
                      {schedules.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.description || s.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update Work Order
                </button>
              </form>
            </div>
          </div>
        )}

        {toast.show && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkOrders;
