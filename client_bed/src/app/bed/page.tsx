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
import { Share2, Heart, DollarSign, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import toastService from "@/utils/toastService";
import BedSupportForm from "@/components/payment/BedSupportForm";


export default function BedDetailsPage() {
  const bedId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("bed")
      : null;
  const [bedData, setBedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (bedId) {
      const fetchBedData = async () => {
        try {
          const response = await axios(
            `${API_URL}/supporter/get-bed-data/${bedId}`
          );
          console.log("Bed Data:", response?.data);
          setBedData(response?.data);
          
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
          setLoading(false);
        }
      };
      fetchBedData();
    }
  }, [bedId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!bedData) return <NotFound />;

const handleShare = async () => {
  if (!window.location.href) {
    toastService.error("Link not available.");
    return;
  }

  const shareData = {
    title: " ",
    text: `Bed : ${bedData.bedNo}\nMonthly Contribution : ${bedData?.currency} ${bedData?.fixedAmount}\n\nClick this link:`,
    url: window.location.href,
  };

  // Enhanced sharing options
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showShareOptions(shareData);
      }
    }
  } else {
    showShareOptions(shareData);
  }
};

const showShareOptions = (shareData: { title: string; text: string; url: string }) => {
  const fullText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
  
  const shouldShare = window.confirm(
    `Share bed details?\n\n${shareData.text}\n\n` +
    `Click OK for WhatsApp or Cancel for other options`
  );

  if (shouldShare) {
    // WhatsApp
    window.open(
      `https://wa.me/?text=${encodeURIComponent(fullText)}`,
      "_blank"
    );
  } else {
    // Show additional options
    const option = prompt(
      "Choose sharing method:\n\n" +
      "1. Copy to clipboard\n" +
      "2. Email\n" +
      "3. Telegram\n" +
      "Enter option number:"
    );

    switch (option) {
      case "1":
        navigator.clipboard.writeText(fullText);
        toastService.success("Copied to clipboard!");
        break;
      case "2":
        window.open(
          `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(fullText)}`
        );
        break;
      case "3":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`
        );
        break;
      default:
        navigator.clipboard.writeText(fullText);
        toastService.success("Copied to clipboard!");
    }
  }
};

  const progressPercentage = Math.min(
    100,
    (bedData.totalAmountFromSupporters / bedData.totalAmountOfTheBed) * 100
  );

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
            Sponsor a Bed, <span className="text-blue-600">Sustain a Life</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Bring dignity and comfort to those in palliative care
          </p>
          <div className="flex justify-center items-center gap-3">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
              <Heart className="w-4 h-4" /> Bed {bedData.bedNo}
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
              <Target className="w-4 h-4" /> {bedData.countryName}
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
            title="Bed Value"
            value={`${bedData?.currency} ${bedData.totalAmountOfTheBed}`}
            icon={<DollarSign className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Monthly Support"
            value={
              bedData.fixedAmount
                ? `${bedData?.currency} ${bedData.fixedAmount}`
                : "No Limit"
            }
            icon={<DollarSign className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            title="Total Donations"
            value={`${bedData?.currency} ${bedData.totalAmountFromSupporters}`}
            icon={<Users className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            title="Amount Needed"
            value={`${bedData?.currency} ${(
              bedData.totalAmountOfTheBed - bedData.totalAmountFromSupporters
            ).toLocaleString()}`}
            icon={<Heart className="w-6 h-6 text-red-600" />}
            color="bg-red-50"
          />
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100"
        >
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Funding Progress
            </h3>
            <span className="text-sm font-medium text-blue-600">
              {progressPercentage.toFixed(1)}% Funded
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Raised: {bedData?.currency}{" "}
              {bedData.totalAmountFromSupporters.toLocaleString()}
            </span>
            <span>
              Goal: {bedData?.currency}{" "}
              {bedData.totalAmountOfTheBed.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Supporters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Supporters
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({bedData.supporters.length} supporters)
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Supporter</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Date</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bedData.supporters.map((supporter: any, index: any) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {supporter.supporterName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {supporter.supporterName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {bedData?.currency} {supporter.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(supporter.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bedData.supporters.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No supporters yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to support this bed!
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
                Commit to Care
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg mx-2">
              <DialogHeader>
                <DialogDescription className="max-h-[80vh] overflow-y-auto p-1">
                  <BedSupportForm bed={bedData} />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto py-6 px-8 text-lg font-semibold rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm transition-all bg-white"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share This Bed
          </Button>
        </motion.div>

        {/* Impact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-100"
        >
          <h3 className="text-xl font-bold text-blue-800 mb-4">Your Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ImpactItem
              title="Comfort"
              description="Provides a comfortable space for patients in need"
              icon="🛏️"
            />
            <ImpactItem
              title="Dignity"
              description="Helps maintain dignity in palliative care"
              icon="🤝"
            />
            <ImpactItem
              title="Support"
              description="Supports families during difficult times"
              icon="❤️"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({
  title,
  value,
  icon,
  color = "bg-blue-50",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className={`${color} p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md`}
    >
      <div className="flex items-start">
        <div className="p-2 rounded-lg bg-white shadow-sm mr-4">{icon}</div>
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
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
      {children}
    </td>
  );
}

function ImpactItem({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start">
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading bed details...</p>
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center h-screen px-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 max-w-md w-full rounded-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{message}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try again <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex justify-center items-center h-screen px-4">
      <div className="text-center max-w-md">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="mt-2 text-2xl font-medium text-gray-900">
          Bed Not Found
        </h2>
        <p className="mt-1 text-gray-600">
          The bed you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
