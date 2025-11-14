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

  const { data, error } = await supabase
    .from('person')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}