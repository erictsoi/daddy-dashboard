import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { playlistUrl } = await req.json()

    if (!playlistUrl) {
      return new Response(
        JSON.stringify({ error: 'playlistUrl is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY') || ''

    if (!youtubeApiKey) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const playlistId = extractPlaylistId(playlistUrl)
    if (!playlistId) {
      return new Response(
        JSON.stringify({ error: 'Invalid playlist URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${youtubeApiKey}`
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('YouTube API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch playlist from YouTube' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()

    if (data.error) {
      console.error('YouTube API error:', data.error)
      return new Response(
        JSON.stringify({ error: data.error.message || 'YouTube API error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const videos = (data.items || []).map((item: any) => ({
      title: item.snippet.title,
      videoId: item.snippet.resourceId.videoId,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
    })).filter((v: any) => v.videoId && v.title !== 'Private video' && v.title !== 'Deleted video')

    return new Response(
      JSON.stringify({ videos }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function extractPlaylistId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)[a-zA-Z0-9_-]+\?.*list=([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/watch\?v=)[a-zA-Z0-9_-]+&list=([a-zA-Z0-9_-]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  if (url.match(/^[a-zA-Z0-9_-]{34}$/)) {
    return url
  }

  return null
}
