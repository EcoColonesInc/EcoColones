"use client";

import { useState } from "react";
import Image from "next/image";
import { Toast, useToast } from "@/components/ui/toast";

export default function UserProfile() {
  const { toast, showToast, hideToast } = useToast();

  const [photo, setPhoto] = useState("/logo.png"); // Example profile image
  // User info states, change these to fetch actual user data
  const [fullName, setFullName] = useState("David Morales Vargas");
  const [username, setUsername] = useState("dmoralesv");
  const [email, setEmail] = useState("davidmv@gmail.com");
  const [idType, setIdType] = useState("Cédula");
  const [idNumber, setIdNumber] = useState("118660376");
  const [gender, setGender] = useState("Hombre");
  const [password, setPassword] = useState("**********");
  const [phone, setPhone] = useState("+506 85779655");
  const [dob, setDob] = useState("2003-02-04");

  const [points] = useState("12300");
  const [material] = useState("10kg");
  const [exchange] = useState("1 = 1");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setPhoto(preview);
      showToast("Foto de perfil actualizada correctamente", "success");
    }
  };

  const handleSave = () => {
    showToast("Cambios guardados correctamente", "success");
    //Implement save button functionality
  };

  const handleCancel = () => {
    showToast("Cambios cancelados", "info");
    //Implement cancel button functionality
  };

  return (
    <>
      <div className="min-h-screen bg-[#F7FCFA] py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-semibold mb-10 flex items-center gap-3">
            Mi perfil{" "}
          </h1>

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* --- Left column: user info form --- */}
            <div className="md:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Usuario</label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Correo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de identificación</label>
                  <input
                    type="text"
                    value={idType}
                    disabled
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Identificación</label>
                  <input
                    type="text"
                    value={idNumber}
                    disabled
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                  >
                    <option>Hombre</option>
                    <option>Mujer</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>
              </form>

              {/* Buttons */}
              <div className="flex justify-center mt-10 gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-red-200 text-red-800 rounded-full hover:bg-red-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>

            {/* --- Right column: stats + photo --- */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-between">
              <div className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Puntos Acumulados:</label>
                  <input
                    type="text"
                    value={points}
                    disabled
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Puntos Canjeados:</label>
                  <input
                    type="text"
                    value={points}
                    disabled
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Diferencia de puntos:</label>
                  <input
                    type="text"
                    value={points}
                    disabled
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Material Reciclado:</label>
                  <input
                    type="text"
                    value={material}
                    disabled
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de cambio:</label>
                  <input
                    type="text"
                    value={exchange}
                    disabled
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Profile photo */}
              <div className="flex flex-col items-center mt-8">
                <div className="w-40 h-40 rounded-md overflow-hidden border-2 border-gray-200">
                  <Image
                    src={photo}
                    alt="Foto de perfil"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
                <label
                  htmlFor="photo-upload"
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-full text-sm cursor-pointer hover:bg-green-700"
                >
                  Subir foto
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
          position="top"
        />
      )}
    </>
  );
}
