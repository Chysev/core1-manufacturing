"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Eye,
  X,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ClipboardList,
  Edit,
  Loader2,
} from "lucide-react"
import DashboardLayout from "../../components/Layout/Layout"
import { useNavigate } from "@tanstack/react-router"
import Axios from "../../lib/Axios"
import { isAuthenticated } from "../../lib/useToken"

type PROD_SCHED_STATUS = "ONTIME" | "DELAYED" | "BEHIND_SCHEDULE"

interface ProductionSchedule {
  id: string
  status: PROD_SCHED_STATUS
  description?: string
  start: string
  end: string
  workOrders?: any[]
}

export default function MasterProductionPage() {
  const navigate = useNavigate()

  const [schedules, setSchedules] = useState<ProductionSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ProductionSchedule | null>(null)
  const [formData, setFormData] = useState({
    status: "ONTIME" as PROD_SCHED_STATUS,
    description: "",
    start: "",
    end: "",
  })

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null)

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      const response = await Axios.get("/api/prodSched/list")
      setSchedules(response.data)
    } catch (error) {
      showToast("Failed to fetch schedules", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formattedData = {
        ...formData,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
      }

      await Axios.post("/api/prodSched/create", formattedData)
      showToast("Schedule created successfully", "success")
      setIsCreateModalOpen(false)
      setFormData({
        status: "ONTIME",
        description: "",
        start: "",
        end: "",
      })
      fetchSchedules()
    } catch (error) {
      showToast("Failed to create schedule", "error")
      console.error("Create error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsSubmitting(true)
    try {
      await Axios.delete(`/api/prodSched/${id}`)
      showToast("Schedule deleted successfully", "success")
      setIsDeleteModalOpen(false)
      setScheduleToDelete(null)
      fetchSchedules()
    } catch (error) {
      showToast("Failed to delete schedule", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteConfirmation = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setScheduleToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const getStatusBadge = (status: PROD_SCHED_STATUS) => {
    switch (status) {
      case "ONTIME":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            On Time
          </span>
        )
      case "DELAYED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Delayed
          </span>
        )
      case "BEHIND_SCHEDULE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Behind Schedule
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}${diffHours > 0 ? `, ${diffHours} hr${diffHours !== 1 ? "s" : ""}` : ""}`
    }
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`
  }

  const isScheduleActive = (schedule: ProductionSchedule) => {
    const now = new Date()
    const start = new Date(schedule.start)
    const end = new Date(schedule.end)
    return now >= start && now <= end
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Production Schedules</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Schedule
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
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
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-40"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-36"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-36"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : schedules.length > 0 ? (
                  schedules.map((schedule) => {
                    const isActive = isScheduleActive(schedule)
                    return (
                      <tr
                        key={schedule.id}
                        className={`hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(schedule.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {schedule.description || <span className="text-gray-500 italic">No description</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1.5" />
                            {formatDate(schedule.start)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1.5" />
                            {formatDate(schedule.end)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {calculateDuration(schedule.start, schedule.end)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSchedule(schedule)
                                setIsViewModalOpen(true)
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                              title="View details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => openDeleteConfirmation(schedule.id, e)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No production schedules available.
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
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Create New Schedule</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClipboardList className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as PROD_SCHED_STATUS,
                        })
                      }
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ONTIME">On Time</option>
                      <option value="DELAYED">Delayed</option>
                      <option value="BEHIND_SCHEDULE">Behind Schedule</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Edit className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter schedule description"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      value={formData.start}
                      onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      value={formData.end}
                      onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
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
                        Create Schedule
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Schedule Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    {getStatusBadge(selectedSchedule.status)}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-900 font-medium">
                      {selectedSchedule.description || (
                        <span className="text-gray-500 italic">No description provided</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Start Date</h3>
                    <div className="flex items-center text-gray-900 font-medium">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(selectedSchedule.start)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">End Date</h3>
                    <div className="flex items-center text-gray-900 font-medium">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(selectedSchedule.end)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Duration</h3>
                  <div className="flex items-center text-gray-900 font-medium">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    {calculateDuration(selectedSchedule.start, selectedSchedule.end)}
                  </div>
                </div>

                {isScheduleActive(selectedSchedule) && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center text-blue-800">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium">This schedule is currently active</span>
                    </div>
                  </div>
                )}

                {selectedSchedule.workOrders && selectedSchedule.workOrders.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Associated Work Orders</h3>
                    <div className="max-h-40 overflow-y-auto">
                      <ul className="divide-y divide-gray-200">
                        {selectedSchedule.workOrders.map((order: any) => (
                          <li key={order.id} className="py-2">
                            <div className="flex items-center">
                              <ClipboardList className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900">{order.id}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Associated Work Orders</h3>
                    <p className="text-gray-500 italic">No work orders associated with this schedule</p>
                  </div>
                )}
              </div>
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
                    Are you sure you want to delete this production schedule? This action cannot be undone.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    <strong>Warning:</strong> Deleting this schedule may affect any associated work orders.
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
                    onClick={() => scheduleToDelete && handleDelete(scheduleToDelete)}
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
                        Delete Schedule
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

