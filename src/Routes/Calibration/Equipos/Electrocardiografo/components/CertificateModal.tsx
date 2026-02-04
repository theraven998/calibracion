import React, { useState } from "react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData?: {
    id: string;
    name: string;
    date: string;
    status: "valid" | "expired" | "pending";
  };
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificateData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Certificado</h2>

        {certificateData ? (
          <div className="space-y-3">
            <p>
              <strong>ID:</strong> {certificateData.id}
            </p>
            <p>
              <strong>Nombre:</strong> {certificateData.name}
            </p>
            <p>
              <strong>Fecha:</strong> {certificateData.date}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  certificateData.status === "valid"
                    ? "bg-green-100 text-green-800"
                    : certificateData.status === "expired"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {certificateData.status}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No hay datos de certificado</p>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CertificateModal;
