"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import DonationForm from "../donate/donationForm";
import { Button } from "@/components/ui/button";
// Define your types

export default function BedDetailsPage() {
  const searchParams = useSearchParams();
  const bedId = searchParams.get("bed");
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
          console.log(response.data);
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
    const shareData = {
      title: document.title,
      text: "Check this out!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Sharing failed:", err);
      }
    } else {
      // Fallback for WhatsApp
      const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
        shareData.text + " " + shareData.url
      )}`;
      window.open(whatsappURL, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">
            Bed Details
          </h1>
          <div className="flex justify-center items-center gap-4">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              Bed {bedData.bedNo}
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {bedData.countryName}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Bed Value"
            value={`${
              bedData?.currency
            } ${bedData.totalAmountOfTheBed.toLocaleString()}`}
            icon="💰"
          />
          <StatCard
            title="Total Supporters"
            value={bedData.totalNoOfSupportersByBed}
            icon="👥"
          />
          <StatCard
            title="Total Donations"
            value={`${
              bedData?.currency
            } ${bedData.totalAmountFromSupporters.toLocaleString()}`}
            icon="💸"
          />
          <StatCard
            title="Amount Still Needed"
            value={
              bedData?.currency +
                (bedData.totalAmountOfTheBed -
                  bedData.totalAmountFromSupporters) || 0
            }
            icon="💸"
          />
        </div>

        {/* Supporters Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Supporters</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Date</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bedData.supporters.map((supporter: any, index: any) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <TableCell>{supporter.supporterName}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {bedData?.currency} {supporter.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(supporter.date).toLocaleDateString()}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bedData.supporters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No supporters found for this bed
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex justify-between gap-2">
          <div className="w-full ">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Funding Progress (
              {(
                (bedData.totalAmountFromSupporters /
                  bedData.totalAmountOfTheBed) *
                100
              ).toFixed(1)}
              %)
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-indigo-600 h-4 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (bedData.totalAmountFromSupporters /
                      bedData.totalAmountOfTheBed) *
                      100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>
                {bedData?.currency}{" "}
                {bedData.totalAmountFromSupporters.toLocaleString()}
              </span>
              <span>
                {bedData?.currency}{" "}
                {bedData.totalAmountOfTheBed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-4 ">
          <Dialog>
            <DialogTrigger
              className={` p-4 rounded-xl font-medium transition-all duration-300
                    bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 whitespace-nowrap`}
            >
              Commit to Care
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogDescription>
                  <DonationForm bed={bedData?.bedId} />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleShare}
            className="p-4 rounded-xl font-medium transition-all duration-300
                bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 whitespace-nowrap h-full"
          >
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
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
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}
    >
      {children}
    </td>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
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
          <div className="ml-3">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-medium text-gray-800 mb-2">
          Bed Not Found
        </h2>
        <p className="text-gray-600">
          The bed you're looking for doesn't exist or has been removed.
        </p>
      </div>
    </div>
  );
}
