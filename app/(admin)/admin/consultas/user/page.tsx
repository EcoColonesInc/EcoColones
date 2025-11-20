import ConsultasUsuariosClient from "@/app/(admin)/admin/consultas/user/ConsultasUsuariosCliente";
import { getAllPersons, getPersonsWithoutPasswordChange } from "@/lib/api/persons";
import { getAllUsersPoints } from "@/lib/api/users";
import {
  getAllCountries,
  getAllProvinces,
  getAllCities,
  getAllDistricts,
} from "@/lib/api/locations";

export const revalidate = 0;

export default async function AdminConsultasPage() {
  const [
    personsRes,
    pointsRes,
    countriesRes,
    provincesRes,
    citiesRes,
    districtsRes,
    noPwdRes,
  ] = await Promise.all([
    getAllPersons(),
    getAllUsersPoints(),
    getAllCountries(),
    getAllProvinces(),
    getAllCities(),
    getAllDistricts(),
    getPersonsWithoutPasswordChange(),
  ]);
  return (
    <ConsultasUsuariosClient
      initialPersons={(personsRes.data ?? []) as unknown[]}
      initialPoints={(pointsRes.data ?? []) as unknown[]}
      initialCountries={(countriesRes.data ?? []) as unknown[]}
      initialProvinces={(provincesRes.data ?? []) as unknown[]}
      initialCities={(citiesRes.data ?? []) as unknown[]}
      initialDistricts={(districtsRes.data ?? []) as unknown[]}
      initialNoPwdChange={(noPwdRes.data ?? []) as unknown[]}
    />
  );
}
