import axios from 'axios';
import { jsPDF } from 'jspdf';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/Layout';
import { isAuthenticated } from '../../lib/useToken';
import { useNavigate } from '@tanstack/react-router';

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

const Billing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    isAuthenticated(navigate);
  }, []);

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

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleInvoiceGeneration = () => {
    if (products.length === 0) {
      showToast('No products available to generate invoice', 'error');
      return;
    }
    const doc = new jsPDF();
    let yOffset = 20;

    doc.setFontSize(20);
    doc.text('Invoice', 10, yOffset);
    yOffset += 10;
    let grandTotal = 0;

    products.forEach((product) => {
      doc.setFontSize(16);
      doc.text(product.name, 10, yOffset);
      yOffset += 8;
      doc.setFontSize(12);

      product.materials.forEach((mat) => {
        const matCost = mat.price * mat.quantity;
        doc.text(
          `- ${mat.material}: ${mat.quantity} ${mat.unit} @ ${mat.price.toFixed(
            2
          )} = ${matCost.toFixed(2)}`,
          15,
          yOffset
        );
        yOffset += 6;
        grandTotal += matCost;
      });
      yOffset += 4;
    });

    doc.setFontSize(14);
    doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 10, yOffset);

    doc.save('invoice.pdf');
    showToast('Invoice generated successfully', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
          <button
            onClick={handleInvoiceGeneration}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Generate Invoice
          </button>
        </div>

        {/* Billing Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((prod) => {
                const totalCost = prod.materials.reduce(
                  (sum, mat) => sum + mat.price * mat.quantity,
                  0
                );
                return (
                  <React.Fragment key={prod.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prod.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prod.materials.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {totalCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => toggleRow(prod.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedRows.includes(prod.id)
                            ? 'Hide Details'
                            : 'Show Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.includes(prod.id) && (
                      <tr>
                        <td colSpan={4} className="bg-gray-100">
                          <div className="p-4">
                            <h3 className="font-semibold mb-2">
                              Cost Breakdown:
                            </h3>
                            <table className="min-w-full">
                              <thead>
                                <tr className="text-sm font-medium text-gray-600">
                                  <th className="px-4 py-2 text-left">
                                    Material
                                  </th>
                                  <th className="px-4 py-2 text-right">
                                    Quantity
                                  </th>
                                  <th className="px-4 py-2 text-left">Unit</th>
                                  <th className="px-4 py-2 text-right">
                                    Price
                                  </th>
                                  <th className="px-4 py-2 text-right">Cost</th>
                                </tr>
                              </thead>
                              <tbody className="text-sm text-gray-700">
                                {prod.materials.map((mat) => {
                                  const cost = mat.price * mat.quantity;
                                  return (
                                    <tr key={mat.id}>
                                      <td className="px-4 py-2">
                                        {mat.material}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        {mat.quantity}
                                      </td>
                                      <td className="px-4 py-2">{mat.unit}</td>
                                      <td className="px-4 py-2 text-right">
                                        {mat.price.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        {cost.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {products.length === 0 && !isLoading && (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={4}>
                    No products available.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

export default Billing;
