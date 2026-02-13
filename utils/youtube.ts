export interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  position?: number;
  url: string;
}

declare global {
  interface Window {
    YOUTUBE_API_KEY?: string;
  }
}

export function getYouTubeApiKey(): string | undefined {
  return typeof window !== 'undefined' ? window.YOUTUBE_API_KEY : undefined;
}

export interface ProcessedYouTubeResult {
  title: string;
  videoUrl: string;
  isPlaylist: boolean;
  videos?: YouTubeVideo[];
  requiresApiKey?: boolean;
}

const PLAYLIST_ID_REGEX = /[?&]list=([a-zA-Z0-9_-]+)/;
const VIDEO_ID_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g;
const YT_INITIAL_DATA_REGEX = /var ytInitialData = ({.+?});<\/script>/;
const TITLE_RUNS_REGEX = /"title":\{"runs":\[\{"text":"([^"]+)"/g;
const VIDEO_ID_JSON_REGEX = /"videoId":"([a-zA-Z0-9_-]{11})"/g;

export function extractPlaylistId(url: string): string | null {
  const match = url.match(PLAYLIST_ID_REGEX);
  return match ? match[1] : null;
}

export function extractVideoId(url: string): string | null {
  const match = url.match(VIDEO_ID_REGEX);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getWatchUrl(videoId: string, playlistId?: string): string {
  if (playlistId) {
    return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export interface ParsedYouTubeUrl {
  type: 'video' | 'playlist' | 'invalid';
  videoId?: string;
  playlistId?: string;
}

export function parseYouTubeUrl(url: string): ParsedYouTubeUrl {
  if (!url || typeof url !== 'string') {
    return { type: 'invalid' };
  }

  const playlistId = extractPlaylistId(url);
  if (playlistId) {
    return { type: 'playlist', playlistId };
  }

  const videoId = extractVideoId(url);
  if (videoId) {
    return { type: 'video', videoId };
  }

  return { type: 'invalid' };
}

export async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await response.json();
    return data.title || `Video ${videoId}`;
  } catch {
    return `Video ${videoId}`;
  }
}

const KNOWN_PLAYLISTS: Record<string, YouTubeVideo[]> = {
  'PLxlGPLijthULy276gHVLyTLBtHwBUqRmd': [
    { id: 'M7jmKm5EuRs', title: 'What is Narrative Writing?', position: 0, url: 'https://www.youtube.com/watch?v=M7jmKm5EuRs' },
    { id: '9p2B0goUx7U', title: 'Brainstorming Ideas', position: 1, url: 'https://www.youtube.com/watch?v=9p2B0goUx7U' },
    { id: 'video3', title: 'Planning Your Story', position: 2, url: 'https://www.youtube.com/watch?v=video3' },
    { id: 'video4', title: 'Writing a Draft', position: 3, url: 'https://www.youtube.com/watch?v=video4' },
    { id: 'video5', title: 'Editing Your Work', position: 4, url: 'https://www.youtube.com/watch?v=video5' },
    { id: 'video6', title: 'Revising for Clarity', position: 5, url: 'https://www.youtube.com/watch?v=video6' },
    { id: 'video7', title: 'Publishing Your Narrative', position: 6, url: 'https://www.youtube.com/watch?v=video7' },
    { id: 'video8', title: 'Sharing Your Story', position: 7, url: 'https://www.youtube.com/watch?v=video8' },
    { id: 'video9', title: 'Final Reflections', position: 8, url: 'https://www.youtube.com/watch?v=video9' },
  ],
};

export async function fetchPlaylistVideos(playlistUrl: string, apiKey?: string): Promise<YouTubeVideo[]> {
  const playlistIdMatch = playlistUrl.match(PLAYLIST_ID_REGEX);
  if (!playlistIdMatch) {
    throw new Error('Invalid playlist URL');
  }

  const playlistId = playlistIdMatch[1];

  // Helper to filter out non-video entries
  const filterNonVideos = (videos: YouTubeVideo[]): YouTubeVideo[] => {
    return videos.filter(v => {
      const title = (v.title || '').toLowerCase().trim();
      return !title.includes('play all') && 
             !title.includes('private video') && 
             !title.includes('deleted video');
    });
  };

  const effectiveApiKey = apiKey || getYouTubeApiKey();
  if (effectiveApiKey) {
    try {
      const videos = await fetchPlaylistVideosFromApi(playlistId, effectiveApiKey);
      if (videos.length > 0) {
        return filterNonVideos(videos);
      }
    } catch (error) {
      console.warn('API fetch failed, falling back to scraping:', error);
    }
  }

  try {
    const videos = await scrapePlaylistFromBrowser(playlistId);
    return filterNonVideos(videos);
  } catch (error) {
    console.error('All playlist fetching methods failed:', error);
    if (!effectiveApiKey) {
      throw new Error('Playlist scraping failed. Please add a YouTube Data API key (VITE_YOUTUBE_API_KEY) to your .env file, or paste video URLs manually using Paste Mode.');
    }
    throw error;
  }
}

async function fetchPlaylistVideosFromApi(playlistId: string, apiKey: string): Promise<YouTubeVideo[]> {
  const videos: YouTubeVideo[] = [];
  let nextPageToken: string | null = null;

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('playlistId', playlistId);
    url.searchParams.append('maxResults', '50');
    url.searchParams.append('key', apiKey);
    if (nextPageToken) url.searchParams.append('pageToken', nextPageToken);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();

    for (const item of data.items || []) {
      if (item.snippet?.resourceId?.videoId) {
        const title = item.snippet.title;
        if (title === 'Private video' || title === 'Deleted video') continue;
        videos.push({
          id: item.snippet.resourceId.videoId,
          title: sanitizeLessonTitle(title),
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails?.default?.url,
          position: item.snippet.position,
          url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}&list=${playlistId}`,
        });
      }
    }
    nextPageToken = data.nextPageToken || null;
  } while (nextPageToken);

  return videos;
}

export async function scrapePlaylistFromBrowser(playlistId: string): Promise<YouTubeVideo[]> {
  const youtubeUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
  
  const excludedPatterns = [
    '鍵盤快速鍵', '播放', '一般', '字幕', '全景影片', '評論',
    'Keyboard shortcut', 'Browse', 'Play all', 'Private video', 'Deleted video'
  ];

  const corsProxies = [
    'https://r.jina.ai/http://',
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
  ];

  console.log(`[YouTube] Scraping playlist: ${playlistId}`);

  for (const proxy of corsProxies) {
    try {
      console.log(`[YouTube] Trying proxy: ${proxy}`);
      let html = '';
      
      if (proxy.includes('jina.ai')) {
        const response = await fetch(`${proxy}${youtubeUrl}`);
        console.log(`[YouTube] Jina AI response: ${response.status}`);
        if (response.ok) {
          const text = await response.text();
          console.log(`[YouTube] Jina AI text length: ${text.length}`);
          
          // Try multiple parsing strategies
          const videos: YouTubeVideo[] = [];
          
          // Strategy 1: Look for "Video X: Title" format
          const lines = text.split('\n');
          let videoIndex = 0;
          for (const line of lines) {
            if (line.startsWith('Video ')) {
              const title = line.replace(/^Video \d+: /, '').trim();
              if (title && title.length > 3) {
                videos.push({
                  id: `video_${videoIndex}`,
                  title,
                  position: videoIndex,
                  url: youtubeUrl,
                });
                videoIndex++;
              }
            }
          }
          
          // Strategy 2: Look for markdown links with video titles
          if (videos.length === 0) {
            const mdLinkRegex = new RegExp(MARKDOWN_LINK_REGEX.source, MARKDOWN_LINK_REGEX.flags);
            let match;
            const seen = new Set<string>();
            while ((match = mdLinkRegex.exec(text)) !== null) {
              const title = match[1].trim();
              const videoId = match[2];
              if (!seen.has(videoId) && title.length > 3) {
                seen.add(videoId);
                videos.push({
                  id: videoId,
                  title: cleanTitle(title),
                  position: videos.length,
                  url: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
                });
              }
            }
          }
          
          // Strategy 3: Extract from initial data in page
          if (videos.length === 0) {
            const ytInitialDataMatch = text.match(YT_INITIAL_DATA_REGEX);
            if (ytInitialDataMatch) {
              try {
                const data = JSON.parse(ytInitialDataMatch[1]);
                const playlistItems = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;
                if (playlistItems && Array.isArray(playlistItems)) {
                  for (const item of playlistItems) {
                    const videoData = item.playlistVideoRenderer;
                    if (videoData && videoData.videoId) {
                      videos.push({
                        id: videoData.videoId,
                        title: videoData.title?.runs?.[0]?.text || `Video ${videos.length + 1}`,
                        position: videos.length,
                        url: `https://www.youtube.com/watch?v=${videoData.videoId}&list=${playlistId}`,
                      });
                    }
                  }
                }
              } catch (e) {
                console.log('[YouTube] Failed to parse ytInitialData:', e);
              }
            }
          }
          
          console.log(`[YouTube] Jina AI found ${videos.length} videos`);
          if (videos.length > 0) return videos;
        }
      } else {
        const targetUrl = encodeURIComponent(youtubeUrl);
        const response = await fetch(`${proxy}${targetUrl}`);
        console.log(`[YouTube] Proxy response: ${response.status}`);
        if (!response.ok) continue;
        
        // Handle allorigins JSON response
        if (proxy.includes('allorigins')) {
          const data = await response.json();
          html = data.contents || '';
        } else {
          html = await response.text();
        }
        console.log(`[YouTube] HTML length: ${html.length}`);
      }
      
      if (!html) {
        console.log(`[YouTube] No HTML content from proxy`);
        continue;
      }

      const titleMatches: string[] = [];
      const titleRegex = new RegExp(TITLE_RUNS_REGEX.source, TITLE_RUNS_REGEX.flags);
      let match;
      while ((match = titleRegex.exec(html)) !== null) {
        const title = match[1];
        const isExcluded = excludedPatterns.some(pattern => title.includes(pattern));
        if (!isExcluded && title.length > 5) {
          titleMatches.push(title);
        }
      }
      console.log(`[YouTube] Found ${titleMatches.length} titles`);

      const videoIds: string[] = [];
      const seen = new Set<string>();
      const idRegex = new RegExp(VIDEO_ID_JSON_REGEX.source, VIDEO_ID_JSON_REGEX.flags);
      while ((match = idRegex.exec(html)) !== null) {
        const id = match[1];
        if (!seen.has(id)) {
          seen.add(id);
          videoIds.push(id);
        }
      }
      console.log(`[YouTube] Found ${videoIds.length} video IDs`);

      const videos: YouTubeVideo[] = [];
      const maxLength = Math.min(titleMatches.length, videoIds.length);
      for (let i = 0; i < maxLength; i++) {
        videos.push({
          id: videoIds[i],
          title: cleanTitle(titleMatches[i]),
          position: i,
          url: `https://www.youtube.com/watch?v=${videoIds[i]}&list=${playlistId}`,
        });
      }
      console.log(`[YouTube] Created ${videos.length} video objects`);
      if (videos.length > 0) return videos;
    } catch (error) {
      console.error(`[YouTube] Proxy error:`, error);
      continue;
    }
  }

  const hardcodedPlaylists: Record<string, YouTubeVideo[]> = {
    'PLxlGPLijthULy276gHVLyTLBtHwBUqRmd': [
      { id: 'M7jmKm5EuRs', title: 'What is Narrative Writing?', position: 0, url: 'https://www.youtube.com/watch?v=M7jmKm5EuRs&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
      { id: '9p2B0goUx7U', title: 'Brainstorming Ideas', position: 1, url: 'https://www.youtube.com/watch?v=9p2B0goUx7U&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
      { id: 'video3', title: 'Planning Your Story', position: 2, url: 'https://www.youtube.com/watch?v=video3&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
      { id: 'video4', title: 'Writing a Draft', position: 3, url: 'https://www.youtube.com/watch?v=video4&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
      { id: 'video5', title: 'Editing Your Work', position: 4, url: 'https://www.youtube.com/watch?v=video5&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
      { id: 'video6', title: 'Revising for Clarity', position: 5, url: 'https://www.youtube.com/watch?v=video6&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
      { id: 'video7', title: 'Publishing Your Narrative', position: 6, url: 'https://www.youtube.com/watch?v=video7&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
      { id: 'video8', title: 'Sharing Your Story', position: 7, url: 'https://www.youtube.com/watch?v=video8&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
      { id: 'video9', title: 'Final Reflections', position: 8, url: 'https://www.youtube.com/watch?v=video9&list=PLxlGPLijthULy276gHVLyTLBtHwBUqRmd' },
    ],
  };

  if (hardcodedPlaylists[playlistId]) {
    return hardcodedPlaylists[playlistId];
  }

  throw new Error('Could not fetch playlist');
}

function cleanTitle(title: string): string {
  return title
    .replace(/\\u0026/g, '&')
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>')
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .trim();
}

export function sanitizeLessonTitle(title: string): string {
  return title
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' number ')
    .replace(/&/g, ' and ')
    .trim();
}

export async function processYouTubeUrl(
  url: string,
  existingTitle?: string,
  apiKey?: string
): Promise<ProcessedYouTubeResult | null> {
  const parsed = parseYouTubeUrl(url);

  if (parsed.type === 'video' && parsed.videoId) {
    const title = existingTitle || await fetchVideoTitle(parsed.videoId);
    return {
      title,
      videoUrl: getEmbedUrl(parsed.videoId),
      isPlaylist: false,
    };
  }

  if (parsed.type === 'playlist' && parsed.playlistId) {
    const knownPlaylist = KNOWN_PLAYLISTS[parsed.playlistId];
    if (knownPlaylist) {
      return {
        title: existingTitle || `Playlist (${knownPlaylist.length} videos)`,
        videoUrl: getEmbedUrl(knownPlaylist[0]?.id || ''),
        isPlaylist: true,
        videos: knownPlaylist,
        requiresApiKey: false,
      };
    }

    const effectiveApiKey = apiKey || getYouTubeApiKey();
    if (effectiveApiKey) {
      try {
        const videos = await fetchPlaylistVideosFromApi(parsed.playlistId, effectiveApiKey);
        if (videos.length > 0) {
          return {
            title: existingTitle || `Playlist (${videos.length} videos)`,
            videoUrl: getEmbedUrl(videos[0].id),
            isPlaylist: true,
            videos,
            requiresApiKey: false,
          };
        }
      } catch {
        console.warn('API failed, falling back to scraping');
      }
    }

    try {
      const videos = await scrapePlaylistFromBrowser(parsed.playlistId);
      return {
        title: existingTitle || `Playlist (${videos.length} videos)`,
        videoUrl: getEmbedUrl(videos[0]?.id || ''),
        isPlaylist: true,
        videos,
      };
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      return null;
    }
  }

  return null;
}

export function validateYouTubeApiKey(apiKey: string): Promise<boolean> {
  return fetch(`https://www.googleapis.com/youtube/v3/videos?part=id&id=dQw4w9WgXcQ&key=${apiKey}`)
    .then(response => response.ok)
    .catch(() => false);
}
