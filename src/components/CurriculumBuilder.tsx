import { logger } from '../lib/logger';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { ArrowLeft, Save, AlertCircle, FileText, CheckCircle, Link, Copy, Youtube, Loader2, ChevronRight } from 'lucide-react';
import { fetchPlaylistVideos, processYouTubeUrl } from '../utils/youtube';
import { ParsedRow, ParsedTemplateRow } from '../types';
import { DS, Shadow, Card } from './design-system';

const YOUTUBE_REGEX = /(?:youtube\.com|youtu\.be)/i;
const PLAYLIST_ID_REGEX = /[?&]list=([a-zA-Z0-9_-]+)/;

interface Props {
  onBack: () => void;
  onImport: (rows: ParsedRow[]) => void;
  onImportComplete?: () => void;
  onTemplateImport?: (rows: ParsedTemplateRow[]) => void;
}

export const CurriculumBuilder: React.FC<Props> = ({ onBack, onImport, onImportComplete, onTemplateImport }) => {
  const [inputText, setInputText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [templateRows, setTemplateRows] = useState<ParsedTemplateRow[]>([]);
  const [inputMode, setInputMode] = useState<'paste' | 'playlist' | 'template'>('paste');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState('');
  const [defaultChild, setDefaultChild] = useState('Sophia');
  const [defaultYear, setDefaultYear] = useState('Year 5');
  const [defaultSubject, setDefaultSubject] = useState('English');
  const [defaultSubcategory, setDefaultSubcategory] = useState('Reading Comprehension');
  const [expandedCount, setExpandedCount] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (import.meta.env.VITE_YOUTUBE_API_KEY) {
      window.YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
    }
  }, []);

  const loadPlaylist = useCallback(async () => {
    if (!playlistUrl.trim()) return;

    setIsLoadingPlaylist(true);
    setPlaylistError('');

    try {
      logger.log('[CurriculumBuilder] Loading playlist:', playlistUrl);
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      logger.log('[CurriculumBuilder] API Key available:', !!apiKey);
      
      const videos = await fetchPlaylistVideos(playlistUrl);
      logger.log('[CurriculumBuilder] Loaded', videos.length, 'videos');

      const cleanUrl = cleanPlaylistUrl(playlistUrl);
      // Get playlist title from first video
      const playlistTitle = videos[0]?.title?.split(' - ')[0] || 'Playlist';
      const newRow: ParsedRow = {
        childName: defaultChild,
        yearGroup: defaultYear,
        subjectCategory: defaultSubject,
        subjectName: defaultSubcategory,
        lessonTitle: `Playlist (${videos.length} videos) - ${playlistTitle}`,
        lessonNotes: '',
        videoUrl: cleanUrl,
        isValid: true,
        isYouTubeUrl: true,
        youTubeType: 'playlist',
        expandedLessons: videos.map((v, idx) => ({
          title: v.title,
          videoUrl: `https://www.youtube.com/embed/${v.id}`,
          videoId: v.id,
          position: idx,
          playlistTitle: playlistTitle,
        })),
      };
      setParsedRows([newRow]);
    } catch (error) {
      logger.error('[CurriculumBuilder] Error loading playlist:', error);
      setPlaylistError(`Failed to load playlist: ${error instanceof Error ? error.message : 'Unknown error'}. Check the URL and try again.`);
    } finally {
      setIsLoadingPlaylist(false);
    }
  }, [playlistUrl, defaultChild, defaultYear, defaultSubject, defaultSubcategory]);

  const parseInput = useCallback((text: string): ParsedRow[] => {
    return text.split(/\r?\n/).filter(line => line.trim() !== '').map(line => {
      const cols = line.split('\t');
      const childName = cols[0]?.trim() || '';
      const yearGroup = cols[1]?.trim() || '';
      const subjectCategory = cols[2]?.trim() || '';
      const topicName = cols[3]?.trim() || '';
      const lessonTitle = cols[4]?.trim() || '';
      const lessonFocus = cols[5]?.trim() || '';
      const lessonNotes = cols[6]?.trim() || '';
      const videoUrl = cols[7]?.trim() || cols[6]?.trim() || '';

      const isYouTubeUrl = YOUTUBE_REGEX.test(videoUrl);
      const isValid = !!(childName && yearGroup && subjectCategory && topicName);

      return {
        childName,
        yearGroup,
        subjectCategory,
        subjectName: topicName,
        lessonTitle: lessonTitle || '', // Don't fallback - let handleProcessYouTube fill with YouTube title
        lessonFocus,
        lessonNotes,
        videoUrl,
        isValid,
        isYouTubeUrl,
        youTubeType: undefined as 'video' | 'playlist' | undefined,
      };
    });
  }, []);

  const parseTemplateInput = useCallback((text: string): ParsedTemplateRow[] => {
    return text.split(/\r?\n/).filter(line => line.trim() !== '').map(line => {
      const cols = line.split('\t');
      const profile = cols[0]?.trim() || '';
      const subject = cols[1]?.trim() || '';
      const focus = cols[2]?.trim() || '';
      const primaryPlaylist = cols[3]?.trim() || '';
      const backupPlaylist1 = cols[4]?.trim() || '';
      const backupPlaylist2 = cols[5]?.trim() || '';
      const notes = cols[6]?.trim() || '';

      const isValid = !!(profile && subject && focus);

      return {
        profile,
        subject,
        focus,
        primaryPlaylist,
        backupPlaylist1: backupPlaylist1 || undefined,
        backupPlaylist2: backupPlaylist2 || undefined,
        notes,
        isValid,
      };
    });
  }, []);

  useEffect(() => {
    if (!inputText.trim()) {
      setParsedRows([]);
      return;
    }
    setParsedRows(parseInput(inputText));
  }, [inputText, parseInput]);

  useEffect(() => {
    if (!inputText.trim()) {
      setTemplateRows([]);
      return;
    }
    if (inputMode === 'template') {
      setTemplateRows(parseTemplateInput(inputText));
    } else {
      setTemplateRows([]);
    }
  }, [inputText, inputMode, parseTemplateInput]);

  const cleanPlaylistUrl = useCallback((url: string): string => {
    const playlistIdMatch = url.match(PLAYLIST_ID_REGEX);
    return playlistIdMatch ? `https://www.youtube.com/playlist?list=${playlistIdMatch[1]}` : url;
  }, []);

  const processYouTube = useCallback(async () => {
    const unprocessed = parsedRows.filter(r => r.isYouTubeUrl && !r.expandedLessons);
    if (unprocessed.length === 0) return;

    setIsProcessing(true);
    const updated = [...parsedRows];
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    for (let i = 0; i < updated.length; i++) {
      const row = updated[i];
      if (!row.isYouTubeUrl || row.expandedLessons) continue;

      setProcessingProgress(`Processing ${i + 1} of ${updated.length}...`);

      const result = await processYouTubeUrl(cleanPlaylistUrl(row.videoUrl), row.lessonTitle || undefined, apiKey);

      if (result) {
        const isPlaylist = result.isPlaylist;
        const videoCount = result.videos?.length || 0;
        
        updated[i] = {
          ...updated[i],
          // For playlists: show "Playlist (X videos) - Title", for videos: show YouTube title
          lessonTitle: isPlaylist && videoCount > 0 
            ? `Playlist (${videoCount} videos) - ${result.title}` 
            : result.title,
          videoUrl: result.videoUrl,
          youTubeType: isPlaylist ? 'playlist' : 'video',
        };

        if (isPlaylist && result.videos && result.videos.length > 0) {
          // Store YouTube playlist title for display
          const ytPlaylistTitle = result.title;
          // Don't add "Video X - " prefix - YouTube titles already have it
          updated[i].expandedLessons = result.videos.map((v, idx) => ({
            title: v.title,
            videoUrl: `https://www.youtube.com/embed/${v.id}`,
            videoId: v.id,
            position: idx,
            playlistTitle: ytPlaylistTitle,
          }));
        }
      }
    }

    setParsedRows(updated);
    setIsProcessing(false);
    setProcessingProgress('');
  }, [parsedRows, cleanPlaylistUrl]);

  const expandPlaylists = useCallback(() => {
    const expanded: ParsedRow[] = [];
    let playlistCount = 0;

    for (const row of parsedRows) {
      if (row.youTubeType === 'playlist' && row.expandedLessons && row.expandedLessons.length > 0) {
        playlistCount++;
        for (const lesson of row.expandedLessons) {
          const position = lesson.position + 1;
          expanded.push({
            ...row,
            lessonTitle: `Video ${position} - ${lesson.title}`,
            videoUrl: lesson.videoUrl,
            videoPosition: position,
            isYouTubeUrl: true,
            youTubeType: 'video',
            expandedLessons: undefined,
          });
        }
      } else {
        expanded.push(row);
      }
    }

    setParsedRows(expanded);
    setExpandedCount(expanded.length - parsedRows.length + playlistCount);
  }, [parsedRows]);

  const validRows = useMemo(() => parsedRows.filter(r => r.isValid), [parsedRows]);
  const playlistRows = useMemo(() => parsedRows.filter(r => r.youTubeType === 'playlist'), [parsedRows]);
  const unprocessedYouTube = useMemo(() => parsedRows.filter(r => r.isYouTubeUrl && !r.youTubeType), [parsedRows]);
  const totalLessons = useMemo(() => {
    return parsedRows.reduce((acc, row) => {
      if (row.youTubeType === 'playlist' && row.expandedLessons) {
        return acc + row.expandedLessons.length;
      }
      return acc + (row.isValid ? 1 : 0);
    }, 0);
  }, [parsedRows]);

  const handleImport = useCallback(() => {
    if (isImporting) {
      logger.log('[CurriculumBuilder] Import already in progress');
      return;
    }

    if (inputMode === 'template') {
      const validTemplateRows = templateRows.filter(r => r.isValid);
      if (validTemplateRows.length === 0) {
        logger.log('[CurriculumBuilder] No valid template rows to import');
        return;
      }
      logger.log('[CurriculumBuilder] Calling onTemplateImport with', validTemplateRows.length, 'rows');
      setIsImporting(true);
      if (onTemplateImport) {
        onTemplateImport(validTemplateRows);
      }
      setTimeout(() => {
        setIsImporting(false);
        if (onImportComplete) onImportComplete();
      }, 2000);
      return;
    }
    
    const finalRows = parsedRows.filter(r => r.isValid).map(row => ({
      ...row,
      expandedLessons: undefined,
    }));
    
    if (finalRows.length === 0) {
      logger.log('[CurriculumBuilder] No valid rows to import');
      return;
    }
    
    logger.log('[CurriculumBuilder] Calling onImport with', finalRows.length, 'rows');
    setIsImporting(true);
    onImport(finalRows);
    
    setTimeout(() => {
      setIsImporting(false);
      if (onImportComplete) onImportComplete();
    }, 2000);
  }, [isImporting, parsedRows, templateRows, inputMode, onImport, onTemplateImport, onImportComplete]);

  return (
    <div style={{ minHeight: '100vh', background: DS.cream, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: DS.card, borderBottom: DS.border, padding: 16, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 0 rgba(45,45,45,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Shadow offset={2} size={2} radius={DS.radius.md} style={{ display: 'inline-block' }}>
              <button onClick={onBack} style={{ position: 'relative', background: DS.card, border: DS.border, borderRadius: DS.radius.md, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={20} style={{ color: DS.ink }} />
              </button>
            </Shadow>
            <div>
              <h1 className="b t-h2" style={{ color: DS.ink }}>Curriculum Importer</h1>
              <p className="ns t-small" style={{ color: DS.inkSoft }}>Step 1: Paste data → Step 2: Parse URLs → Step 3: Expand Playlists → Step 4: Import</p>
            </div>
          </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isProcessing && (
              <span className="ns t-small" style={{ color: DS.inkSoft, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {processingProgress}
              </span>
            )}
            <Shadow offset={2} size={2} radius={DS.radius.pill} style={{ display: 'inline-block', opacity: unprocessedYouTube.length > 0 && !isProcessing ? 1 : 0.5 }}>
              <button
                onClick={processYouTube}
                disabled={isProcessing || unprocessedYouTube.length === 0}
                style={{
                  position: 'relative',
                  background: unprocessedYouTube.length > 0 && !isProcessing ? '#EF4444' : '#E5E7EB',
                  border: DS.border,
                  borderRadius: DS.radius.pill,
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: 14,
                  color: unprocessedYouTube.length > 0 && !isProcessing ? '#fff' : '#9CA3AF',
                  cursor: unprocessedYouTube.length > 0 && !isProcessing ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                title="Convert YouTube URLs to playlist format"
              >
                <Youtube size={18} />
                {unprocessedYouTube.length > 0 ? `Parse ${unprocessedYouTube.length} URLs` : 'URLs Parsed'}
              </button>
            </Shadow>
            <Shadow offset={2} size={2} radius={DS.radius.pill} style={{ display: 'inline-block', opacity: playlistRows.length > 0 ? 1 : 0.5 }}>
              <button
                onClick={expandPlaylists}
                disabled={playlistRows.length === 0}
                style={{
                  position: 'relative',
                  background: playlistRows.length > 0 ? '#8B5CF6' : '#E5E7EB',
                  border: DS.border,
                  borderRadius: DS.radius.pill,
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: 14,
                  color: playlistRows.length > 0 ? '#fff' : '#9CA3AF',
                  cursor: playlistRows.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                title="Convert playlists into individual video lessons"
              >
                <Link size={18} />
                {playlistRows.length > 0 ? `Expand ${playlistRows.length} Playlists` : 'Playlists Expanded'}
              </button>
            </Shadow>
            <Shadow offset={2} size={2} radius={DS.radius.pill} style={{ display: 'inline-block', opacity: totalLessons > 0 && !isProcessing && !isImporting ? 1 : 0.5 }}>
              <button
                onClick={handleImport}
                disabled={totalLessons === 0 || isProcessing || isImporting}
                style={{
                  position: 'relative',
                  background: totalLessons > 0 && !isProcessing && !isImporting ? '#2563EB' : '#E5E7EB',
                  border: DS.border,
                  borderRadius: DS.radius.pill,
                  padding: '12px 24px',
                  fontWeight: 800,
                  fontSize: 14,
                  color: totalLessons > 0 && !isProcessing && !isImporting ? '#fff' : '#9CA3AF',
                  cursor: totalLessons > 0 && !isProcessing && !isImporting ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                title="Save all lessons to curriculum"
              >
                <Save size={18} />
                {isImporting ? 'Importing...' : `Import ${totalLessons} Lessons`}
              </button>
            </Shadow>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setInputMode('paste')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                  inputMode === 'paste' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Copy size={16} /> Paste Spreadsheet
              </button>
              <button
                onClick={() => setInputMode('playlist')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                  inputMode === 'playlist' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Link size={16} /> Paste Playlist URL
              </button>
              <button
                onClick={() => setInputMode('template')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                  inputMode === 'template' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText size={16} /> Template Import
              </button>
            </div>

            {inputMode === 'paste' ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">How to Import:</h3>
                  <ol className="text-xs text-blue-700 space-y-1">
                    <li><span className="font-bold">1.</span> Paste your data in the box below</li>
                    <li><span className="font-bold">2.</span> Click <span className="bg-red-100 px-1 rounded">Parse URLs</span> to process YouTube links</li>
                    <li><span className="font-bold">3.</span> Click <span className="bg-purple-100 px-1 rounded">Expand Playlists</span> to turn playlists into individual videos</li>
                    <li><span className="font-bold">4.</span> Click <span className="bg-blue-100 px-1 rounded">Import</span> to save everything</li>
                  </ol>
                </div>
                <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" /> Paste Data Here
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  Copy columns from Excel/Sheets: <br />
                  <span className="font-mono bg-gray-100 px-1">Who | Year | Subject | Topic | Lesson Title | Lesson Focus | Notes | Video URL</span>
                </p>
                <textarea
                  className="w-full h-64 p-3 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none whitespace-nowrap overflow-auto"
                  placeholder={`Sophia\tYear 5\tEnglish\tReading Comprehension\tVideo 1 - Inference Skills\tinference skills\tBBC curriculum videos\thttps://...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </>
            ) : inputMode === 'playlist' ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Playlist Mode</h3>
                  <p className="text-xs text-blue-700">
                    Paste a YouTube playlist URL. All videos will be imported as lessons under the default values below.
                  </p>
                </div>
                <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Link size={18} className="text-red-500" /> YouTube Playlist URL
                </h2>
                <input
                  type="url"
                  id="playlist-url"
                  name="playlistUrl"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://www.youtube.com/playlist?list=..."
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadPlaylist()}
                />
                <button
                  onClick={loadPlaylist}
                  disabled={isLoadingPlaylist || !playlistUrl.trim()}
                  className={`w-full mt-3 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                    isLoadingPlaylist ? 'bg-gray-200 text-gray-400' : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isLoadingPlaylist ? <Loader2 size={16} className="animate-spin" /> : 'Load Playlist'}
                </button>
                {playlistError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">{playlistError}</p>
                    <p className="text-xs text-red-500 mt-1">
                      Try using Paste Mode instead, or add a YouTube API key.
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <p className="text-xs font-medium text-gray-600">Default Values (applied to all videos)</p>
                  <input
                    type="text"
                    id="default-child"
                    name="defaultChild"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="Child Name (e.g., Sophia)"
                    value={defaultChild}
                    onChange={(e) => setDefaultChild(e.target.value)}
                  />
                  <input
                    type="text"
                    id="default-year"
                    name="defaultYear"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="Year Group (e.g., Year 5)"
                    value={defaultYear}
                    onChange={(e) => setDefaultYear(e.target.value)}
                  />
                  <input
                    type="text"
                    id="default-subject"
                    name="defaultSubject"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="Subject (e.g., English)"
                    value={defaultSubject}
                    onChange={(e) => setDefaultSubject(e.target.value)}
                  />
                  <input
                    type="text"
                    id="default-topic"
                    name="defaultTopic"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="Topic (e.g., Reading Comprehension)"
                    value={defaultSubcategory}
                    onChange={(e) => setDefaultSubcategory(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Template Import Mode</h3>
                  <p className="text-xs text-purple-700">
                    Import curriculum stacks from 7-column spreadsheet. Maps Profile → Subject → Focus → 3 Playlists per card.
                  </p>
                </div>
                <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-purple-500" /> Paste Template Data
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  Copy columns from Excel/Sheets:<br />
                  <span className="font-mono bg-gray-100 px-1">Profile | Subject | Focus | Primary Playlist | Backup 1 | Backup 2 | Notes</span>
                </p>
                <textarea
                  className="w-full h-64 p-3 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none whitespace-nowrap overflow-auto"
                  placeholder={`Y1/2 Child\tEnglish\tPhonics & stories\thttps://youtube.com/playlist?list=...\thttps://...\thttps://...\tBlending sounds...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={16} /> Two Ways to Import
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-bold bg-blue-200 px-1.5 rounded text-xs">1</span>
                <span><span className="font-semibold">Paste Spreadsheet:</span> Copy 8 columns from Excel/Sheets and paste below</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold bg-blue-200 px-1.5 rounded text-xs">2</span>
                <span><span className="font-semibold">Playlist URL:</span> Paste a YouTube playlist link with default values</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold bg-purple-200 px-1.5 rounded text-xs">3</span>
                <span><span className="font-semibold">Template Import:</span> Import 7-column curriculum stacks with Primary + 2 Backups</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
            <h2 className="font-semibold text-gray-800">
              {inputMode === 'template' ? 'Template Preview' : 'Preview Data'}
            </h2>
            <div className="flex gap-4 text-xs font-medium flex-wrap">
              {inputMode === 'template' ? (
                <>
                  <span className="flex items-center gap-1 text-gray-600">{templateRows.length} rows</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} /> {templateRows.filter(r => r.isValid).length} valid
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={14} /> {templateRows.filter(r => !r.isValid).length} invalid
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1 text-gray-600">{parsedRows.length} rows</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} /> {validRows.length} valid
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={14} /> {parsedRows.length - validRows.length} invalid
                  </span>
                </>
              )}
              {expandedCount > 0 && (
                <span className="flex items-center gap-1 text-purple-600">
                  <Link size={14} /> +{expandedCount} expanded
                </span>
              )}
            </div>
          </div>

          {inputMode === 'template' ? (
            <TemplatePreviewTable rows={templateRows} />
          ) : (
            <PreviewTable rows={parsedRows} />
          )}
        </div>
      </div>
    </div>
  );
};

interface PreviewTableProps {
  rows: ParsedRow[];
}

const PreviewTable = memo(function PreviewTable({ rows }: PreviewTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex-1 overflow-auto max-h-[600px]">
        <div className="p-12 text-center text-gray-400 italic">Paste data to see preview...</div>
      </div>
    );
  }

  const groups = useMemo(() => {
    return rows.reduce<Record<string, ParsedRow[]>>((acc, row) => {
      const key = `${row.yearGroup}|${row.subjectCategory}|${row.subjectName}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});
  }, [rows]);

  const groupsArray = Object.entries(groups);

  return (
    <div className="flex-1 overflow-auto max-h-[600px]">
      <div className="divide-y divide-gray-200">
        {(Object.entries(groups) as [string, ParsedRow[]][]).map(([key, groupRows]) => {
          const [year, category, topic] = key.split('|');
          const allVideos = groupRows.flatMap((row) =>
            row.expandedLessons?.map((l) => ({ 
              title: l.title, 
              position: l.position, 
              videoUrl: l.videoUrl,
              // Use YouTube playlist title if available, otherwise fallback to user data
              subheading: (l as any).playlistTitle || row.lessonFocus || row.lessonNotes || ''
            })) ||
            (row.lessonTitle ? [{ title: row.lessonTitle, position: 0, videoUrl: row.videoUrl, subheading: row.lessonFocus || row.lessonNotes || '' }] : [])
          );

          return (
            <div key={key}>
              <PreviewGroupRow year={year} category={category} topic={topic} videos={allVideos} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

interface TemplatePreviewTableProps {
  rows: ParsedTemplateRow[];
}

const TemplatePreviewTable = memo(function TemplatePreviewTable({ rows }: TemplatePreviewTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex-1 overflow-auto max-h-[600px]">
        <div className="p-12 text-center text-gray-400 italic">Paste template data to see preview...</div>
      </div>
    );
  }

  const validRows = rows.filter(r => r.isValid);

  return (
    <div className="flex-1 overflow-auto max-h-[600px]">
      <div className="divide-y divide-gray-200">
        {rows.map((row, idx) => (
          <div key={idx} className={`px-4 py-3 ${row.isValid ? 'bg-white' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-purple-700">{row.profile}</span>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="font-medium text-indigo-700">{row.subject}</span>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="font-medium text-gray-800">{row.focus}</span>
              {!row.isValid && <AlertCircle size={14} className="text-red-500 ml-auto" />}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Youtube size={12} className="text-red-500" />
              <span className="truncate">{row.primaryPlaylist || 'No playlist'}</span>
              {row.backupPlaylist1 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">Backup 1: {row.backupPlaylist1}</span>
                </>
              )}
              {row.backupPlaylist2 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">Backup 2: {row.backupPlaylist2}</span>
                </>
              )}
            </div>
            {row.notes && (
              <div className="text-xs text-gray-400 mt-1 italic">{row.notes}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

interface PreviewGroupRowProps {
  year: string;
  category: string;
  topic: string;
  videos: { title: string; position: number; videoUrl: string; subheading?: string }[];
}

const PreviewGroupRow = memo(function PreviewGroupRow({ year, category, topic, videos }: PreviewGroupRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left bg-gray-50">
        <ChevronRight size={18} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        <span className="font-medium text-gray-800">{year}</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="font-medium text-indigo-700">{category}</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="font-medium text-gray-800">{topic}</span>
        <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{videos.length} videos</span>
      </button>
      {isExpanded && (
        <div className="divide-y divide-gray-100 bg-white">
          {videos.map((video, idx) => (
            <div key={idx} className="px-4 pl-12 py-2 flex items-center gap-3 hover:bg-gray-50">
              <Youtube size={14} className="text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-800 truncate">{video.title}</div>
                {video.subheading && <div className="text-xs text-gray-500 truncate">{video.subheading}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
