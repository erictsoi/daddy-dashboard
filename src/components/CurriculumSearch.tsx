import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Play, Loader2, ExternalLink, BookOpen, Youtube, Check, X, AlertTriangle } from 'lucide-react';
import { fetchPlaylistVideos, YouTubeVideo } from '../utils/youtube';
import { getCurriculumForYear, UKCurriculumYear, UKCurriculumTopic } from '../data/ukCurriculum';
import { ProfileTemplate } from '../types';
import { PROFILE_TEMPLATES } from '../constants';
import { Card } from './design-system';

interface Props {
  onBack: () => void;
}

interface SubjectPlaylist {
  subject: string;
  topic: string;
  focus: string;
  description: string;
  videos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
  expanded: boolean;
}

const SEARCH_TERMS: Record<string, string[]> = {
  'English': ['BBC Alphablocks phonics', 'KS1 English reading', 'KS1 writing'],
  'Maths': ['Numberblocks', 'KS1 Maths', 'KS1 counting'],
  'Science': ['KS1 Science', 'BBC Bitesize Science kids', 'Science experiments kids'],
  'History': ['KS1 History', 'Kids history', 'Famous people kids'],
  'Geography': ['KS1 Geography', 'Kids geography', 'Weather for kids'],
  'Modern Language': ['Kids French', 'Kids Spanish', 'Duolingo kids'],
  'Art & Design': ['Kids art', 'Drawing for kids', 'KS1 Art'],
  'Music': ['Kids music', 'KS1 Music', 'Singing for kids'],
  'Computing': ['Scratch Jr', 'Code.org', 'Kids coding'],
  'Design & Technology': ['Kids DT', 'Design for kids', 'Crafts for kids'],
  'PE': ['Kids PE', 'Cosmic Kids Yoga', 'Kids exercise'],
  'PSHE': ['Kids PSHE', 'Feelings for kids', 'Kids wellbeing'],
  'RE': ['Kids RE', 'Religious education', 'Bible stories kids'],
};

