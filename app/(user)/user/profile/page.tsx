import Image from "next/image";
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/config/routes";
import { getUserData, getProfilePictureUrl } from "@/lib/api/users";
import { ProfileForm } from "@/app/(user)/user/profile/profile-form";
import { ProfilePictureUpload } from "@/app/(user)/user/profile/profile-picture-upload";

export default async function UserProfile() {
  // Fetch user data using shared API logic
  const { data, error } = await getUserData();
  if (error || !data || data.length === 0) {
    redirect(AUTH_ROUTES.LOGIN);
  }
  const personData = data[0];

  // Get profile picture URL
  const avatarUrl = await getProfilePictureUrl(personData.user_name);

  // Prepare user object for the form
  const user = {
    firstName: personData.first_name || "",
    lastName: personData.last_name || "",
    secondLastName: personData.second_last_name || "",
    username: personData.user_name || "",
    email: personData.email || "",
    idType: personData.document_type || "",
    idNumber: personData.identification || "",
    gender: personData.gender || "",
    phone: personData.telephone_number || "",
    dob: personData.birth_date || "",
    avatar: avatarUrl,
  };

  // Gender options
  const genderOptions = ["Hombre", "Mujer", "Otro"];

  return (
    <div className="min-h-screen bg-[#F7FCFA] py-12 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-semibold mb-10 flex items-center gap-3">
          Mi perfil
        </h1>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- Left column: user info form --- */}
          <div className="md:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <ProfileForm user={user} genderOptions={genderOptions} />
          </div>

          {/* --- Right column: stats + photo --- */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-between">
            {/* Profile photo */}
            <ProfilePictureUpload currentAvatar={user.avatar} username={user.username} />
          </div>
        </div>
      </div>
    </div>
  );
}
