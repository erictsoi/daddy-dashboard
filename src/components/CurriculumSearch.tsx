import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Play, Loader2, Youtube, Check, AlertTriangle, Star, Download, Upload } from 'lucide-react';
import { getCurriculumForYear, getTopicsForSubject } from '../data/ukCurriculum';
import { SEARCH_QUERIES } from '../data/searchQueries';
import { ProfileTemplate } from '../types';
import { PROFILE_TEMPLATES } from '../constants';
import { Card, Shadow, DS, IconButton } from './design-system';
import { logger } from '../lib/logger';

interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
}

interface Playlist {
  title: string;
  url: string;
  videos: YouTubeVideo[];
  isPrimary: boolean;
  index: number;
}

interface SubjectData {
  id: string;
  yearGroup: string;
  subject: string;
  focus: string;
  playlists: Playlist[];
  allVideos: YouTubeVideo[];
}

interface Props {
  onBack: () => void;
}

const STORAGE_KEY = 'curriculum_search_data';

const loadSavedData = (): SubjectData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveData = (data: SubjectData[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const fetchPlaylistInfo = async (playlistUrl: string) => {
  const match = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/);
  if (!match) return null;

  try {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${match[1]}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.items && data.items[0]?.snippet) {
      return { title: data.items[0].snippet.title };
    }
  } catch {
    return null;
  }
  return null;
};

const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
const hasApiKey = !!apiKey && apiKey !== 'YOUR_API_KEY';

const getSubjectsForYear = (yearGroup: string, savedData: SubjectData[]): SubjectData[] => {
  const curr = getCurriculumForYear(yearGroup as ProfileTemplate);
  if (!curr) return [];

  logger.log('[CurriculumSearch] getSubjectsForYear:', yearGroup, 'savedData count:', savedData.length);

  // Group unique subjects from curriculum template while preserving order
  const subjectsInOrder: string[] = [];
  const subjectMap = new Map<string, SubjectData>();

  for (const sub of curr.subjects) {
    if (!subjectMap.has(sub.subject)) {
      subjectsInOrder.push(sub.subject);
      subjectMap.set(sub.subject, {
        id: `${yearGroup}-${sub.subject}`,
        yearGroup,
        subject: sub.subject,
        focus: sub.description,
        playlists: [],
        allVideos: []
      });
    }
  }

  // Overlay saved data
  for (const saved of savedData) {
    if (saved.yearGroup === yearGroup && subjectMap.has(saved.subject)) {
      subjectMap.set(saved.subject, saved);
    }
  }

  // Handle extracurricular/custom subjects that aren't in the template
  const customSubjects = savedData.filter(s =>
    s.yearGroup === yearGroup && !subjectMap.has(s.subject)
  );

  const finalSubjects = subjectsInOrder.map(name => subjectMap.get(name)!);
  const result = [...finalSubjects, ...customSubjects];
  logger.log('[CurriculumSearch] getSubjectsForYear result:', result.length, 'subjects');
  return result;
};

