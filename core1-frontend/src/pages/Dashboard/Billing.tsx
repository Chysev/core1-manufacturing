"use client"

import { jsPDF } from "jspdf"
import React, { useState, useEffect } from "react"
import DashboardLayout from "../../components/Layout/Layout"
import { useNavigate } from "@tanstack/react-router"
import Axios from "../../lib/Axios"
import { ChevronDown, ChevronUp, FileText, CheckCircle, XCircle } from "lucide-react"
import { isAuthenticated } from "../../lib/useToken"

interface MaterialResponse {
  id: string
  material: string
  quantity: number
  unit: string
  price: number
}

interface Product {
  id: string
  name: string
  materials: MaterialResponse[]
}

export default function BillingPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await Axios.get("/api/products/list")
      setProducts(response.data)
    } catch (error) {
      showToast("Failed to fetch products", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const handleInvoiceGeneration = () => {
    if (products.length === 0) {
      showToast("No products available to generate invoice", "error")
      return
    }

    const doc = new jsPDF()
    let yOffset = 20

    doc.setFontSize(20)
    doc.text("Invoice", 10, yOffset)
    yOffset += 10
    let grandTotal = 0

    products.forEach((product) => {
      doc.setFontSize(16)
      doc.text(product.name, 10, yOffset)
      yOffset += 8
      doc.setFontSize(12)

      product.materials.forEach((mat) => {
        const matCost = mat.price * mat.quantity
        doc.text(
          `- ${mat.material}: ${mat.quantity} ${mat.unit} @ ${mat.price.toFixed(2)} = ${matCost.toFixed(2)}`,
          15,
          yOffset,
        )
        yOffset += 6
        grandTotal += matCost
      })
      yOffset += 4
    })

    doc.setFontSize(14)
    doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 10, yOffset)

    doc.save("invoice.pdf")
    showToast("Invoice generated successfully", "success")
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
            <button
              onClick={handleInvoiceGeneration}
              disabled={isLoading || products.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              Generate Invoice
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materials Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  // Skeleton loading rows
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-40"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : products.length > 0 ? (
                  products.map((prod) => {
                    const totalCost = prod.materials.reduce((sum, mat) => sum + mat.price * mat.quantity, 0)
                    const isExpanded = expandedRows.includes(prod.id)

                    return (
                      <React.Fragment key={prod.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{prod.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {prod.materials.length}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                            ${totalCost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => toggleRow(prod.id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Show Details
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={4} className="bg-gray-50 border-b border-gray-200">
                              <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Cost Breakdown</h3>
                                <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Material
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Quantity
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Unit
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Price
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Cost
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {prod.materials.map((mat) => {
                                        const cost = mat.price * mat.quantity
                                        return (
                                          <tr key={mat.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-800">{mat.material}</td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-700">
                                              {mat.quantity}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{mat.unit}</td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-700">
                                              ${mat.price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                                              ${cost.toFixed(2)}
                                            </td>
                                          </tr>
                                        )
                                      })}
                                      <tr className="bg-gray-50">
                                        <td colSpan={4} className="px-4 py-2 text-right font-medium text-gray-800">
                                          Total:
                                        </td>
                                        <td className="px-4 py-2 text-right font-bold text-gray-900">
                                          ${totalCost.toFixed(2)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No products available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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