export const CurriculumSearch: React.FC<Props> = ({ onBack }) => {
  const [selectedYear, setSelectedYear] = useState<ProfileTemplate | null>(null);
  const [curriculum, setCurriculum] = useState<UKCurriculumYear | null>(null);
  const [subjects, setSubjects] = useState<SubjectPlaylist[]>([]);
  const [searchAll, setSearchAll] = useState(false);

  useEffect(() => {
    if (selectedYear) {
      const curr = getCurriculumForYear(selectedYear);
      setCurriculum(curr || null);

      if (curr) {
        const subs = getUniqueSubjects(curr.subjects);
        setSubjects(subs.map(s => ({
          subject: s.subject,
          topic: s.topic,
          focus: s.focus,
          description: s.description,
          videos: [],
          loading: false,
          error: null,
          expanded: false,
        })));
      }
    }
  }, [selectedYear]);

  const getUniqueSubjects = (topics: UKCurriculumTopic[]): UKCurriculumTopic[] => {
    const seen = new Set<string>();
    const result: UKCurriculumTopic[] = [];
    for (const t of topics) {
      if (!seen.has(t.subject)) {
        seen.add(t.subject);
        result.push(t);
      }
    }
    return result.slice(0, 12);
  };

  const searchSubject = async (subject: string, topic: string, focus: string) => {
    const idx = subjects.findIndex(s => s.subject === subject);
    if (idx === -1) return;

    const searchTerms = SEARCH_TERMS[subject] || [`${subject} ${topic}`, `${subject} kids`];

    setSubjects(prev => prev.map((s, i) =>
      i === idx ? { ...s, loading: true, error: null, expanded: true } : s
    ));

    try {
      let videos: YouTubeVideo[] = [];

      for (const term of searchTerms) {
        try {
          const encoded = encodeURIComponent(term);
          const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encoded}&type=playlist&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`);

          if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
              for (const item of data.items) {
                if (item.id?.playlistId) {
                  const playlistUrl = `https://www.youtube.com/playlist?list=${item.id.playlistId}`;
                  try {
                    const playlistVideos = await fetchPlaylistVideos(playlistUrl);
                    videos = [...videos, ...playlistVideos.slice(0, 5)];
                  } catch { }
                }
              }
            }
          }
        } catch { }

        if (videos.length >= 3) break;
      }

      const uniqueVideos = videos.filter((v, i, arr) =>
        arr.findIndex(x => x.id === v.id) === i
      ).slice(0, 10);

      setSubjects(prev => prev.map((s, i) =>
        i === idx ? { ...s, videos: uniqueVideos, loading: false } : s
      ));
    } catch (err) {
      setSubjects(prev => prev.map((s, i) =>
        i === idx ? { ...s, error: 'Failed to fetch videos', loading: false } : s
      ));
    }
  };

  const searchAllSubjects = async () => {
    setSearchAll(true);
    for (const sub of subjects) {
      await searchSubject(sub.subject, sub.topic, sub.focus);
    }
    setSearchAll(false);
  };

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  const hasApiKey = !!apiKey && apiKey !== 'YOUR_API_KEY';

  if (!selectedYear) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Curriculum Search</h1>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          {!hasApiKey && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800">
              <AlertTriangle className="flex-shrink-0" size={24} />
              <div>
                <div className="font-bold">YouTube API Key Missing</div>
                <div className="text-sm">Please set VITE_YOUTUBE_API_KEY in your .env file to enable live search. Fallback scraping will be used otherwise.</div>
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4">Select Year Group</h2>
          <div className="grid grid-cols-2 gap-4">
            {PROFILE_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedYear(template.id)}
                className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <div className="text-3xl mb-2">{template.avatar}</div>
                <div className="font-semibold text-lg">{template.label}</div>
                <div className="text-gray-500">{template.ageRange}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => setSelectedYear(null)} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Curriculum Search</h1>
        <span className="text-gray-500">|</span>
        <span className="font-medium">{curriculum?.yearGroup} ({curriculum?.ageRange})</span>

        {!hasApiKey && (
          <div className="flex items-center gap-1 text-amber-600 px-2 py-1 bg-amber-50 rounded text-xs border border-amber-100">
            <AlertTriangle size={12} />
            <span>API Key Missing</span>
          </div>
        )}

        <button
          onClick={searchAllSubjects}
          disabled={searchAll}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {searchAll ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Search All Subjects
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {subjects.length} Subjects for {selectedYear}
          </h2>
          <p className="text-gray-500 text-sm">
            Click on a subject to search YouTube for relevant playlists
          </p>
        </div>

        <div className="space-y-3">
          {subjects.map((sub, idx) => (
            <div key={idx}>
              <Card className="overflow-hidden">
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => sub.videos.length === 0 && !sub.loading && searchSubject(sub.subject, sub.topic, sub.focus)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{sub.subject}</div>
                    <div className="text-sm text-gray-500">{sub.focus}</div>
                    <div className="text-xs text-gray-400 mt-1 italic">{sub.description}</div>
                  </div>
                  {sub.loading && <Loader2 size={20} className="animate-spin text-blue-600" />}
                  {sub.error && <X size={20} className="text-red-500" />}
                  {sub.videos.length > 0 && (
                    <Check size={20} className="text-green-500" />
                  )}
                  {sub.videos.length === 0 && !sub.loading && !sub.error && (
                    <Search size={20} className="text-gray-400" />
                  )}
                </div>

                {sub.expanded && sub.videos.length > 0 && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Youtube size={16} className="text-red-500" />
                      <span className="font-medium">Found {sub.videos.length} videos</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sub.videos.slice(0, 6).map((video, vIdx) => (
                        <a
                          key={vIdx}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex gap-3 p-2 bg-white rounded border hover:border-blue-400"
                        >
                          <div className="w-24 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            <Play size={20} className="text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{video.title}</div>
                            <div className="text-xs text-gray-500 truncate">{video.url}</div>
                          </div>
                          <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurriculumSearch;
