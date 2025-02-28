import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, X, Edit } from 'lucide-react';
import DashboardLayout from '../../components/Layout/Layout';
import { isAuthenticated } from '../../lib/useToken';
import { useNavigate } from '@tanstack/react-router';

interface Material {
  material: string;
  quantity: number;
  unit: string;
  price: number;
}

interface MaterialResponse {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  materials: MaterialResponse[];
}

const Materials = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

  const [productForm, setProductForm] = useState<{
    name: string;
    materials: Material[];
  }>({
    name: '',
    materials: [],
  });

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'backend-core1.jjm-manufacturing.com/api/products/list'
      );
      setProducts(response.data);
    } catch (error) {
      showToast('Failed to fetch products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name: productForm.name };
      if (productForm.materials.length > 0) {
        const validMaterials = productForm.materials.filter(
          (mat) => mat.material.trim() !== ''
        );
        if (validMaterials.length > 0) {
          payload.materials = { create: validMaterials };
        }
      }
      await axios.post(
        'backend-core1.jjm-manufacturing.com/api/product/create',
        payload
      );
      showToast('Product created successfully', 'success');
      setIsCreateModalOpen(false);
      setProductForm({ name: '', materials: [] });
      fetchProducts();
    } catch (error) {
      showToast('Failed to create product', 'error');
      console.error('Create product error:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const payload: any = { name: productForm.name };
      if (productForm.materials.length > 0) {
        const validMaterials = productForm.materials.filter(
          (mat) => mat.material.trim() !== ''
        );
        if (validMaterials.length > 0) {
          payload.materials = {
            deleteMany: {},
            create: validMaterials,
          };
        }
      }
      await axios.patch(
        `http://localhost:5000/api/product/${selectedProduct.id}`,
        payload
      );
      showToast('Product updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setProductForm({ name: '', materials: [] });
      fetchProducts();
    } catch (error) {
      showToast('Failed to update product', 'error');
      console.error('Update product error:', error);
    }
  };

  const handleDelete = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.delete(`http://localhost:5000/api/product/${id}`);
      showToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error) {
      showToast('Failed to delete product', 'error');
    }
  };

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      materials: product.materials.map((mat) => ({
        material: mat.material,
        quantity: mat.quantity,
        unit: mat.unit,
        price: mat.price,
      })),
    });
    setIsEditModalOpen(true);
  };

  const addMaterialRow = () => {
    setProductForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { material: '', quantity: 0, unit: '', price: 0 },
      ],
    }));
  };

  const removeMaterialRow = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const handleMaterialChange = (
    index: number,
    field: keyof Material,
    value: string | number
  ) => {
    const updatedMaterials = [...productForm.materials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    setProductForm((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materials Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{prod.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prod.materials.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openViewModal(prod)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(prod)}
                      className="text-green-600 hover:text-green-900 mx-2"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e: React.FormEvent) => handleDelete(prod.id, e)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={3}>
                    No products available.
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

        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Product</h2>
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materials
                  </label>
                  {productForm.materials.map((mat, index) => (
                    <div
                      key={index}
                      className="flex space-x-2 items-center mb-2"
                    >
                      <input
                        type="text"
                        placeholder="Material"
                        value={mat.material}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            'material',
                            e.target.value
                          )
                        }
                        className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={mat.quantity}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={mat.unit}
                        onChange={(e) =>
                          handleMaterialChange(index, 'unit', e.target.value)
                        }
                        className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={mat.price}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            'price',
                            Number(e.target.value)
                          )
                        }
                        className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeMaterialRow(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMaterialRow}
                    className="flex items-center text-blue-600 hover:text-blue-900"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Material
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Product
                </button>
              </form>
            </div>
          </div>
        )}

        {isViewModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Product Details</h2>
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
                    Product Name
                  </label>
                  <p className="text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materials
                  </label>
                  {selectedProduct.materials.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {selectedProduct.materials.map((mat) => (
                        <li key={mat.id}>
                          {mat.material} - {mat.quantity} {mat.unit} @{' '}
                          {mat.price}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-900">No materials assigned.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Product</h2>
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materials
                  </label>
                  {productForm.materials.map((mat, index) => (
                    <div
                      key={index}
                      className="flex space-x-2 items-center mb-2"
                    >
                      <input
                        type="text"
                        placeholder="Material"
                        value={mat.material}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            'material',
                            e.target.value
                          )
                        }
                        className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={mat.quantity}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={mat.unit}
                        onChange={(e) =>
                          handleMaterialChange(index, 'unit', e.target.value)
                        }
                        className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={mat.price}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            'price',
                            Number(e.target.value)
                          )
                        }
                        className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeMaterialRow(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMaterialRow}
                    className="flex items-center text-blue-600 hover:text-blue-900"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Material
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update Product
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

export default Materials;
