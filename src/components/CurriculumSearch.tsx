import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Play, Loader2, Youtube, Check, AlertTriangle, Star, Download, Upload } from 'lucide-react';
import { getCurriculumForYear, getTopicsForSubject } from '../data/ukCurriculum';
import { SEARCH_QUERIES } from '../data/searchQueries';
import { ProfileTemplate } from '../types';
import { PROFILE_TEMPLATES } from '../constants';
import { Card, Shadow, DS, IconButton } from './design-system';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-2" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">{subject.subject}</h2>
            <p className="text-sm text-blue-600 font-medium">{subject.focus}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={exportSubject} className="text-xs px-2 py-1 bg-blue-500 text-white rounded flex items-center gap-1"><Download size={12} />Export</button>
            <button onClick={importSubject} className="text-xs px-2 py-1 bg-purple-500 text-white rounded flex items-center gap-1"><Upload size={12} />Import</button>
            <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4 text-sm font-bold">
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{subject.yearGroup}</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">{playlists.length} playlists</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{allVideos.length} videos</span>
          </div>

          <div className="mb-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Curriculum Blueprint</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topics.map((t, i) => (
                <div key={i} className="p-3 border-2 border-slate-50 rounded-xl bg-slate-50/30 flex items-center justify-between group">
                  <div>
                    <div className="text-sm font-bold text-slate-700">{t.topic}</div>
                    <div className="text-[10px] font-medium text-slate-400 leading-tight mt-0.5">{t.focus}</div>
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

          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Playlists</h4>
          <div className="mb-4 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
            <h4 className="text-xs font-black text-slate-700 mb-2 uppercase tracking-tight">Add New Playlist</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaylistUrl}
                onChange={(e) => setNewPlaylistUrl(e.target.value)}
                placeholder="Paste YouTube playlist URL..."
                className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-blue-400 focus:outline-none transition-colors"
              />
              <button
                onClick={() => { if (newPlaylistUrl) { addPlaylist(); } }}
                disabled={!!searching}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
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
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 italic">
              No playlists associated with this subject yet.
            </div>
          )}

          {allVideos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">All Compiled Videos ({allVideos.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-1 border-2 border-slate-100 rounded-2xl p-2 bg-white">
                {allVideos.map((v, i) => (
                  <a key={i} href={v.url} target="_blank" className="flex items-center gap-3 text-xs p-2 hover:bg-slate-50 rounded-xl transition-colors font-bold text-slate-600">
                    <span className="text-red-500 bg-red-50 p-1 rounded-lg"><Play size={10} fill="currentColor" /></span>
                    <span className="truncate">{v.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3 sticky bottom-0 bg-white py-2 border-t pt-4">
            <button onClick={save} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
              Save Subject Data
            </button>
            <button onClick={onClose} className="px-6 py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-all">
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
  onSearch: (selected: string[]) => void;
  onClose: () => void;
}> = ({ subject, topics, onSearch, onClose }) => {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <Shadow offset={4} size={4} radius={DS.radius.lg} className="max-w-lg w-full">
        <div className="bg-white rounded-lg overflow-hidden border-2 border-white shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-5 border-b flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">{subject.subject}</h2>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Search Strategy Confirmation</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">&times;</button>
          </div>

          <div className="p-6">
            <div className="mb-5">
              <h3 className="font-black text-[10px] text-slate-500 uppercase tracking-widest mb-4">
                {isUsingTopics ? "Topics to search" : "Curated Search Queries"}
              </h3>
              <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto p-1">
                {(isUsingTopics ? topics : flatQueries).map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleTerm(term)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${selectedTerms.includes(term)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                  >
                    {selectedTerms.includes(term) && <Check size={12} className="inline mr-1" />} {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 mb-6 flex gap-4">
              <div className="text-amber-500 pt-1"><AlertTriangle size={20} /></div>
              <div className="text-xs text-amber-900 font-bold leading-relaxed">
                <strong>Curriculum Match:</strong> We recommend searching for these specific terms to ensure video quality.
                <div className="mt-1.5 opacity-70">Estimated YouTube API Impact: ~{estimatedAPI} units.</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onSearch(selectedTerms)}
                disabled={selectedTerms.length === 0}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
              >
                Launch Search ({selectedTerms.length})
              </button>
              <button
                onClick={onClose}
                className="px-6 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      </Shadow>
    </div>
  );
};

const TopicCard: React.FC<{ topicName: string; playlist?: Playlist }> = ({ topicName, playlist }) => {
  const videoCount = playlist?.videos?.length || 0;
  const hasVideos = videoCount > 0;

  return (
    <Shadow offset={hasVideos ? 2 : 1} size={1} radius={DS.radius.md}>
      <div className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center min-w-[110px] transition-all h-full ${hasVideos
        ? 'bg-green-50 border-green-200 shadow-green-50 text-green-800'
        : 'bg-white border-slate-100 text-slate-400'
        }`}>
        <div className="text-[10px] font-black text-center uppercase tracking-tight w-full truncate mb-1">{topicName}</div>
        <div className={`text-[10px] flex items-center gap-1 font-black ${hasVideos ? 'text-green-600' : 'text-slate-200'}`}>
          {hasVideos ? (<><Youtube size={10} /> {videoCount} VIDEOS</>) : 'EMPTY'}
        </div>
      </div>
    </Shadow>
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
    <Shadow offset={hasAnyVideos ? 3 : 2} size={2} radius={DS.radius.lg} className="mb-6">
      <div
        className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${hasAnyVideos ? 'border-green-400 shadow-2xl shadow-green-100' : 'border-slate-200'
          } ${isDragging ? 'border-blue-500 ring-8 ring-blue-500/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`p-4 ${hasAnyVideos ? 'bg-green-50/40' : 'bg-slate-50/50'} border-b flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-sm ${hasAnyVideos ? 'bg-white border-green-200 text-green-600' : 'bg-white border-slate-100 text-slate-300'
              }`}>
              <Youtube size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-800 leading-tight">{subject.subject}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                  {subject.yearGroup}
                </span>
                {hasAnyVideos && (
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1 ml-1 bg-green-100/50 px-2 py-1 rounded-lg">
                    <Check size={10} strokeWidth={4} /> SYNCED
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onFind}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <Search size={14} /> EXPLORE
            </button>
            {playlists.length > 0 && (
              <button
                onClick={onEdit}
                className="px-5 py-2.5 bg-white border-2 border-green-300 text-green-700 rounded-xl text-xs font-black hover:bg-green-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
              >
                <Play size={14} fill="currentColor" /> MANAGE
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Star size={12} className="text-amber-400" /> Daddy's Learning Goals
            </h4>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
              <p className="pl-5 text-sm text-slate-600 font-bold leading-relaxed italic">
                "{subject.focus}"
              </p>
            </div>
          </div>

          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Curriculum Mapping</h4>
          {topicNames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {topicNames.map((topic, idx) => {
                const playlist = playlists.find(p => p.index === idx);
                return <TopicCard key={idx} topicName={topic} playlist={playlist} />;
              })}
            </div>
          ) : (
            <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-300 text-xs font-black uppercase tracking-widest">
              General Curriculum Search Mode
            </div>
          )}
        </div>
      </div>
    </Shadow>
  );
};

export const CurriculumSearch: React.FC<Props> = ({ onBack }) => {
  const [selectedYear, setSelectedYear] = useState<ProfileTemplate | null>(null);
  const [savedData, setSavedData] = useState<SubjectData[]>([]);
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
  const [previewSubject, setPreviewSubject] = useState<SubjectData | null>(null);
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

  const handleFindAll = async (subjects: SubjectData[], customQueries?: string[]) => {
    if (!hasApiKey) {
      alert('YouTube API key required. Please set VITE_YOUTUBE_API_KEY in your .env file.');
      return;
    }

    setSearching('Performing Audit Search...');

    for (const subject of subjects) {
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
      <div className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-white border-b-2 border-slate-200 px-8 py-5 flex items-center gap-8 sticky top-0 z-50">
          <IconButton onClick={onBack} size={42} title="Exit Library">
            <ArrowLeft size={18} />
          </IconButton>
          <div>
            <h1 className="b t-h1" style={{ fontSize: 28, color: DS.ink }}>Curriculum Video Library</h1>
            <p className="n t-small" style={{ color: DS.inkSoft, fontWeight: 900 }}>UK NATIONAL STANDARDS COMPLIANT SEARCH</p>
          </div>
        </div>

        <div className="p-8 max-w-4xl mx-auto">
          {!hasApiKey && (
            <Shadow offset={4} size={3} radius={DS.radius.lg} className="mb-10">
              <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl flex gap-5 text-amber-800 shadow-xl shadow-amber-50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="font-black text-sm uppercase tracking-widest mb-1 text-amber-900">Automation Paused</div>
                  <div className="text-sm font-bold opacity-80 leading-relaxed">Search API key required. Please configure <strong>VITE_YOUTUBE_API_KEY</strong> in your environment settings.</div>
                </div>
              </div>
            </Shadow>
          )}

          <div className="mb-10">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Select Child's Year Group</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {PROFILE_TEMPLATES.map(template => (
                <Shadow key={template.id} offset={4} size={3} radius={DS.radius.lg}>
                  <button
                    onClick={() => setSelectedYear(template.id as ProfileTemplate)}
                    className="w-full text-left p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Star size={80} strokeWidth={3} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
                      </div>
                      <div className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 group-hover:bg-blue-700 group-hover:text-white transition-all uppercase tracking-widest">
                        {template.label}
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-800">Year {template.label}</div>
                    <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-tight">Primary Curriculum</p>
                  </button>
                </Shadow>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subjects = getSubjectsForYear(selectedYear);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-white border-b-2 border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <IconButton onClick={() => setSelectedYear(null)} size={42} title="Change Level">
            <ArrowLeft size={18} />
          </IconButton>
          <div>
            <h1 className="b t-h1" style={{ fontSize: 24, color: DS.ink }}>Year {selectedYear} Standards</h1>
            <p className="n t-small" style={{ color: DS.inkSoft, fontWeight: 900 }}>VIDEO CURATION & AUDIT CONSOLE</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleFindAll(subjects)}
            disabled={!!searching || !hasApiKey}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {searching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} strokeWidth={3} />}
            AUDIT ALL SUBJECTS
          </button>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        {searching && (
          <div className="mb-8 bg-blue-600 text-white rounded-3xl p-6 flex items-center justify-center gap-4 shadow-2xl shadow-blue-200 animate-pulse">
            <Loader2 className="animate-spin" size={24} />
            <span className="font-black text-lg uppercase tracking-[0.2em]">{searching}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {subjects.map(s => (
            <SubjectSection
              key={s.id}
              subject={s}
              onFind={() => setPreviewSubject(s)}
              onEdit={() => setEditingSubject(s)}
              onImport={handleImportSubject}
            />
          ))}
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
          onSearch={(selected) => {
            handleFindAll([previewSubject], selected);
            setPreviewSubject(null);
          }}
          onClose={() => setPreviewSubject(null)}
        />
      )}
    </div>
  );
};
