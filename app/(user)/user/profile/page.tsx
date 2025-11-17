"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Toast, useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";
import { USER_ROUTES } from "@/config/routes";

export default function UserProfile() {
  const { toast, showToast, hideToast } = useToast();

  const { user: authUser } = useAuth();

  const [photo, setPhoto] = useState("/logo.png");
  // User info states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [secondLastName, setSecondLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [gender, setGender] = useState("");
  //const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");

  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const initialRef = useRef({ firstName: "", lastName: "", secondLastName: "", phone: "", gender: "" });
  const router = useRouter();

  // avatar not editable here; display only

  const handleSave = async () => {
    if (!authUser?.id) return showToast("Usuario no autenticado", "error");
    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        second_last_name: secondLastName,
        telephone_number: phone,
        gender,
      };

      const res = await fetch(`/api/persons/${authUser.id}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error ?? "Error updating profile");
      }

      showToast("Cambios guardados correctamente", "success");
    } catch (err: unknown) {
      console.error("Save profile error:", err);
      const message = err instanceof Error ? err.message : String(err);
      showToast(message ?? "Error al guardar cambios", "error");
    }
  };

  useEffect(() => {
    (async () => {
      if (!authUser?.id) return;
      try {
        const [pRes, eRes, listRes] = await Promise.all([
          fetch(`/api/persons/${authUser.id}/get`),
          fetch(`/api/persons/${authUser.id}/email/get`),
          fetch(`/api/persons/get`),
        ]);

        if (pRes.ok) {
          const pBody = await pRes.json();
          const data = Array.isArray(pBody.data) ? pBody.data[0] ?? null : pBody.data ?? null;
          if (data) {
            const fn = data.first_name ?? "";
            const ln = data.last_name ?? "";
            const sln = data.second_last_name ?? "";
            setFirstName(fn);
            setLastName(ln);
            setSecondLastName(sln);
            setUsername(data.user_name ?? "");
              const ph = data.telephone_number ?? "";
              const g = data.gender ?? "";
              setPhone(ph);
              setGender(g);
              setDob(data.birth_date ?? "");
              setIdType(data.document_type ?? "");
              setIdNumber(data.identification ?? "");
              if (data.avatar_url) setPhoto(data.avatar_url);

              // store initial values for dirty-check
              initialRef.current = { firstName: fn, lastName: ln, secondLastName: sln, phone: ph, gender: g };
          }
        }

        if (eRes.ok) {
          const eBody = await eRes.json();
          setEmail(eBody?.data?.email ?? "");
        }

        if (listRes.ok) {
          const listBody = await listRes.json();
          const rows = listBody?.data ?? [];
          const set = new Set<string>();
          for (const r of rows) if (r?.gender) set.add(String(r.gender));
          setGenderOptions(Array.from(set));
        }
      } catch (err: unknown) {
        console.error("Error loading profile data", err);
      }
    })();
  }, [authUser?.id]);

  const isDirty = (
    firstName !== initialRef.current.firstName ||
    lastName !== initialRef.current.lastName ||
    secondLastName !== initialRef.current.secondLastName ||
    phone !== initialRef.current.phone ||
    gender !== initialRef.current.gender
  );

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
                    value={email ?? ""}
                    disabled
                    className="w-full bg-gray-100 rounded-md px-3 py-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">{email ? email : 'Sin correo registrado'}</p>
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
                    {(genderOptions.length ? genderOptions : ["Hombre", "Mujer", "Otro"]).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* password editing is not available on this page */}

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
            </div>

            {/* --- Right column: stats + photo --- */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-between">
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
                {/* avatar upload removed; profile picture is display-only */}
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
