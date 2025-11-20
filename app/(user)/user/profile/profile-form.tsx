"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/ui/toast";
import { USER_ROUTES } from "@/config/routes";
import type { UserProfile } from "@/types/user";

type GenderOption = {
  value: string;
  label: string;
};

type ProfileFormProps = {
  user: UserProfile;
  genderOptions: GenderOption[];
};

export function ProfileForm({ user, genderOptions }: ProfileFormProps) {
  const { toast, showToast, hideToast } = useToast();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [secondLastName, setSecondLastName] = useState(user.secondLastName);
  const [gender, setGender] = useState(user.gender);
  const [phone, setPhone] = useState(user.phone);

  const handleSave = async () => {
    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        second_last_name: secondLastName,
        telephone_number: phone,
        gender,
      };

      const res = await fetch(`/api/persons/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error ?? "Error updating profile");
      }

      showToast("Cambios guardados correctamente", "success");
      
      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      console.error("Save profile error:", err);
      const message = err instanceof Error ? err.message : String(err);
      showToast(message ?? "Error al guardar cambios", "error");
    }
  };

  const isDirty = (
    firstName !== user.firstName ||
    lastName !== user.lastName ||
    secondLastName !== user.secondLastName ||
    phone !== user.phone ||
    gender !== user.gender
  );

  return (
    <>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Primer apellido</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Segundo apellido</label>
          <input
            type="text"
            value={secondLastName}
            onChange={(e) => setSecondLastName(e.target.value)}
            className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Usuario</label>
          <input
            type="text"
            value={user.username}
            disabled
            className="w-full bg-[#E6F2EA] rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input
            type="email"
            value={user.email ?? ""}
            disabled
            className="w-full bg-gray-100 rounded-md px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            {user.email ? user.email : "Sin correo registrado"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de identificación</label>
          <input
            type="text"
            value={user.idType}
            disabled
            className="w-full bg-gray-100 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Identificación</label>
          <input
            type="text"
            value={user.idNumber}
            disabled
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
            {genderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
            value={user.dob}
            disabled
            className="w-full bg-gray-100 rounded-md px-3 py-2"
          />
        </div>
      </form>

      {/* Buttons */}
      <div className="flex justify-center mt-10 gap-4">
        <button
          type="button"
          onClick={() => router.push(USER_ROUTES.OVERVIEW)}
          className="px-6 py-2 bg-red-200 text-red-800 rounded-full hover:bg-red-300"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          className={
            `px-6 py-2 rounded-full font-medium ` +
            (isDirty
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-200 text-gray-800 cursor-not-allowed")
          }
        >
          Guardar Cambios
        </button>
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
