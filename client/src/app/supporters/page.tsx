"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Share2, Heart, DollarSign, Users, BedDouble } from "lucide-react";
import { motion } from "framer-motion";
import { PaymentForm } from "@/components/paymentInd/PaymentForm";
import { Qr } from "@/components/paymentInd/Qr";


export default function SupporterDetailsPage() {
  const supporterId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("supporter")
      : null;
  console.log("Supporter ID:", supporterId);
  const [supporterData, setSupporterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (supporterId) {
      const fetchSupporterData = async () => {
        try {
          const response = await axios(
            `${API_URL}/payment/get-supporter-data/${supporterId}`
          );
          console.log(response);
          setSupporterData(response?.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      };
      fetchSupporterData();
    }
  }, [supporterId]);

  if (loading) return <div>Loading</div>;
  if (error) return <div>Error: {error}</div>;
  if (!supporterData) return <div>Supporter not found</div>;

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: "Check out this supporter's contributions to palliative care!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Sharing failed:", err);
      }
    } else {
      const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
        shareData.text + " " + shareData.url
      )}`;
      window.open(whatsappURL, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Supporter <span className="text-blue-600">Profile</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Viewing contributions and details for {supporterData?.supporterName}
          </p>
          <div className="flex justify-center items-center gap-3">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
              <Heart className="w-4 h-4" /> {supporterData?.totalPayments} Payments
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
              <BedDouble className="w-4 h-4" /> Bed {supporterData?.bedNo}
            </span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <StatCard
            title="Total Contributions"
            value={`${supporterData?.currency} ${supporterData.totalAmount.toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Online Payments"
            value={supporterData.totalOnlinePayments}
            icon={<DollarSign className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            title="Offline Payments"
            value={supporterData.totalOfflinePayments}
            icon={<Users className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            title="Payment Methods"
            value={supporterData.paymentMethods?.length || "Multiple"}
            icon={<Heart className="w-6 h-6 text-red-600" />}
            color="bg-red-50"
          />
        </motion.div>

        {/* Payments Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment History
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({supporterData.payments.length} records)
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Mode</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Reference</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supporterData.payments.map((payment: any, index: any) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-green-600">
                      {supporterData?.currency} {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.paymentMode === "online"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {payment.paymentMode.charAt(0).toUpperCase() + payment.paymentMode.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === "captured"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-mono">
                      {payment.reference || "N/A"}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {supporterData.payments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No payment records yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add the first payment for this supporter
              </p>
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="w-full sm:w-auto py-6 px-8 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-all hover:shadow-xl"
              >
                Make Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogDescription>
                  <Qr supporter={supporterData} />
                  {/* <PaymentForm supporter={supporterData} /> */}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Supporter Details Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-100"
        >
          <h3 className="text-xl font-bold text-blue-800 mb-4">Supporter Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
              <div className="space-y-2">
                <DetailRow label="Name" value={supporterData.supporterName} />
                <DetailRow label="Bed Number" value={supporterData.bedNo} />
                <DetailRow label="Country" value={supporterData.countryName} />
                <DetailRow label="Currency" value={supporterData.currency} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
              <div className="space-y-2">
                <DetailRow label="Total Contributions" value={`${supporterData.currency} ${supporterData.totalAmount.toLocaleString()}`} />
                <DetailRow label="First Payment" value={
                  supporterData.payments.length > 0 
                    ? new Date(supporterData.payments[supporterData.payments.length - 1].date).toLocaleDateString()
                    : "N/A"
                } />
                <DetailRow label="Last Payment" value={
                  supporterData.payments.length > 0 
                    ? new Date(supporterData.payments[0].date).toLocaleDateString()
                    : "N/A"
                } />
                <DetailRow label="Average Payment" value={
                  supporterData.payments.length > 0 
                    ? `${supporterData.currency} ${Math.round(supporterData.totalAmount / supporterData.payments.length).toLocaleString()}`
                    : "N/A"
                } />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Reusable Components (same as in BedDetailsPage)
function StatCard({ title, value, icon, color = "bg-blue-50" }: { title: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div className={`${color} p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md`}>
      <div className="flex items-start">
        <div className="p-2 rounded-lg bg-white shadow-sm mr-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
      {children}
    </td>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// Keep the same LoadingSpinner, ErrorDisplay, and NotFound components from BedDetailsPage