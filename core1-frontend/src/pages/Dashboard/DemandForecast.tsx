"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Eye,
  X,
  Edit,
  Calendar,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  Loader2,
  PhilippinePeso,
  LineChart,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react"
import DashboardLayout from "../../components/Layout/Layout"
import { useNavigate } from "@tanstack/react-router"
import Axios from "../../lib/Axios"
import { isAuthenticated } from "../../lib/useToken"

interface DemandForecast {
  id: string
  month: string
  sales: number
}

interface MovingAverage {
  window: number
  months: string
  average: number
}

interface SalesMonth {
  id: string
  month: string
  sales: number
}

interface ForecastAnalysis {
  movingAverages: MovingAverage[]
  totalSales: number
  averageSales: number
  highestSales: SalesMonth
  lowestSales: SalesMonth
  predictedNextMonthSales: number
  analysis: string
}

export default function DemandForecastPage() {
  const navigate = useNavigate()

  const [forecasts, setForecasts] = useState<DemandForecast[]>([])
  const [analysis, setAnalysis] = useState<ForecastAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [selectedForecast, setSelectedForecast] = useState<DemandForecast | null>(null)
  const [formData, setFormData] = useState({
    month: "",
    sales: 0,
  })

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchForecasts = async () => {
    try {
      setIsLoading(true)
      const response = await Axios.get("/api/forecast/list")
      setForecasts(response.data)
    } catch (error) {
      showToast("Failed to fetch forecasts", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalysis = async () => {
    try {
      setIsAnalysisLoading(true)
      const response = await Axios.get("/api/forecast/analysis")
      setAnalysis(response.data)
    } catch (error) {
      showToast("Failed to fetch forecast analysis", "error")
    } finally {
      setIsAnalysisLoading(false)
    }
  }

  useEffect(() => {
    fetchForecasts()
    fetchAnalysis()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await Axios.post("/api/forecast/create", formData)
      showToast("Forecast created successfully", "success")
      setIsCreateModalOpen(false)
      setFormData({ month: "", sales: 0 })
      fetchForecasts()
      fetchAnalysis() // Refresh analysis after creating a new forecast
    } catch (error) {
      showToast("Failed to create forecast", "error")
      console.error("Create forecast error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForecast) return
    setIsSubmitting(true)
    try {
      await Axios.patch(`/api/forecast/${selectedForecast.id}`, formData)
      showToast("Forecast updated successfully", "success")
      setIsEditModalOpen(false)
      setSelectedForecast(null)
      setFormData({ month: "", sales: 0 })
      fetchForecasts()
      fetchAnalysis() // Refresh analysis after updating a forecast
    } catch (error) {
      showToast("Failed to update forecast", "error")
      console.error("Update forecast error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [forecastToDelete, setForecastToDelete] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true)
      await Axios.delete(`/api/forecast/${id}`)
      showToast("Forecast deleted successfully", "success")
      fetchForecasts()
      fetchAnalysis() // Refresh analysis after deleting a forecast
      setForecastToDelete(null)
      setIsDeleteModalOpen(false)
    } catch (error) {
      showToast("Failed to delete forecast", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openViewModal = (forecast: DemandForecast) => {
    setSelectedForecast(forecast)
    setIsViewModalOpen(true)
  }

  const openEditModal = (forecast: DemandForecast) => {
    setSelectedForecast(forecast)
    setFormData({ month: forecast.month, sales: forecast.sales })
    setIsEditModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Demand Forecasts</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAnalysisModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                disabled={isAnalysisLoading || !analysis}
              >
                <FileText className="h-4 w-4" />
                View Analysis
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Forecast
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Sales</p>
                  {isAnalysisLoading ? (
                    <div className="h-8 bg-blue-100 rounded animate-pulse w-24 mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{analysis?.totalSales.toLocaleString() || "0"}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <PhilippinePeso className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Average Sales</p>
                  {isAnalysisLoading ? (
                    <div className="h-8 bg-green-100 rounded animate-pulse w-24 mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis?.averageSales.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "0"}
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Highest Month</p>
                  {isAnalysisLoading ? (
                    <div className="h-8 bg-purple-100 rounded animate-pulse w-24 mt-1"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{analysis?.highestSales.month || "-"}</p>
                      {analysis?.highestSales.month && (
                        <p className="text-sm text-gray-500">{analysis.highestSales.sales.toLocaleString()} sales</p>
                      )}
                    </>
                  )}
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Lowest Month</p>
                  {isAnalysisLoading ? (
                    <div className="h-8 bg-amber-100 rounded animate-pulse w-24 mt-1"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{analysis?.lowestSales.month || "-"}</p>
                      {analysis?.lowestSales.month && (
                        <p className="text-sm text-gray-500">{analysis.lowestSales.sales.toLocaleString()} sales</p>
                      )}
                    </>
                  )}
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600 transform rotate-180" />
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Card */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <LineChart className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-indigo-600">Predicted Next Month Sales</h3>
                  {isAnalysisLoading ? (
                    <div className="h-7 bg-indigo-100 rounded animate-pulse w-32 mt-1"></div>
                  ) : (
                    <p className="text-xl font-bold text-gray-900">
                      {analysis?.predictedNextMonthSales.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "0"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsAnalysisModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                disabled={isAnalysisLoading || !analysis}
              >
                View Full Analysis
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
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
                ) : forecasts.length > 0 ? (
                  forecasts.map((forecast) => (
                    <tr key={forecast.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{forecast.month}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <PhilippinePeso className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">{forecast.sales.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openViewModal(forecast)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                            title="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(forecast)}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setForecastToDelete(forecast.id)
                              setIsDeleteModalOpen(true)
                            }}
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
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No forecasts available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Moving Average Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Moving Averages</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Based on multiple window sizes</span>
          </div>
          <div className="p-6">
            {isAnalysisLoading ? (
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : !analysis?.movingAverages.length ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                <p className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Not enough data to calculate moving averages.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.movingAverages.map((avg) => (
                  <div key={avg.window} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">Window {avg.window}</span>
                      <span className="text-lg font-bold text-gray-900">
                        {avg.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Months: {avg.months}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Create New Forecast</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                    Month
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="month"
                      type="text"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., January 2023"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="sales" className="block text-sm font-medium text-gray-700">
                    Sales
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhilippinePeso className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="sales"
                      type="number"
                      value={formData.sales}
                      onChange={(e) => setFormData({ ...formData, sales: Number(e.target.value) })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter sales amount"
                      min="0"
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
                        Create Forecast
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedForecast && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Forecast Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">{selectedForecast.month}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Sales</span>
                    <span className="text-xl font-bold text-gray-900">{selectedForecast.sales.toLocaleString()}</span>
                  </div>
                </div>

                {/* Additional context - where this month stands */}
                <div className="space-y-4">
                  {analysis && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Compared to average:</span>
                        <div
                          className={`flex items-center ${selectedForecast.sales > analysis.averageSales ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {selectedForecast.sales > analysis.averageSales ? (
                            <>
                              <TrendingUp className="h-4 w-4 mr-1" />
                              <span className="font-medium">
                                {((selectedForecast.sales / analysis.averageSales - 1) * 100).toFixed(1)}% above
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                              <span className="font-medium">
                                {((1 - selectedForecast.sales / analysis.averageSales) * 100).toFixed(1)}% below
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Percentage of total:</span>
                        <span className="font-medium">
                          {analysis.totalSales > 0
                            ? ((selectedForecast.sales / analysis.totalSales) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    openEditModal(selectedForecast)
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
        {isEditModalOpen && selectedForecast && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Edit Forecast</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="edit-month" className="block text-sm font-medium text-gray-700">
                    Month
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="edit-month"
                      type="text"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., January 2023"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-sales" className="block text-sm font-medium text-gray-700">
                    Sales
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhilippinePeso className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="edit-sales"
                      type="number"
                      value={formData.sales}
                      onChange={(e) => setFormData({ ...formData, sales: Number(e.target.value) })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter sales amount"
                      min="0"
                      required
                    />
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
                        Update Forecast
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
                    <XCircle className="h-5 w-5 mr-2 text-red-600" />
                    Are you sure you want to delete this forecast? This action cannot be undone.
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
                    onClick={() => forecastToDelete && handleDelete(forecastToDelete)}
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
                        Delete Forecast
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Modal */}
        {isAnalysisModalOpen && analysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Sales Performance Analysis</h2>
                <button
                  onClick={() => setIsAnalysisModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{analysis.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-green-600 mb-1">Average Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis.averageSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Predicted Next Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis.predictedNextMonthSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Extremes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <p className="text-sm font-medium text-purple-600 mb-1">Highest Sales Month</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-bold text-gray-900">{analysis.highestSales.month}</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {analysis.highestSales.sales.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <p className="text-sm font-medium text-amber-600 mb-1">Lowest Sales Month</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-bold text-gray-900">{analysis.lowestSales.month}</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {analysis.lowestSales.sales.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analysis Text */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Analysis</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {analysis.analysis.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph.split("\n").map((line, lineIndex) => (
                          <React.Fragment key={lineIndex}>
                            {line}
                            {lineIndex < paragraph.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setIsAnalysisModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
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

