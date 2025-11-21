import { NextResponse } from 'next/server'
import { createClient } from "@/utils/supabase/server";


// GET /api/collectioncenters/getUserCenter
// REMEMBER TO LOGIN AS A MANAGER TO TEST THIS ENDPOINT
export async function GET() {
    const supabase = await createClient();

    try {
        if (!supabase) {
        return NextResponse.json(
            { message: 'Supabase client initialization failed' },
            { status: 500 }
        )
        }
        
        // Verify the token and get the user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
        return NextResponse.json(
            { message: 'Invalid or expired token' },
            { status: 401 }
        )
        }

        // Fetch businesses where the user is the manager
        const { data: businesses, error } = await supabase
        .from('collectioncenter')
        .select(`
            collectioncenter_id,
            district_id,
            name,
            phone,
            email,
            description,
            manager_id,
            latitude,
            longitude
        `)
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false })

        if (error) {
        console.error('Error fetching businesses:', error)
        return NextResponse.json(
            { message: 'Error fetching businesses', error: error.message },
            { status: 500 }
        )
        }

        return NextResponse.json({ businesses })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
        )
    }
}