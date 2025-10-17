"use client";

import { AlertCircle } from "lucide-react";

export function Qr({ supporter }: { supporter: any }) {
  const qrPhoto = supporter?.qrPhoto;
  console.log("QR Photo URL:", qrPhoto);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-6">
      <h3 className="text-lg font-medium text-gray-900">Scan to Pay via QR</h3>

      {qrPhoto ? (
        <img
          src={qrPhoto}
          alt="QR Code"
          crossOrigin="anonymous"
          className="w-48 h-48 rounded-md border shadow-md object-contain"
        />
      ) : (
        <div className="flex flex-col items-center text-center text-gray-500">
          <AlertCircle className="h-8 w-8 mb-2 text-red-500" />
          <p>No QR code available for this bed.</p>
        </div>
      )}
    </div>
  );
}
