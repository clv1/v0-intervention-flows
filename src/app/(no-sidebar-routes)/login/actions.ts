'use server';

import { createClient } from '@/lib/server';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  console.log(error);
  if (error) {
    return { error: 'Invalid email or password' };
  }

  return { success: true };
}
