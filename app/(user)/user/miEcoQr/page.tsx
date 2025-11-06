"use client";

import QRCode from "react-qr-code";

export default function MiEcoQR() {
  const qrValue = "118660376";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <QRCode
          value={qrValue}
          size={260}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="Q"
          //includeMargin={false}
        />
      </div>

      {/* Instruction text */}
      <p className="mt-6 text-lg font-medium text-gray-800 max-w-md">
        Presenta este <span className="font-semibold">QR</span> en el centro de acopio.
      </p>
    </div>
  );
}
