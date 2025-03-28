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
  Package,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import DashboardLayout from "../../components/Layout/Layout"
import { useNavigate } from "@tanstack/react-router"
import Axios from "../../lib/Axios"
import { isAuthenticated } from "../../lib/useToken"

interface Material {
  material: string
  quantity: number
  unit: string
  price: number
}

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

export default function MaterialsPage() {
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const [productForm, setProductForm] = useState<{
    name: string
    materials: Material[]
  }>({
    name: "",
    materials: [],
  })

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = { name: productForm.name }
      if (productForm.materials.length > 0) {
        const validMaterials = productForm.materials.filter((mat) => mat.material.trim() !== "")
        if (validMaterials.length > 0) {
          payload.materials = { create: validMaterials }
        }
      }
      await Axios.post("/api/product/create", payload)
      showToast("Product created successfully", "success")
      setIsCreateModalOpen(false)
      setProductForm({ name: "", materials: [] })
      fetchProducts()
    } catch (error) {
      showToast("Failed to create product", "error")
      console.error("Create product error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    setIsSubmitting(true)
    try {
      const payload: any = { name: productForm.name }
      if (productForm.materials.length > 0) {
        const validMaterials = productForm.materials.filter((mat) => mat.material.trim() !== "")
        if (validMaterials.length > 0) {
          payload.materials = {
            deleteMany: {},
            create: validMaterials,
          }
        }
      }
      await Axios.patch(`/api/product/${selectedProduct.id}`, payload)
      showToast("Product updated successfully", "success")
      setIsEditModalOpen(false)
      setSelectedProduct(null)
      setProductForm({ name: "", materials: [] })
      fetchProducts()
    } catch (error) {
      showToast("Failed to update product", "error")
      console.error("Update product error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteConfirmation = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setProductToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    setIsSubmitting(true)
    try {
      await Axios.delete(`/api/product/${id}`)
      showToast("Product deleted successfully", "success")
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      fetchProducts()
    } catch (error) {
      showToast("Failed to delete product", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openViewModal = (product: Product) => {
    setSelectedProduct(product)
    setIsViewModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setProductForm({
      name: product.name,
      materials: product.materials.map((mat) => ({
        material: mat.material,
        quantity: mat.quantity,
        unit: mat.unit,
        price: mat.price,
      })),
    })
    setIsEditModalOpen(true)
  }

  const addMaterialRow = () => {
    setProductForm((prev) => ({
      ...prev,
      materials: [...prev.materials, { material: "", quantity: 0, unit: "", price: 0 }],
    }))
  }

  const removeMaterialRow = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }))
  }

  const handleMaterialChange = (index: number, field: keyof Material, value: string | number) => {
    const updatedMaterials = [...productForm.materials]
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value }
    setProductForm((prev) => ({ ...prev, materials: updatedMaterials }))
  }

  const calculateTotalCost = (materials: MaterialResponse[] | Material[]) => {
    return materials.reduce((total, mat) => total + mat.price * mat.quantity, 0)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Products & Materials</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Product
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
                    Materials
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
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-40"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
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
                ) : products.length > 0 ? (
                  products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{prod.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {prod.materials.length} {prod.materials.length === 1 ? "material" : "materials"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                        ${calculateTotalCost(prod.materials).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openViewModal(prod)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                            title="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => openDeleteConfirmation(prod.id, e)}
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
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No products available.
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
                <h2 className="text-xl font-bold text-gray-800">Create New Product</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Materials</label>
                    <button
                      type="button"
                      onClick={addMaterialRow}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Material
                    </button>
                  </div>

                  {productForm.materials.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                      <p className="text-gray-500 text-sm">No materials added yet. Click "Add Material" to begin.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase">
                        <div className="col-span-4">Material</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Unit</div>
                        <div className="col-span-3">Price</div>
                        <div className="col-span-1"></div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {productForm.materials.map((mat, index) => (
                          <div key={index} className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <input
                                type="text"
                                placeholder="Material name"
                                value={mat.material}
                                onChange={(e) => handleMaterialChange(index, "material", e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                placeholder="Qty"
                                value={mat.quantity}
                                onChange={(e) => handleMaterialChange(index, "quantity", Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="text"
                                placeholder="Unit"
                                value={mat.unit}
                                onChange={(e) => handleMaterialChange(index, "unit", e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div className="col-span-3">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                                </div>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={mat.price}
                                  onChange={(e) => handleMaterialChange(index, "price", Number(e.target.value))}
                                  className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeMaterialRow(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Remove material"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                        <span className="text-sm font-bold text-gray-900">
                          ${calculateTotalCost(productForm.materials).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
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
                        Create Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">{selectedProduct.name}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Materials</h4>
                    <span className="text-sm font-medium text-gray-500">
                      Total Cost:{" "}
                      <span className="font-bold text-gray-900">
                        ${calculateTotalCost(selectedProduct.materials).toFixed(2)}
                      </span>
                    </span>
                  </div>

                  {selectedProduct.materials.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                      <p className="text-gray-500 text-sm">No materials assigned to this product.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase">
                        <div className="col-span-4">Material</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Unit</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-2">Total</div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {selectedProduct.materials.map((mat) => {
                          const total = mat.price * mat.quantity
                          return (
                            <div
                              key={mat.id}
                              className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-gray-50"
                            >
                              <div className="col-span-4 font-medium text-gray-900">{mat.material}</div>
                              <div className="col-span-2 text-gray-700">{mat.quantity}</div>
                              <div className="col-span-2 text-gray-700">{mat.unit}</div>
                              <div className="col-span-2 text-gray-700">${mat.price.toFixed(2)}</div>
                              <div className="col-span-2 font-medium text-gray-900">${total.toFixed(2)}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    openEditModal(selectedProduct)
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
        {isEditModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Materials</label>
                    <button
                      type="button"
                      onClick={addMaterialRow}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Material
                    </button>
                  </div>

                  {productForm.materials.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                      <p className="text-gray-500 text-sm">No materials added yet. Click "Add Material" to begin.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase">
                        <div className="col-span-4">Material</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Unit</div>
                        <div className="col-span-3">Price</div>
                        <div className="col-span-1"></div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {productForm.materials.map((mat, index) => (
                          <div key={index} className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <input
                                type="text"
                                placeholder="Material name"
                                value={mat.material}
                                onChange={(e) => handleMaterialChange(index, "material", e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                placeholder="Qty"
                                value={mat.quantity}
                                onChange={(e) => handleMaterialChange(index, "quantity", Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="text"
                                placeholder="Unit"
                                value={mat.unit}
                                onChange={(e) => handleMaterialChange(index, "unit", e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div className="col-span-3">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                                </div>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={mat.price}
                                  onChange={(e) => handleMaterialChange(index, "price", Number(e.target.value))}
                                  className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeMaterialRow(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Remove material"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                        <span className="text-sm font-bold text-gray-900">
                          ${calculateTotalCost(productForm.materials).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
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
                        Update Product
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
                    Are you sure you want to delete this product? This action cannot be undone.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    <strong>Warning:</strong> All materials associated with this product will also be deleted.
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
                    onClick={() => productToDelete && handleDelete(productToDelete)}
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
                        Delete Product
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

