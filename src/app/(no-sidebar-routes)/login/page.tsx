import React from 'react';
import LoginPage from './LoginPage';
import { createClient } from '@/lib/server';
import { redirect } from 'next/navigation';
const page = async ({
    searchParams,
}: {
    searchParams: { message?: string }
}) => {

    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (!(error || !data?.user)) {
        redirect('/home')
    }
    console.log()
    return (
        <LoginPage searchParams={searchParams} />
    );
}

export default page;