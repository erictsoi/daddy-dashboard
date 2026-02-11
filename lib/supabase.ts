import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null

if (!supabase) {
  console.warn('Supabase client not initialized - missing environment variables')
}

export async function fetchPlaylistVideos(
  playlistUrl: string
): Promise<Array<{ title: string; videoId: string; thumbnail?: string }>> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.functions.invoke('get-playlist-videos', {
    body: { playlistUrl }
  })

  if (error) {
    console.error('Error fetching playlist:', error)
    throw new Error('Failed to fetch playlist videos')
  }

  return data?.videos || []
}

