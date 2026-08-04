import { NextResponse } from 'next/server';
import { createClient } from '../../../supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const city = searchParams.get('city') || '';
  const category = searchParams.get('category') || '';

  const supabase = createClient();

  try {
    let query = supabase.from('events').select('*').eq('status', 'published');

    if (q) {
      // Searching across title, city, and description with ILIKE
      query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    const { data, error } = await query.order('start_date', { ascending: true });

    if (error) {
      console.error('Supabase search error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
