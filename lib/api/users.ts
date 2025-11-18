import { createClient } from '@/utils/supabase/server';

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // If birthday hasn't occurred this year yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export async function getProfilePictureUrl(username: string): Promise<string> {
  const supabase = await createClient();
  
  // List files in profile_pictures bucket that match the username
  const { data, error } = await supabase
    .storage
    .from('profile_pictures')
    .list('', {
      search: username
    });

  if (error || !data || data.length === 0) {
    return '/user.jpg'; // Fallback to default
  }

  // Find the file that matches username with any extension
  const profilePic = data.find(file => 
    file.name.startsWith(username) && 
    (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png'))
  );

  if (!profilePic) {
    return '/user.jpg'; // Fallback to default
  }

  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('profile_pictures')
    .getPublicUrl(profilePic.name);

  return publicUrl;
}

export async function getUserData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized', data: null };
  }

  // Use the Postgres function `get_profile_info(p_user_id uuid)`
  // The function returns a TABLE; call it via RPC to get consolidated profile info.
  const { data, error } = await supabase.rpc('get_profile_info', { p_user_id: user.id });

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

// Fetch users with the most recycled amounts
// It is retrieved from the job's table 'userrecycling'
export async function getUsersWithMostRecycled() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('userrecycling')
    .select('person_id(first_name, last_name, second_last_name), collection_center_id(name), amount_recycle, date')
    .order('date', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch all user points with their info
// The points are retrieved by user
export async function getAllUsersPoints() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('point')
    .select('person_id(user_name), point_amount')
    .order('point_amount', { ascending: true });
  if (error) {
    return { error: error.message, data: null };
  }
  return { error: null, data };
}

// Fetch the points by user id
export async function getPointsByUserId(userId: string) {
  const supabase = await createClient();
    const { data, error } = await supabase
      .from('point')
      .select('person_id(user_name), point_amount')
      .eq('person_id', userId);
    if (error) {
      return { error: error.message, data: null };
    }
    return { error: null, data };
}