const fetchPlaylistVideos = async (playlistUrl: string): Promise<YouTubeVideo[]> => {
  const match = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/);
  if (!match) return [];

  const videos: YouTubeVideo[] = [];
  let pageToken: string | null = '';
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) return [];

  while (pageToken !== null) {
    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('playlistId', match[1]);
      url.searchParams.append('maxResults', '50');
      if (pageToken) url.searchParams.append('pageToken', pageToken);
      url.searchParams.append('key', apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.error) break;

      const items = data.items || [];
      for (const item of items) {
        if (item.snippet?.resourceId?.videoId && !item.snippet.title.includes('Private video')) {
          videos.push({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}&list=${match[1]}`
          });
        }
      }

      pageToken = data.nextPageToken || null;
    } catch {
      break;
    }
  }

  return videos;
};

const PlaylistCard: React.FC<{
  playlist: Playlist;
  onDelete: () => void;
  onAddVideo: (url: string) => void;
  onDeleteVideo: (idx: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetPrimary: () => void;
  onUpdateTitle: (title: string) => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ playlist, onDelete, onAddVideo, onDeleteVideo, onMoveUp, onMoveDown, onSetPrimary, onUpdateTitle, isFirst, isLast }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(playlist.title);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const saveTitle = () => {
    if (titleValue.trim() && titleValue !== playlist.title) {
      onUpdateTitle(titleValue.trim());
    } else {
      setTitleValue(playlist.title);
    }
    setEditingTitle(false);
  };

  return (
    <Shadow offset={1} size={1} radius={DS.radius.lg} className="mb-4">
      <div className={`p-4 bg-white border-2 rounded-2xl transition-all ${playlist.isPrimary ? 'border-green-200 shadow-green-50' : 'border-slate-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${playlist.isPrimary ? 'bg-green-600 text-white' : 'bg-blue-500 text-white'
              }`}>
              {playlist.isPrimary ? '★ PRIMARY PLAYLIST' : `★ BACKUP BUNDLE ${playlist.index + 1}`}
            </div>
            {editingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleValue(playlist.title); setEditingTitle(false); } }}
                className="text-sm font-black border-2 border-blue-400 rounded-xl px-3 py-1 w-64 focus:outline-none"
                autoFocus
              />
            ) : (
              <h4 className="text-sm font-black text-slate-800 truncate max-w-xs cursor-pointer hover:text-blue-600 flex items-center gap-2 group" onClick={() => setEditingTitle(true)}>
                {playlist.title}
                <IconButton size={24}>✎</IconButton>
              </h4>
            )}
          </div>
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
            {!playlist.isPrimary && (
              <button onClick={onSetPrimary} className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-lg text-lg" title="Set as Primary">★</button>
            )}
            <button onClick={onMoveUp} disabled={isFirst} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 rounded-lg disabled:opacity-30 transition-all font-bold">↑</button>
            <button onClick={onMoveDown} disabled={isLast} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 rounded-lg disabled:opacity-30 transition-all font-bold">↓</button>
            <div className="w-[1px] bg-slate-200 mx-1" />
            <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-bold">×</button>
          </div>
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Youtube size={12} /> {playlist.videos?.length || 0} TRACKS IN THIS BUNDLE
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {playlist.videos?.map((v, i) => (
            <div key={i} className="flex items-center gap-3 text-xs bg-slate-50/50 hover:bg-slate-50 p-2 rounded-xl border border-transparent hover:border-slate-200 transition-all group">
              <div className="w-6 h-6 bg-white border rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-blue-500 transition-colors">
                {i + 1}
              </div>
              <a href={v.url} target="_blank" className="truncate flex-1 font-bold text-slate-600 hover:text-blue-600">{v.title || 'Untitled Lesson'}</a>
              <button onClick={() => onDeleteVideo(i)} className="text-slate-300 hover:text-red-500 px-2 font-black text-lg transition-colors">×</button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Paste individual video URL to expand bundle..."
            className="flex-1 text-xs border-2 border-slate-100 rounded-xl px-4 py-2 bg-slate-50 focus:border-blue-400 focus:bg-white transition-all outline-none"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newVideoUrl) {
                onAddVideo(newVideoUrl);
                setNewVideoUrl('');
              }
            }}
          />
        </div>
      </div>
    </Shadow>
  );
};

const EditModal: React.FC<{
  subject: SubjectData;
  onClose: () => void;
  onSave: (subject: SubjectData) => void;
}> = ({ subject, onClose, onSave }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(subject.playlists || []);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [searching, setSearching] = useState('');

  const addPlaylist = async () => {
    const urls = newPlaylistUrl.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) return;

    logger.log('[CurriculumSearch] addPlaylist: importing', urls.length, 'URLs');
    setSearching('Importing...');
    const currentPlaylists = [...playlists];

    for (const url of urls) {
      try {
        if (url.includes('list=')) {
          // It's a playlist
          const [videos, info] = await Promise.all([fetchPlaylistVideos(url), fetchPlaylistInfo(url)]);
          const title = info?.title || `Playlist ${currentPlaylists.length + 1}`;
          currentPlaylists.push({
            title,
            url,
            videos,
            isPrimary: currentPlaylists.length === 0,
            index: currentPlaylists.length
          });
          logger.log('[CurriculumSearch] addPlaylist: imported playlist', title, 'with', videos.length, 'videos');
        } else if (url.includes('v=')) {
          // It's a single video, wrap it in a custom playlist
          const match = url.match(/v=([a-zA-Z0-9_-]{11})/);
          if (match) {
            currentPlaylists.push({
              title: 'Manual Bundle',
              url,
              videos: [{ id: match[1], title: 'Selected Video', url }],
              isPrimary: currentPlaylists.length === 0,
              index: currentPlaylists.length
            });
            logger.log('[CurriculumSearch] addPlaylist: imported single video', url);
          }
        }
      } catch (err) {
        logger.error('[CurriculumSearch] addPlaylist: Failed to import:', url, err);
      }
    }

    setPlaylists(currentPlaylists);
    setSearching('');
    setNewPlaylistUrl('');
  };

  const handleQuickSearch = (topic: string) => {
    const query = `${topic} ${subject.subject} ${subject.yearGroup} tutorial playlist`;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAw%253D%253D`, '_blank');
  };

  const topics = getTopicsForSubject(subject.yearGroup as ProfileTemplate, subject.subject);

  const deletePlaylist = (idx: number) => {
    const newPl = playlists.filter((_, i) => i !== idx).map((p, i) => ({ ...p, isPrimary: i === 0, index: i }));
    setPlaylists(newPl);
  };

  const movePlaylist = (idx: number, direction: number) => {
    if (direction === -1 && idx === 0) return;
    if (direction === 1 && idx === playlists.length - 1) return;
    const newPl = [...playlists];
    const temp = newPl[idx];
    newPl[idx] = newPl[idx + direction];
    newPl[idx + direction] = temp;
    const reordered = newPl.map((p, i) => ({ ...p, isPrimary: i === 0, index: i }));
    setPlaylists(reordered);
  };

  const setAsPrimary = (idx: number) => {
    if (idx === 0) return;
    const newPl = [...playlists];
    const item = newPl.splice(idx, 1)[0];
    newPl.unshift(item);
    const reordered = newPl.map((p, i) => ({ ...p, isPrimary: i === 0, index: i }));
    setPlaylists(reordered);
  };

  const deleteVideo = (plIdx: number, vidIdx: number) => {
    const newPl = [...playlists];
    newPl[plIdx].videos = newPl[plIdx].videos.filter((_, i) => i !== vidIdx);
    setPlaylists(newPl);
  };

  const addVideoToPlaylist = (plIdx: number, videoUrl: string) => {
    const match = videoUrl.match(/v=([a-zA-Z0-9_-]{11})/);
    if (!match) { alert('Invalid video URL'); return; }
    const newPl = [...playlists];
    newPl[plIdx].videos.push({ id: match[1], title: 'New Video', url: videoUrl });
    setPlaylists(newPl);
  };

  const updatePlaylistTitle = (plIdx: number, newTitle: string) => {
    const newPl = [...playlists];
    newPl[plIdx].title = newTitle;
    setPlaylists(newPl);
  };

  const save = () => {
    const allVideos = playlists.flatMap(p => p.videos || []);
    onSave({ ...subject, playlists, allVideos });
    onClose();
  };

  const allVideos = playlists.flatMap(p => p.videos || []);

  const exportSubject = () => {
    const data = [{ ...subject, playlists, allVideos }];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${subject.subject}_${subject.yearGroup}.json`;
    a.click();
  };

  const importSubject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data) && data[0]) {
          setPlaylists(data[0].playlists || []);
          alert('Imported successfully!');
        } else {
          alert('Invalid file');
        }
      } catch { alert('Failed to load file'); }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">{subject.subject}</h2>
            <p className="text-sm text-blue-600 font-medium">{subject.focus}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={exportSubject} className="text-xs px-2 py-1 bg-blue-500 text-white rounded">Export</button>
            <button onClick={importSubject} className="text-xs px-2 py-1 bg-purple-500 text-white rounded">Import</button>
            <button onClick={onClose} className="text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4 text-sm">
            <span className="bg-gray-100 px-2 py-1 rounded">{subject.yearGroup}</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{playlists.length} playlists</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{allVideos.length} videos</span>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Add New Playlist</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaylistUrl}
                onChange={(e) => setNewPlaylistUrl(e.target.value)}
                placeholder="Paste YouTube playlist URL..."
                className="flex-1 border rounded px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (newPlaylistUrl) {
                      addPlaylist();
                      setNewPlaylistUrl('');
                    }
                  }
                }}
              />
              <button
                onClick={() => { if (newPlaylistUrl) { addPlaylist(); setNewPlaylistUrl(''); } }}
                disabled={searching !== ''}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {playlists.map((pl, idx) => (
            <PlaylistCard
              key={idx}
              playlist={pl}
              onDelete={() => deletePlaylist(idx)}
              onAddVideo={(url) => addVideoToPlaylist(idx, url)}
              onDeleteVideo={(vidIdx) => deleteVideo(idx, vidIdx)}
              onMoveUp={() => movePlaylist(idx, -1)}
              onMoveDown={() => movePlaylist(idx, 1)}
              onSetPrimary={() => setAsPrimary(idx)}
              onUpdateTitle={(newTitle) => updatePlaylistTitle(idx, newTitle)}
              isFirst={idx === 0}
              isLast={idx === playlists.length - 1}
            />
          ))}

          {playlists.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No playlists yet. Add one above!
            </div>
          )}

          {allVideos.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold mb-2">All Videos ({allVideos.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
                {allVideos.map((v, i) => (
                  <a key={i} href={v.url} target="_blank" className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded">
                    <span className="text-red-500">▶</span>
                    <span className="truncate">{v.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button onClick={save} className="flex-1 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700">
              Save Changes
            </button>
            <button onClick={onClose} className="px-6 py-3 border rounded hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPreviewModal: React.FC<{
  subject: SubjectData;
  topics: string[];
  onSearch: (selected: string[], manualUrls?: string[]) => void;
  onClose: () => void;
}> = ({ subject, topics, onSearch, onClose }) => {
  const [manualTopics, setManualTopics] = useState('');
  const searchQueries = SEARCH_QUERIES[subject.yearGroup]?.[subject.subject] || [[`${subject.subject} ${subject.yearGroup} tutorial playlist`]];
  const flatQueries = searchQueries.flat();
  const [selectedTerms, setSelectedTerms] = useState(topics.length > 0 ? topics : [flatQueries[0]]);
  const isUsingTopics = topics.length > 0;

  const toggleTerm = (term: string) => {
    if (selectedTerms.includes(term)) {
      setSelectedTerms(selectedTerms.filter(t => t !== term));
    } else {
      setSelectedTerms([...selectedTerms, term]);
    }
  };

  const estimatedAPI = isUsingTopics ? topics.length * 3 : flatQueries.length * 3;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{subject.subject}</h2>
            <p className="text-sm text-blue-600">{subject.focus}</p>
          </div>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <div className="p-4">
          {isUsingTopics ? (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Topics to search ({topics.length}):</h3>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleTerm(topic)}
                    className={`px-3 py-1 rounded text-sm border ${selectedTerms.includes(topic)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}
                  >
                    {selectedTerms.includes(topic) ? '✓' : '✗'} {topic}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Search terms that will be used:</h3>
              <div className="flex flex-wrap gap-2">
                {flatQueries.map((query, idx) => (
                  <span key={idx} className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 border">
                    {query}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-bold mb-3 text-purple-700">Manual Topic Builder</h3>
            <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-2">
              <div className="mb-3">
                <label className="block text-xs font-semibold text-purple-800 mb-1">YouTube URLs (Videos or Playlists)</label>
                <textarea
                  placeholder="Paste YouTube video URLs or playlist URLs (separated by newlines, spaces, or commas)"
                  value={manualTopics}
                  onChange={e => setManualTopics(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm h-24 resize-y focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Estimated API usage:</strong> ~{estimatedAPI} searches
              <br />
              <small>{isUsingTopics ? 'Each topic searches for multiple playlists.' : 'Multiple searches to find the best playlist.'}</small>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const urls = manualTopics.split(/[\s,]+/).filter(u => u.includes('youtube.com') || u.includes('youtu.be'));
                onSearch(selectedTerms, urls.length > 0 ? urls : undefined);
              }}
              disabled={selectedTerms.length === 0 && !manualTopics.trim()}
              className="flex-1 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Auto-Search {isUsingTopics ? `${selectedTerms.length} Topics` : 'Playlists'}
            </button>
            <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GlobalImportCard: React.FC<{ onImport: (data: any) => void }> = ({ onImport }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files) as File[];
    for (const file of files) {
      if (file.name.endsWith('.json')) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          onImport(data);
        } catch { console.error('Failed to parse', file.name); }
      }
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`h-full min-h-[280px] rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 bg-white/50 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDragging ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-slate-200 hover:border-slate-300 hover:bg-white'
        }`}
    >
      <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center mb-6 transition-all ${isDragging ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-slate-50 text-slate-300'
        }`}>
        <Upload size={32} />
      </div>
      <div className="text-center">
        <h3 className="font-bold text-slate-700 text-lg mb-2">Import Subject Cards</h3>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          Drag and drop your JSON backup files<br />here to quickly upload subject data.
        </p>
      </div>

      <input
        type="file"
        id="global-import-input"
        className="hidden"
        accept=".json"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              const data = JSON.parse(await file.text());
              onImport(data);
            } catch { alert('Invalid JSON'); }
          }
        }}
      />
      <label
        htmlFor="global-import-input"
        className="mt-8 px-6 py-2 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-200 hover:text-blue-600 cursor-pointer shadow-sm transition-all active:scale-95"
      >
        Choose JSON File
      </label>
    </div>
  );
};

const TopicCard: React.FC<{ topicName: string; playlist?: Playlist; subjectName: string }> = ({ topicName, playlist, subjectName }) => {
  const videoCount = playlist?.videos?.length || 0;
  const hasVideos = videoCount > 0;

  const handleCopy = () => {
    if (!playlist) return;
    const text = `${topicName}\t${playlist.title}\t${playlist.url}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`p-2 rounded border flex flex-col items-center justify-center min-w-[100px] transition-all h-full ${hasVideos
      ? 'bg-green-50 border-green-300'
      : 'bg-gray-50 border-gray-200'
      }`}>
      <div className="text-xs font-medium text-center truncate w-full text-gray-500" title={topicName}>{topicName}</div>
      <div className={`text-xs mt-1 font-bold ${hasVideos ? 'text-green-600' : 'text-gray-400'}`}>
        {hasVideos ? `${videoCount} videos` : 'No videos'}
      </div>
      {hasVideos && (
        <div className="w-full mt-2 flex flex-col gap-1">
          <input
            type="text"
            readOnly
            className="w-full text-xs font-semibold p-1 border border-green-200 rounded bg-white text-gray-900 focus:outline-none focus:border-green-400"
            title="Playlist Name"
            value={playlist.title}
          />
          <div className="flex gap-1">
            <input
              type="text"
              readOnly
              className="w-full text-[10px] p-1 border border-green-200 rounded bg-white text-blue-600 focus:outline-none focus:border-green-400"
              title="Playlist URL"
              value={playlist.url}
            />
            <button
              onClick={handleCopy}
              className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded hover:bg-green-200 border border-green-200 cursor-pointer"
              title="Copy Topic, Name and URL (Tab separated)"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SubjectSection: React.FC<{
  subject: SubjectData;
  onFind: () => void;
  onEdit: () => void;
  onImport: (data: SubjectData) => void;
  onRemove?: () => void;
}> = ({ subject, onFind, onEdit, onImport, onRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const playlists = subject.playlists || [];
  const topics = getTopicsForSubject(subject.yearGroup as ProfileTemplate, subject.subject);
  const topicNames = topics.map(t => t.topic);
  const hasAnyVideos = playlists.length > 0 && playlists.some(p => (p.videos?.length || 0) > 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const allFiles: File[] = Array.from(e.dataTransfer.files);
    const jsonFiles = allFiles.filter(f => f.name.endsWith('.json'));
    if (jsonFiles.length === 0) return;

    try {
      let allNewPlaylists: Playlist[] = [];
      
      for (const dropFile of jsonFiles) {
        const text: string = await dropFile.text();
        const data: any = JSON.parse(text);
        if (Array.isArray(data)) {
          for (const item of data) {
            const filePlaylists = item.playlists || [];
            for (const p of filePlaylists) {
              allNewPlaylists.push({
                title: p.title || dropFile.name.replace('.json', ''),
                url: p.url || '',
                videos: p.videos || [],
                isPrimary: false,
                index: allNewPlaylists.length
              });
            }
          }
        } else if (data.playlists) {
          for (const p of data.playlists) {
            allNewPlaylists.push({
              title: p.title || dropFile.name.replace('.json', ''),
              url: p.url || '',
              videos: p.videos || [],
              isPrimary: false,
              index: allNewPlaylists.length
            });
          }
        }
      }
      
      if (allNewPlaylists.length > 0) {
        allNewPlaylists[0].isPrimary = true;
        const existingPlaylists = subject.playlists || [];
        const combined = [...existingPlaylists, ...allNewPlaylists];
        const reindexed = combined.map((p, i) => ({ ...p, index: i, isPrimary: i === 0 }));
        const newAllVideos = reindexed.flatMap((p: Playlist) => p.videos || []);
        onImport({ ...subject, playlists: reindexed, allVideos: newAllVideos });
        logger.log('[CurriculumSearch] handleDrop: imported', jsonFiles.length, 'files with', allNewPlaylists.length, 'new playlists');
      }
    } catch { alert('Failed to load file'); }
  };

  const copyForSpreadsheet = () => {
    const lines = playlists.map(p => `${subject.subject}\t${p.title}\t${p.url}`);
    navigator.clipboard.writeText(lines.join('\n'));
    logger.log('[CurriculumSearch] copyForSpreadsheet: copied', playlists.length, 'playlists for', subject.subject);
    alert('Copied all playlists to clipboard!');
  };

  const isExtra = subject.yearGroup === 'Extracurricular';
  const isOptional = (subject as any).isOptional || false;

  return (
    <div
      className={`bg-white rounded-lg border-2 overflow-hidden mb-4 ${hasAnyVideos ? 'border-green-400' : 'border-gray-200'} ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none z-10">
          <span className="bg-blue-500 text-white px-4 py-2 rounded font-medium">Drop to import</span>
        </div>
      )}
      <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base">{subject.subject}</h3>
          {isExtra ? (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium border border-yellow-200">⭐ Extracurricular</span>
          ) : isOptional ? (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Optional</span>
          ) : (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Core</span>
          )}
        </div>
        {isOptional && onRemove && (
          <button onClick={onRemove} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-sm" title="Remove subject">
            × Remove
          </button>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-blue-600 font-medium mb-3">{subject.focus}</p>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
            {Array.from({ length: Math.max(topicNames.length, playlists.length) }).map((_, idx) => {
              const playlist = playlists.find(p => p.index === idx) || playlists[idx];
              let topic = topicNames[idx];
              if (!topic && playlist?.title) {
                topic = playlist.title.includes(':') ? playlist.title.split(':')[0] : `Topic ${idx + 1}`;
              }
              if (!topic) topic = `Topic ${idx + 1}`;
              return <TopicCard key={idx} topicName={topic} playlist={playlist} subjectName={subject.subject} />;
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-3">
            {topicNames.length > 0
              ? `No playlists yet. Click "Find All" to search for ${topicNames.length} topics.`
              : 'No playlists yet. Click "Find All" to search for playlists.'}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onFind} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Find All</button>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  const data = JSON.parse(text);
                  if (Array.isArray(data) && data[0]) {
                    const imported = data[0];
                    const newPlaylists = imported.playlists || [];
                    const newAllVideos = newPlaylists.flatMap((p: Playlist) => p.videos || []);
                    onImport({ ...subject, playlists: newPlaylists, allVideos: newAllVideos });
                    alert('Imported successfully!');
                  } else {
                    alert('Invalid file format');
                  }
                } catch { alert('Failed to load file'); }
              };
              input.click();
            }}
            className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm"
            title="Import JSON file"
          >
            Import
          </button>
          {playlists.length > 0 && (
            <>
              <button onClick={onEdit} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">Edit</button>
              <button
                onClick={copyForSpreadsheet}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 ml-auto"
                title="Copy all playlists for this subject to spreadsheet"
              >
                Copy for Spreadsheet
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


export const CurriculumSearch: React.FC<Props> = ({ onBack }) => {
  const [selectedYear, setSelectedYear] = useState<ProfileTemplate | null>(null);
  const [savedData, setSavedData] = useState<SubjectData[]>([]);
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
  const [previewSubject, setPreviewSubject] = useState<SubjectData | null>(null);
  const [searching, setSearching] = useState('');
  const [wildcardModalOpen, setWildcardModalOpen] = useState(false);
  const [newWildcardName, setNewWildcardName] = useState('');
  const savedDataRef = useRef<SubjectData[]>([]);

  const updateLibrary = (newData: SubjectData[]) => {
    saveData(newData);
    savedDataRef.current = newData;
    setSavedData([...newData]);
  };

  useEffect(() => {
    const data = loadSavedData();
    updateLibrary(data);
  }, []);

  const subjects = React.useMemo(() => {
    if (!selectedYear) return [];
    return getSubjectsForYear(selectedYear, savedData);
  }, [selectedYear, savedData]);

  const syncedCount = subjects.filter(s => (s.playlists?.length || 0) > 0).length;
  const totalCount = subjects.length;


  const handleFindAll = async (subjectsToSearch: SubjectData[], customQueries?: string[]) => {
    if (!hasApiKey) {
      alert('YouTube API key required. Please set VITE_YOUTUBE_API_KEY in your .env file.');
      return;
    }

    logger.log('[CurriculumSearch] handleFindAll: starting search for', subjectsToSearch.length, 'subjects');
    setSearching('Performing Audit Search...');

    for (const subject of subjectsToSearch) {
      logger.log('[CurriculumSearch] handleFindAll: searching', subject.subject);
      const topics = getTopicsForSubject(subject.yearGroup as ProfileTemplate, subject.subject);
      const searchQueries = SEARCH_QUERIES[subject.yearGroup]?.[subject.subject] || [];
      const flatQueries = searchQueries.flat();

      const newPlaylists: Playlist[] = [];
      const itemsToSearch = customQueries || (topics.length > 0 ? topics.map(t => `${t.topic} ${t.focus}`) : flatQueries);

      for (let i = 0; i < Math.min(itemsToSearch.length, 5); i++) {
        const queryTerm = itemsToSearch[i];
        try {
          const searchQuery = `${queryTerm} ${subject.subject} ${subject.yearGroup} educational playlist`;
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(searchQuery)}&type=playlist&key=${apiKey}`
          );
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            if (item.id?.playlistId) {
              const playlistUrl = `https://www.youtube.com/playlist?list=${item.id.playlistId}`;
              const videos = await fetchPlaylistVideos(playlistUrl);
              newPlaylists.push({
                title: item.snippet.title,
                url: playlistUrl,
                videos,
                isPrimary: newPlaylists.length === 0,
                index: newPlaylists.length
              });
              logger.log('[CurriculumSearch] handleFindAll: found playlist', item.snippet.title, 'with', videos.length, 'videos');
            }
          }
        } catch (err) {
          logger.error('[CurriculumSearch] handleFindAll: search error for', queryTerm, err);
        }
      }

      const updatedSubject = {
        ...subject,
        playlists: newPlaylists,
        allVideos: newPlaylists.flatMap(p => p.videos || [])
      };

      const dataIndex = savedDataRef.current.findIndex(s => s.id === subject.id);
      if (dataIndex >= 0) {
        savedDataRef.current[dataIndex] = updatedSubject;
      } else {
        savedDataRef.current.push(updatedSubject);
      }
      updateLibrary([...savedDataRef.current]);
    }

    setSearching('');
  };

  const handleSaveSubject = (subject: SubjectData) => {
    const merged = [...savedDataRef.current];
    const isWildcard = subject.id?.includes('-wild-');

    const dataIndex = merged.findIndex(s =>
      s.id === subject.id ||
      (!isWildcard && s.yearGroup === subject.yearGroup && s.subject.toLowerCase() === subject.subject.toLowerCase())
    );

    if (dataIndex >= 0) {
      merged[dataIndex] = subject;
    } else {
      merged.push(subject);
    }
    updateLibrary(merged);
  };

  const handleImportSubject = (subject: SubjectData) => {
    logger.log('[CurriculumSearch] handleImportSubject: imported', subject.subject, 'with', subject.playlists?.length || 0, 'playlists');
    handleSaveSubject(subject);
  };

  const handleBulkImport = (data: any) => {
    if (!data) return;
    const items = Array.isArray(data) ? data : [data];
    const merged = [...savedDataRef.current];

    let count = 0;
    items.forEach((item: any) => {
      if (!item.subject || !item.yearGroup) return;

      let normalizedYear = item.yearGroup;
      if (normalizedYear.startsWith('Y')) normalizedYear = normalizedYear.substring(1);

      // Deduplicate: Prioritize ID match, then name+year match ONLY for non-wildcards (or allow name match for updates)
      const isWildcard = item.id?.includes('-wild-');
      const idx = merged.findIndex(m =>
        m.id === item.id ||
        (!isWildcard && m.yearGroup === normalizedYear && m.subject.toLowerCase() === item.subject.toLowerCase())
      );

      const normalizedItem = { ...item, yearGroup: normalizedYear };
      if (idx >= 0) {
        merged[idx] = normalizedItem;
      } else {
        merged.push(normalizedItem);
      }
      count++;
    });

    updateLibrary(merged);
  };

  if (!selectedYear) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
          <h1 className="font-bold text-lg">UK Curriculum Video Finder</h1>
          <button onClick={() => setWildcardModalOpen(true)} className="text-blue-600">All ({savedData.length})</button>
        </div>
        <div className="p-4 max-w-xl mx-auto">
          <h2 className="font-semibold mb-3">Select Year Group</h2>
          <div className="grid grid-cols-2 gap-3">
            {PROFILE_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelectedYear(t.id as ProfileTemplate)} className="p-4 bg-white border-2 border-gray-200 rounded hover:border-blue-500 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t.id === 'Extracurricular' ? 'Extracurricular' : `Year ${t.id}`}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">{t.keyStage}</span>
                </div>
                <div className="text-sm text-gray-500">{t.ageRange}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }



  const exportData = () => {
    const dataStr = JSON.stringify(savedData.filter(s => s.yearGroup === selectedYear), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curriculum-${selectedYear}.json`;
    a.click();
    logger.log('[CurriculumSearch] exportData: exported curriculum for', selectedYear);
  };

  const clearData = () => {
    if (confirm(`Clear all synced data for Year ${selectedYear}?`)) {
      const filtered = savedDataRef.current.filter(s => s.yearGroup !== selectedYear);
      updateLibrary(filtered);
      logger.log('[CurriculumSearch] clearData: cleared curriculum for', selectedYear);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setSelectedYear(null)} className="p-1 hover:bg-gray-100 rounded">Back</button>
        <h1 className="font-bold">{selectedYear === 'Extracurricular' ? 'Extracurricular' : `Year ${selectedYear}`}</h1>
        <span className="text-gray-400">|</span>
        <span>{syncedCount}/{totalCount}</span>
        <button
          onClick={() => handleFindAll(subjects)}
          disabled={!!searching || !hasApiKey}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
        >
          Find All Videos
        </button>
        <button onClick={exportData} className="px-2 py-1 bg-blue-500 text-white rounded text-sm">Export</button>
        <button onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
              const text = await file.text();
              const data = JSON.parse(text);
              if (Array.isArray(data)) {
                handleBulkImport(data);
                alert(`Imported ${data.length} subjects!`);
              } else {
                alert('Invalid backup file');
              }
            } catch { alert('Failed to load file'); }
          };
          input.click();
        }} className="px-2 py-1 bg-purple-500 text-white rounded text-sm">Import</button>
        <button onClick={() => alert('Saved to Dashboard!')} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Save to Firebase</button>
        <button onClick={clearData} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Clear</button>
        <button onClick={() => setWildcardModalOpen(true)} className="ml-auto text-blue-600">All Saved ({savedData.length})</button>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {searching && <div className="mb-3 p-2 bg-blue-50 text-blue-700 rounded text-center text-sm">{searching}</div>}
        
        <div className="mb-3">
          <button
            onClick={() => setWildcardModalOpen(true)}
            className={selectedYear === 'Extracurricular'
              ? "px-3 py-1 border-2 border-dashed border-yellow-400 text-yellow-700 bg-yellow-50 rounded text-sm hover:bg-yellow-100 font-medium"
              : "px-3 py-1 border border-dashed border-gray-400 text-gray-600 rounded text-sm hover:bg-gray-50"}
          >
            {selectedYear === 'Extracurricular' ? '✨ Add Wildcard Subject' : '+ Add Subject'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((s, idx) => (
            <SubjectSection
              key={s.id || `${s.subject}-${idx}`}
              subject={s}
              onFind={() => setPreviewSubject(s)}
              onEdit={() => setEditingSubject(s)}
              onImport={handleImportSubject}
              onRemove={() => {
                if (confirm(`Remove ${s.subject}?`)) {
                  const filtered = savedDataRef.current.filter(item => item.id !== s.id);
                  saveData(filtered);
                  savedDataRef.current = filtered;
                  setSavedData([...filtered]);
                }
              }}
            />
          ))}
          <GlobalImportCard onImport={handleBulkImport} />
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-32">
            <div className="text-6xl mb-4 opacity-20">📚</div>
            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Compiling Curriculum Map...</h3>
          </div>
        )}
      </div>

      {editingSubject && (
        <EditModal
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={handleSaveSubject}
        />
      )}

      {previewSubject && (
        <SearchPreviewModal
          subject={previewSubject}
          topics={getTopicsForSubject(previewSubject.yearGroup as ProfileTemplate, previewSubject.subject).map(t => t.topic)}
          onSearch={(selected, manualUrls) => {
            if (manualUrls && manualUrls.length > 0) {
              // Create a subject from manual URLs immediately
              const manualPlaylists: Playlist[] = manualUrls.map((url, idx) => ({
                title: `Manual Video ${idx + 1}`,
                url,
                videos: [{ id: url, title: `Manual Video ${idx + 1}`, url }],
                isPrimary: idx === 0,
                index: idx
              }));
              handleSaveSubject({
                ...previewSubject,
                playlists: manualPlaylists,
                allVideos: manualPlaylists.flatMap(p => p.videos)
              });
            } else {
              handleFindAll([previewSubject], selected);
            }
            setPreviewSubject(null);
          }}
          onClose={() => setPreviewSubject(null)}
        />
      )}

      {wildcardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setWildcardModalOpen(false)}>
          <Shadow offset={4} size={4} radius={DS.radius.lg} className="max-w-md w-full">
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-white shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b bg-slate-50">
                <h2 className="text-xl font-black text-slate-800">Add Wildcard Subject</h2>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mt-1">Manual Topic Builder</p>
              </div>
              <div className="p-8">
                <div className="mb-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Name</label>
                  <input
                    type="text"
                    autoFocus
                    value={newWildcardName}
                    onChange={e => setNewWildcardName(e.target.value)}
                    placeholder="e.g. Basketball, Python, Chess..."
                    className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-lg font-bold focus:border-amber-400 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (newWildcardName.trim()) {
                        const randomSuffix = Math.random().toString(36).substring(2, 7);
                        const id = `${selectedYear}-wild-${Date.now()}-${randomSuffix}`;
                        const newSub: SubjectData = {
                          id,
                          yearGroup: selectedYear,
                          subject: newWildcardName.trim(),
                          focus: `Custom enrichment topic: ${newWildcardName.trim()}`,
                          playlists: [],
                          allVideos: []
                        };
                        handleSaveSubject(newSub);
                        setNewWildcardName('');
                        setWildcardModalOpen(false);
                      }
                    }}
                    className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all"
                  >
                    ✨ Create Subject
                  </button>
                  <button
                    onClick={() => setWildcardModalOpen(false)}
                    className="px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </Shadow>
        </div>
      )}
    </div>
  );
};
