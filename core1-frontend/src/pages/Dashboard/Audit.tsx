"use client";

import { useEffect, useState, FormEvent } from "react";
import {
    Plus,
    X,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/Layout";
import { useNavigate } from "@tanstack/react-router";
import Axios from "../../lib/Axios";
import { isAuthenticated } from "../../lib/useToken";

interface AuditRequest {
    _id: string;
    department: string;
    description: string;
    task: string[];
    createdAt: string;
}

interface AuditResponse {
    _id: string;
    text: string;
    image: string;
    createdAt: string;
}

interface CompletedAudit {
    _id: string;
    department: string;
    description: string;
    task: string[];
    responses: AuditResponse[];
    completedAt: string;
}

interface Toast {
    show: boolean;
    message: string;
    type: "success" | "error";
}

interface FormData {
    department: string;
    description: string;
    task: string[];
}

const DEPARTMENTS = [
    "Core1",
    "Admin",
    "Finance",
    "Hr1",
    "Hr2",
    "Hr3",
    "Hr4",
    "Logistic1",
    "Logistic2",
];

const getRequestUrl = (dept: string) => `https://backend-core2.jjm-manufacturing.com/api/auditRequest${dept}`;
const getCompletedUrl = (dept: string) => `https://backend-core2.jjm-manufacturing.com/api/auditCompletedTasks${dept}`;

export default function AuditRequestsPage() {
    const navigate = useNavigate();
    const [department, setDepartment] = useState<string>("Admin");
    const [requests, setRequests] = useState<AuditRequest[]>([]);
    const [completed, setCompleted] = useState<CompletedAudit[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [toast, setToast] = useState<Toast>({ show: false, message: "", type: "success" });

    const [formData, setFormData] = useState<FormData>({
        department: "Admin",
        description: "",
        task: [""]
    });

    useEffect(() => {
        isAuthenticated(navigate);
    }, [navigate]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type }), 3000);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [reqRes, compRes] = await Promise.all([
                Axios.get(getRequestUrl(department)),
                Axios.get(getCompletedUrl(department))
            ]);
            setRequests(reqRes.data);
            setCompleted(compRes.data);
        } catch (err) {
            showToast("Failed to fetch data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [department]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await Axios.post(getRequestUrl(formData.department), formData);
            showToast("Audit request sent successfully", "success");
            setIsCreateModalOpen(false);
            setFormData({ department, description: "", task: [""] });
            fetchData();
        } catch {
            showToast("Failed to send audit request", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Audit Dashboard - {department}</h1>
                    <div className="flex gap-3">
                        <select
                            className="border rounded-md px-2 py-1"
                            value={department}
                            onChange={(e) => {
                                setDepartment(e.target.value);
                                setFormData({ ...formData, department: e.target.value });
                            }}
                        >
                            {DEPARTMENTS.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> New Request
                        </button>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Requested Audits</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tasks</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={3} className="text-center px-6 py-4 text-gray-500">Loading...</td></tr>
                                ) : requests.length ? (
                                    requests.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-800">{item.description}</td>
                                            <td className="px-6 py-4 text-gray-600 whitespace-pre-line">{item.task.join("\n")}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={3} className="text-center px-6 py-4 text-gray-500">No audit requests found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Completed Audits</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Responses</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={2} className="text-center px-6 py-4 text-gray-500">Loading...</td></tr>
                                ) : completed.length ? (
                                    completed.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-800">{item.description}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <ul className="list-disc list-inside space-y-2">
                                                    {item.responses.map((res) => (
                                                        <li key={res._id}>
                                                            <div className="text-sm text-gray-700 whitespace-pre-line">{res.text.slice(0, 200)}...</div>
                                                            <a href={res.image} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View Report</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={2} className="text-center px-6 py-4 text-gray-500">No completed audits available.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Send Audit Request</h2>
                                <button onClick={() => setIsCreateModalOpen(false)}>
                                    <X className="h-6 w-6 text-gray-600" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border px-3 py-2 rounded-md"
                                        placeholder="Enter description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tasks</label>
                                    {formData.task.map((t, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            value={t}
                                            onChange={(e) => {
                                                const updated = [...formData.task];
                                                updated[idx] = e.target.value;
                                                setFormData({ ...formData, task: updated });
                                            }}
                                            className="mb-2 w-full border px-3 py-2 rounded-md"
                                            placeholder={`Task ${idx + 1}`}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, task: [...formData.task, ""] })}
                                        className="text-sm text-blue-600 hover:underline mt-1"
                                    >+ Add another task</button>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
    );
}