// This component is for users to upload a new profile picture
'use client';

import { useState, useRef } from "react";
import Image from "next/image";

type ProfilePictureUploadProps = {
  currentAvatar: string;
  username: string;
};

export function ProfilePictureUpload({username }: ProfilePictureUploadProps) {
  const [pfpUrl, setPfpUrl] = useState<string>(`${process.env.NEXT_PUBLIC_STORAGE_URL}${username}.jpg`);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Por favor selecciona una imagen válida (JPG o PNG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('username', username);

      const response = await fetch('/api/users/update-profile-picture', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir la imagen');
      }

      // Update the profile picture URL to reflect the new upload
      setPfpUrl(result.photoUrl);

    } catch (err) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message ?? "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="w-40 h-40 rounded-md overflow-hidden border-2 border-gray-200 relative">
        <Image
          src={pfpUrl}
          alt="Foto de perfil"
          width={160}
          height={160}
          className="object-cover w-full h-full"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm">Subiendo...</div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Subiendo..." : "Cambiar foto"}
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        PNG / JPG. Máx 5MB
      </p>
      
      {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
    </div>
  );
}