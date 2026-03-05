import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Play, Loader2, ExternalLink, Youtube, Check, X, AlertTriangle, Plus, Trash2, GripVertical, Star, Download, Upload } from 'lucide-react';
import { getCurriculumForYear, UKCurriculumYear, UKCurriculumTopic, getTopicsForSubject } from '../data/ukCurriculum';
import { ProfileTemplate } from '../types';
import { PROFILE_TEMPLATES } from '../constants';
import { Card, Shadow, DS } from './design-system';

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

// SUBJECT_TOPICS removed in favor of UK_CURRICULUM from ukCurriculum.ts

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

const fetchPlaylistVideos = async (playlistUrl: string): Promise<YouTubeVideo[]> => {
  const match = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/);
  if (!match) return [];

  const videos: YouTubeVideo[] = [];
  let pageToken = '';
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
    <div className="p-3 bg-white border rounded mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${playlist.isPrimary ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
            {playlist.isPrimary ? '★ PRIMARY' : `★ BACKUP ${playlist.index + 1}`}
          </span>
          {editingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleValue(playlist.title); setEditingTitle(false); } }}
              className="text-sm font-medium border rounded px-2 py-0.5 w-48"
              autoFocus
            />
          ) : (
            <span className="text-sm font-medium truncate max-w-xs cursor-pointer hover:text-blue-600" onClick={() => setEditingTitle(true)}>
              {playlist.title}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {!playlist.isPrimary && (
            <button onClick={onSetPrimary} className="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-xs" title="Set as Primary">★</button>
          )}
          <button onClick={onMoveUp} disabled={isFirst} className="text-gray-500 hover:bg-gray-50 px-2 py-1 rounded text-xs disabled:opacity-30">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="text-gray-500 hover:bg-gray-50 px-2 py-1 rounded text-xs disabled:opacity-30">↓</button>
          <button onClick={onDelete} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs">Delete</button>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-2">{playlist.videos?.length || 0} videos</div>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {playlist.videos?.map((v, i) => (
          <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 p-1 rounded">
            <a href={v.url} target="_blank" className="truncate flex-1 hover:text-blue-600">{v.title}</a>
            <button onClick={() => onDeleteVideo(i)} className="text-red-400 hover:text-red-600">×</button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="Add video URL..."
          className="flex-1 text-xs border rounded px-2 py-1"
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
    if (!newPlaylistUrl.includes('list=')) { alert('Invalid playlist URL'); return; }
    setSearching('Fetching...');
    try {
      const [videos, info] = await Promise.all([fetchPlaylistVideos(newPlaylistUrl), fetchPlaylistInfo(newPlaylistUrl)]);
      const title = info?.title || (videos.length > 0 ? `Playlist ${playlists.length + 1}` : 'New Playlist');
      const newPl: Playlist = { title, url: newPlaylistUrl, videos, isPrimary: playlists.length === 0, index: playlists.length };
      setPlaylists([...playlists, newPl]);
    } catch { }
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
            <button onClick={exportSubject} className="text-xs px-2 py-1 bg-blue-500 text-white rounded flex items-center gap-1"><Download size={12} />Export</button>
            <button onClick={importSubject} className="text-xs px-2 py-1 bg-purple-500 text-white rounded flex items-center gap-1"><Upload size={12} />Import</button>
            <button onClick={onClose} className="text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4 text-sm">
            <span className="bg-gray-100 px-2 py-1 rounded">{subject.yearGroup}</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{playlists.length} playlists</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{allVideos.length} videos</span>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Curriculum Blueprint</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topics.map((t, i) => (
                <div key={i} className="p-2 border rounded bg-blue-50/30 border-blue-100 flex items-center justify-between group">
                  <div>
                    <div className="text-sm font-semibold text-blue-900">{t.topic}</div>
                    <div className="text-xs text-blue-700/70">{t.focus}</div>
                  </div>
                  <button
                    onClick={() => handleQuickSearch(t.topic)}
                    className="p-1.5 hover:bg-blue-100 rounded text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Search on YouTube"
                  >
                    <Search size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Playlists</h4>
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Add New Playlist</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaylistUrl}
                onChange={(e) => setNewPlaylistUrl(e.target.value)}
                placeholder="Paste YouTube playlist URL..."
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={() => { if (newPlaylistUrl) { addPlaylist(); } }}
                disabled={!!searching}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
              >
                {searching || 'Add'}
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

const TopicCard: React.FC<{ topicName: string; playlist?: Playlist }> = ({ topicName, playlist }) => {
  const videoCount = playlist?.videos?.length || 0;
  const hasVideos = videoCount > 0;

  return (
    <div className={`p-2 rounded border flex flex-col items-center justify-center min-w-[100px] ${hasVideos ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
      <div className="text-xs font-medium text-center truncate w-full">{topicName}</div>
      <div className={`text-xs mt-1 ${hasVideos ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
        {hasVideos ? `${videoCount} videos` : 'No videos'}
      </div>
    </div>
  );
};

const SubjectSection: React.FC<{
  subject: SubjectData;
  onFind: () => void;
  onEdit: () => void;
  onImport: (data: SubjectData) => void;
}> = ({ subject, onFind, onEdit, onImport }) => {
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

    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.json')) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data) && data[0]) {
        const imported = data[0];
        const newPlaylists = imported.playlists || [];
        const newAllVideos = newPlaylists.flatMap((p: Playlist) => p.videos || []);
        onImport({ ...subject, playlists: newPlaylists, allVideos: newAllVideos });
      }
    } catch { alert('Failed to load file'); }
  };

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
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs text-blue-600 font-medium mb-3">{subject.focus}</p>

        {topicNames.length > 0 ? (
          playlists.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
              {topicNames.map((topic, idx) => {
                const playlist = playlists.find(p => p.index === idx);
                return <TopicCard key={idx} topicName={topic} playlist={playlist} />;
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-3">
              No playlists yet. Click "Find All" to search for {topicNames.length} topics.
            </div>
          )
        ) : (
          <div className="text-sm text-gray-500 mb-3">
            No playlists yet. Click "Find All" to search for playlists.
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onFind} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm flex items-center gap-1">
            <Search size={14} /> Find All
          </button>
          {playlists.length > 0 && (
            <button onClick={onEdit} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm flex items-center gap-1">
              <Play size={14} /> Edit
            </button>
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
  const [searching, setSearching] = useState('');
  const savedDataRef = useRef<SubjectData[]>([]);

  useEffect(() => {
    const data = loadSavedData();
    setSavedData(data);
    savedDataRef.current = data;
  }, []);

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  const hasApiKey = !!apiKey && apiKey !== 'YOUR_API_KEY';

  const getSubjectsForYear = (yearGroup: string): SubjectData[] => {
    const curr = getCurriculumForYear(yearGroup as ProfileTemplate);
    if (!curr) return [];

    const savedForYear = savedData.filter(s => s.yearGroup === yearGroup);
    const existingIds = new Set(savedForYear.map(s => s.id));

    const newSubjects: SubjectData[] = [];
    for (const sub of curr.subjects) {
      const id = `${yearGroup}-${sub.subject}`;
      if (!existingIds.has(id)) {
        newSubjects.push({
          id,
          yearGroup,
          subject: sub.subject,
          focus: sub.description,
          playlists: [],
          allVideos: []
        });
      }
    }

    return [...savedForYear, ...newSubjects];
  };

  const handleFindAll = async (subjects: SubjectData[]) => {
    if (!hasApiKey) {
      alert('YouTube API key required. Please set VITE_YOUTUBE_API_KEY in your .env file.');
      return;
    }

    setSearching('Searching...');

    for (const subject of subjects) {
      const topics = getTopicsForSubject(subject.yearGroup as ProfileTemplate, subject.subject);
      const newPlaylists: Playlist[] = [];

      for (let i = 0; i < Math.min(topics.length, 3); i++) {
        const topic = topics[i];
        try {
          const searchQuery = `${topic.topic} ${topic.focus} ${subject.subject} ${subject.yearGroup} tutorial playlist`;
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
            }
          }
        } catch { }
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
      saveData(savedDataRef.current);
      setSavedData([...savedDataRef.current]);
    }

    setSearching('');
  };

  const handleSaveSubject = (subject: SubjectData) => {
    const dataIndex = savedDataRef.current.findIndex(s => s.id === subject.id);
    if (dataIndex >= 0) {
      savedDataRef.current[dataIndex] = subject;
    } else {
      savedDataRef.current.push(subject);
    }
    saveData(savedDataRef.current);
    setSavedData([...savedDataRef.current]);
  };

  const handleImportSubject = (subject: SubjectData) => {
    const dataIndex = savedDataRef.current.findIndex(s => s.id === subject.id);
    if (dataIndex >= 0) {
      savedDataRef.current[dataIndex] = subject;
    } else {
      savedDataRef.current.push(subject);
    }
    saveData(savedDataRef.current);
    setSavedData([...savedDataRef.current]);
  };

  if (!selectedYear) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Curriculum Video Finder</h1>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          {!hasApiKey && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800">
              <AlertTriangle className="flex-shrink-0" size={24} />
              <div>
                <div className="font-bold">YouTube API Key Missing</div>
                <div className="text-sm">Please set VITE_YOUTUBE_API_KEY in your .env file to enable search.</div>
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4">Select Year Group</h2>
          <div className="grid grid-cols-2 gap-4">
            {PROFILE_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedYear(template.id as ProfileTemplate)}
                className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <div className="font-semibold text-lg">{template.label}</div>
                <div className="text-gray-500">{template.ageRange}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const subjects = getSubjectsForYear(selectedYear);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => setSelectedYear(null)} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Curriculum Video Finder</h1>
        <span className="text-gray-500">|</span>
        <span className="font-medium">{selectedYear}</span>

        {!hasApiKey && (
          <div className="flex items-center gap-1 text-amber-600 px-2 py-1 bg-amber-50 rounded text-xs border border-amber-100">
            <AlertTriangle size={12} />
            <span>API Key Missing</span>
          </div>
        )}

        <button
          onClick={() => handleFindAll(subjects)}
          disabled={!!searching}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Find All
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {subjects.length} Subjects for {selectedYear}
          </h2>
          <p className="text-gray-500 text-sm">
            Drag and drop JSON files to import playlists
          </p>
        </div>

        <div className="space-y-3">
          {subjects.map((sub, idx) => (
            <SubjectSection
              key={sub.id}
              subject={sub}
              onFind={() => handleFindAll([sub])}
              onEdit={() => setEditingSubject(sub)}
              onImport={handleImportSubject}
            />
          ))}
        </div>
      </div>

      {editingSubject && (
        <EditModal
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={handleSaveSubject}
        />
      )}
    </div>
  );
};

export default CurriculumSearch;
