"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Eye,
  X,
  Edit,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Package,
  ClipboardList,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import DashboardLayout from "../../components/Layout/Layout"
import { useNavigate } from "@tanstack/react-router"
import Axios from "../../lib/Axios"
import { isAuthenticated } from "../../lib/useToken"

interface WorkOrder {
  id: string
  productId: string
  quantity: number
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  assignedTo: string
  deadline: string
  productionScheduleId?: string
}

interface Product {
  id: string
  name: string
}

interface ProductionSchedule {
  id: string
  description?: string
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [workOrderToDelete, setWorkOrderToDelete] = useState<string | null>(null)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const navigate = useNavigate()
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [products, setProducts] = useState<Product[]>([])
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([])

  const [workOrderForm, setWorkOrderForm] = useState({
    productId: "",
    quantity: 0,
    status: "IN_PROGRESS" as "PENDING" | "IN_PROGRESS" | "COMPLETED",
    assignedTo: "",
    deadline: "",
    productionScheduleId: "",
  })

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  useEffect(() => {
    fetchProducts()
    fetchSchedules()
    fetchWorkOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await Axios.get("/api/products/list")
      const prods = response.data.map((p: any) => ({ id: p.id, name: p.name }))
      setProducts(prods)
    } catch (error) {
      showToast("Failed to fetch products", "error")
    }
  }

  const fetchSchedules = async () => {
    try {
      const response = await Axios.get("/api/prodSched/list")
      const sch = response.data.map((s: any) => ({
        id: s.id,
        description: s.description,
      }))
      setSchedules(sch)
    } catch (error) {
      showToast("Failed to fetch production schedules", "error")
    }
  }

  const fetchWorkOrders = async () => {
    try {
      setIsLoading(true)
      const response = await Axios.get("/api/workOrders/list")
      const orders = response.data.map((order: any) => ({
        ...order,
        productId: order.product?.id || order.productId,
        productionScheduleId: order.prodSched?.id || order.productionScheduleId,
      }))
      setWorkOrders(orders)
    } catch (error) {
      showToast("Failed to fetch work orders", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
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
      }
      await Axios.post("/api/workOrders/create", payload)
      showToast("Work order created successfully", "success")
      setIsCreateModalOpen(false)
      setWorkOrderForm({
        productId: "",
        quantity: 0,
        status: "IN_PROGRESS",
        assignedTo: "",
        deadline: "",
        productionScheduleId: "",
      })
      fetchWorkOrders()
    } catch (error) {
      showToast("Failed to create work order", "error")
      console.error("Create work order error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWorkOrder) return
    setIsSubmitting(true)
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
      }
      await Axios.patch(`/api/workOrders/${selectedWorkOrder.id}`, payload)
      showToast("Work order updated successfully", "success")
      setIsEditModalOpen(false)
      setSelectedWorkOrder(null)
      setWorkOrderForm({
        productId: "",
        quantity: 0,
        status: "IN_PROGRESS",
        assignedTo: "",
        deadline: "",
        productionScheduleId: "",
      })
      fetchWorkOrders()
    } catch (error) {
      showToast("Failed to update work order", "error")
      console.error("Update work order error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteConfirmation = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setWorkOrderToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    setIsSubmitting(true)
    try {
      await Axios.delete(`/api/workOrders/${id}`)
      showToast("Work order deleted successfully", "success")
      setIsDeleteModalOpen(false)
      setWorkOrderToDelete(null)
      fetchWorkOrders()
    } catch (error) {
      showToast("Failed to delete work order", "error")
      console.error("Delete work order error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openViewModal = (order: WorkOrder) => {
    setSelectedWorkOrder(order)
    setIsViewModalOpen(true)
  }

  const openEditModal = (order: WorkOrder) => {
    setSelectedWorkOrder(order)
    setWorkOrderForm({
      productId: order.productId,
      quantity: order.quantity,
      status: order.status,
      assignedTo: order.assignedTo,
      deadline: new Date(order.deadline).toISOString().substring(0, 16),
      productionScheduleId: order.productionScheduleId || "",
    })
    setIsEditModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            In Progress
          </span>
        )
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Work Orders</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Work Order
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-28"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-36"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : workOrders.length > 0 ? (
                  workOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {products.find((p) => p.id === order.productId)?.name || order.productId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{order.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{order.assignedTo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {new Date(order.deadline).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {order.productionScheduleId
                          ? schedules.find((s) => s.id === order.productionScheduleId)?.description ||
                          order.productionScheduleId
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openViewModal(order)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                            title="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => openDeleteConfirmation(order.id, e)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No work orders available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Create New Work Order</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={workOrderForm.productId}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, productId: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={workOrderForm.quantity}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, quantity: Number(e.target.value) })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={workOrderForm.status}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          status: e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED",
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={workOrderForm.assignedTo}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, assignedTo: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Enter name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="datetime-local"
                        value={workOrderForm.deadline}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, deadline: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Production Schedule</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClipboardList className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={workOrderForm.productionScheduleId}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, productionScheduleId: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Work Order
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedWorkOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Work Order Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Product</label>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900 font-medium">
                      {products.find((p) => p.id === selectedWorkOrder.productId)?.name || selectedWorkOrder.productId}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-gray-900 font-medium">{selectedWorkOrder.quantity}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div>{getStatusBadge(selectedWorkOrder.status)}</div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Assigned To</label>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900 font-medium">{selectedWorkOrder.assignedTo}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Deadline</label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900 font-medium">{new Date(selectedWorkOrder.deadline).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Production Schedule</label>
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900 font-medium">
                      {selectedWorkOrder.productionScheduleId
                        ? schedules.find((s) => s.id === selectedWorkOrder.productionScheduleId)?.description ||
                        selectedWorkOrder.productionScheduleId
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    openEditModal(selectedWorkOrder)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedWorkOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Edit Work Order</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={workOrderForm.productId}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, productId: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={workOrderForm.quantity}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, quantity: Number(e.target.value) })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={workOrderForm.status}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          status: e.target.value as "PENDING" | "IN_PROGRESS" | "COMPLETED",
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={workOrderForm.assignedTo}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, assignedTo: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Enter name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="datetime-local"
                        value={workOrderForm.deadline}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, deadline: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Production Schedule</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClipboardList className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={workOrderForm.productionScheduleId}
                        onChange={(e) => setWorkOrderForm({ ...workOrderForm, productionScheduleId: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Work Order
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Are you sure you want to delete this work order? This action cannot be undone.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    <strong>Warning:</strong> Deleting this work order may affect production schedules and resource
                    allocation.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => workOrderToDelete && handleDelete(workOrderToDelete)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Work Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
            <div
              className={`flex items-center p-4 rounded-lg shadow-lg ${toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
                }`}
            >
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5 mr-3 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 mr-3 text-red-500" />
              )}
              <p className="font-medium">{toast.message}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

