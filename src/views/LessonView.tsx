import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChildProfile } from '../types';
import { DS, Texture, Blobs, Shadow } from '../components/design-system';
import { toKidDash, toLessonView } from '../lib/routes';
import { getSubjectCardsForYear, loadSubjectCardsForYear } from '../lib/subjectCards';
import { useAppContext } from '../context/AppContext';
import { DEMO_PROFILES } from '../data/demoProfiles';

interface LessonViewProps {
    childId: string;
    lessonId: string;
    data?: ChildProfile[];
    subjectId?: string;
    topicId?: string;
}

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'Nunito Sans', sans-serif; background: var(--dd-bg, #FDF8F2); color: var(--dd-ink, #1A1028); }
        .b  { font-family: 'Baloo 2', cursive; }
        .n  { font-family: 'Nunito', sans-serif; }
        .ns { font-family: 'Nunito Sans', sans-serif; }
        .t-h2    { font-size: 22px; font-weight: 800; line-height: 1.2; }
        .t-body  { font-size: 14px; font-weight: 500; line-height: 1.65; }
        .t-small { font-size: 12px; font-weight: 600; line-height: 1.5; }
        .t-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        @keyframes pop { from{transform:scale(.88);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes slide { from{transform:translateX(24px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .pop { animation: pop .3s cubic-bezier(.34,1.56,.64,1) forwards; }
        .slide { animation: slide .28s ease-out forwards; }
        .fadeIn { animation: fadeIn .2s ease-out forwards; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #EDE8E0; }
        ::-webkit-scrollbar-thumb { background: #C4BBAF; border-radius: 3px; }
    `}</style>
);

export const LessonView: React.FC<LessonViewProps> = ({ childId, lessonId, data: dataProp, subjectId, topicId }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [videoFinished, setVideoFinished] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [dailyTimeSpent, setDailyTimeSpent] = useState(0);
    const [expandedPlaylists, setExpandedPlaylists] = useState<Set<number>>(new Set());
    const [videoUnavailable, setVideoUnavailable] = useState(false);
    const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
    const { children: contextData } = useAppContext();
    
    const DAILY_LIMIT = 50 * 60; // 50 minutes in seconds
    const remainingTime = DAILY_LIMIT - dailyTimeSpent - elapsedSeconds;

    // Use prop data if provided, fall back to context
    const data = dataProp && dataProp.length > 0 ? dataProp : contextData;

    // Get subject and topic from params if not passed as props
    const subjectIdParam = subjectId || searchParams.get('subject') || '';
    const topicIdParam = topicId || searchParams.get('topic') || '';
    const playlistUrl = searchParams.get('url') || '';

    // Reset finished state when lesson changes
    useEffect(() => {
        setVideoFinished(false);
        // Reset timer when lesson changes
        setElapsedSeconds(0);
        setIsTimerRunning(false);
    }, [lessonId]);

    // Load daily time spent for this subject
    useEffect(() => {
        const today = new Date().toDateString();
        const subjectKey = `${subjectIdParam}-${today}`;
        const savedTime = localStorage.getItem(subjectKey);
        setDailyTimeSpent(savedTime ? parseInt(savedTime) : 0);
    }, [subjectIdParam]);

    // Auto-start timer when video loads
    useEffect(() => {
        if (!loading && remainingTime > 0) {
            // Auto-start timer after a short delay to simulate video start
            const autoStartTimer = setTimeout(() => {
                setIsTimerRunning(true);
            }, 2000); // Start after 2 seconds (video autoplay delay)
            
            return () => clearTimeout(autoStartTimer);
        }
        return () => {}; // Empty cleanup for the else case
    }, [loading, remainingTime]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (isTimerRunning && remainingTime > 0) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning, remainingTime]);

    // Save daily time when component unmounts or timer stops
    useEffect(() => {
        const today = new Date().toDateString();
        const subjectKey = `${subjectIdParam}-${today}`;
        const totalSpent = dailyTimeSpent + elapsedSeconds;
        localStorage.setItem(subjectKey, totalSpent.toString());
    }, [elapsedSeconds, dailyTimeSpent, subjectIdParam]);

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        if (remainingTime > 0) {
            setIsTimerRunning(!isTimerRunning);
        }
    };

    const addTenMinutes = () => {
        if (remainingTime >= 600) {
            setElapsedSeconds(prev => prev + 600);
        }
    };

    // Accordion toggle function with independent behavior
    const togglePlaylistExpansion = (topicIdx: number, forceCloseOthers = true) => {
        setExpandedPlaylists(prev => {
            const newSet = new Set(prev);
            if (newSet.has(topicIdx)) {
                // If clicking an already expanded playlist, just collapse it
                newSet.delete(topicIdx);
            } else {
                if (forceCloseOthers) {
                    // Clear all other playlists and only expand this one (accordion behavior)
                    newSet.clear();
                }
                newSet.add(topicIdx);
            }
            return newSet;
        });
    };

    // First check real children, then fall back to demo profiles
    let child = data.find(c => c.id === childId);
    if (!child) {
        const demoProfile = DEMO_PROFILES.find(p => p.id === childId);
        if (demoProfile) {
            const colorMap: Record<string, string> = {
                '#9B6DD6': 'purple',
                '#2B8ED4': 'blue',
                '#4CAF8A': 'green',
                '#F5A623': 'amber',
                '#FF6B6B': 'rose'
            };
            const themeColorName = Object.entries(colorMap).find(([hex]) => hex === demoProfile.color)?.[1] || 'purple';
            child = {
                id: demoProfile.id,
                name: demoProfile.name,
                year: demoProfile.year,
                age: demoProfile.age,
                color: demoProfile.color,
                themeColor: themeColorName,
                emoji: demoProfile.emoji,
                avatar: demoProfile.emoji,
                image: demoProfile.image,
                interests: demoProfile.interests,
                dob: '',
                yearGroups: [{
                    id: 'demo-year',
                    name: demoProfile.year,
                    subjects: []
                }]
            };
        }
    }

    // Determine year group from child and load only relevant JSON
    const yearKeyMap: Record<string, string> = {
        'Year 1': 'Y1-2', 'Year 2': 'Y1-2',
        'Year 3': 'Y3-4', 'Year 4': 'Y3-4',
        'Year 5': 'Y5-6', 'Year 6': 'Y5-6',
        'Year 7': 'Y7-9', 'Year 8': 'Y7-9', 'Year 9': 'Y7-9',
        'Year 10': 'Y10-11', 'Year 11': 'Y10-11',
        'Year 12': 'Y12-13', 'Year 13': 'Y12-13',
    };
    const childYear = child?.yearGroups?.[0]?.name || '';
    const yearKey = yearKeyMap[childYear] || 'Y5-6';

    // Load subject cards for the child's year group
    useEffect(() => {
        loadSubjectCardsForYear(yearKey).then(() => setLoading(false));
    }, [yearKey]);

    // Load from JSON SubjectCards if URL provided - get ALL playlists for the subject
    const jsonSubjectData = useMemo(() => {
        if (!playlistUrl) return { lessons: [], topics: [], subjectName: '' };

        const decodedUrl = decodeURIComponent(playlistUrl);

        // Find the subject card that contains the playlist URL
        const yearKeys = ['Y5-6', 'Y7-9', 'Y1-2', 'Y3-4', 'Y10-11', 'Y12-13'];
        for (const yearKey of yearKeys) {
            const cards = getSubjectCardsForYear(yearKey);
            for (const card of cards) {
                // Find the playlist that matches the URL to identify the subject
                const matchingPlaylist = card.playlists.find(p => p.url === decodedUrl || decodeURIComponent(p.url) === decodedUrl);
                if (matchingPlaylist) {
                    // Get ALL playlists for this subject, not just the matching one
                    const allLessons: { id: string; title: string; videoUrl?: string; completed: boolean; subjectName: string; topicName: string; topicId: string }[] = [];
                    const allTopics: { id: string; name: string; lessonIds: string[] }[] = [];

                    for (const playlist of card.playlists) {
                        const topicId = playlist.url;
                        const topicLessons = playlist.videos.map(v => ({
                            id: v.id,
                            title: v.title,
                            videoUrl: v.url,
                            completed: false,
                            subjectName: card.subject,
                            topicName: playlist.title,
                            topicId: topicId
                        }));
                        allLessons.push(...topicLessons);
                        allTopics.push({ id: topicId, name: playlist.title, lessonIds: topicLessons.map(l => l.id) });
                    }

                    return { lessons: allLessons, topics: allTopics, subjectName: card.subject };
                }
            }
        }
        return { lessons: [], topics: [], subjectName: '' };
    }, [playlistUrl]);

    // Collect all lessons for the subject grouped by topic
    const subjectData = useMemo(() => {
        if (jsonSubjectData.lessons.length > 0) return jsonSubjectData;

        if (!child || !subjectIdParam) return { lessons: [], topics: [], subjectName: '' };
        const lessons: { id: string; title: string; videoUrl?: string; completed: boolean; subjectName: string; topicName: string; topicId: string }[] = [];
        const topics: { id: string; name: string; lessonIds: string[] }[] = [];

        for (const yearGroup of child.yearGroups || []) {
            for (const subject of yearGroup.subjects || []) {
                if (subject.id === subjectIdParam || subject.name.toLowerCase() === subjectIdParam.toLowerCase()) {
                    for (const topic of subject.topics || []) {
                        const topicLessonIds = topic.lessons?.map(l => l.id) || [];
                        topics.push({ id: topic.id, name: topic.name, lessonIds: topicLessonIds });
                        for (const topicLesson of topic.lessons || []) {
                            lessons.push({
                                ...topicLesson,
                                subjectName: subject.name,
                                topicName: topic.name,
                                topicId: topic.id
                            });
                        }
                    }
                }
            }
        }
        return { lessons, topics };
    }, [child, subjectIdParam, playlistUrl]);

    const allSubjectLessons = subjectData.lessons;
    const allTopics = subjectData.topics;

    // Find current lesson and topic
    const currentLessonIndex = allSubjectLessons.findIndex(l => l.id === lessonId);
    const currentTopicInfo = allTopics.find(t => t.lessonIds.includes(lessonId));
    const currentTopicIndex = allTopics.findIndex(t => t.id === currentTopicInfo?.id);
    
    // Get only the lessons for the current topic (for breadcrumb navigation)
    const currentTopicLessons = currentTopicInfo 
        ? allSubjectLessons.filter(l => l.topicId === currentTopicInfo.id)
        : [];
    const currentTopicLessonIndex = currentTopicLessons.findIndex(l => l.id === lessonId);

    // Auto-expand current playlist and handle navigation changes
    useEffect(() => {
        if (allTopics.length > 0 && currentTopicInfo) {
            const currentTopicIndex = allTopics.findIndex(t => t.id === currentTopicInfo.id);
            if (currentTopicIndex >= 0) {
                // Auto-expand the current topic and collapse others
                setExpandedPlaylists(new Set([currentTopicIndex]));
            }
        }
    }, [currentTopicInfo, allTopics]);

    // Check if all lessons in current topic are completed
    const isCurrentTopicComplete = useMemo(() => {
        if (!currentTopicInfo) return false;
        const topicLessons = allSubjectLessons.filter(l => l.topicId === currentTopicInfo.id);
        return topicLessons.length > 0 && topicLessons.every(l => l.completed);
    }, [allSubjectLessons, currentTopicInfo]);

    // Auto-advance to next video when current video is unavailable
    const handleSkipToNext = () => {
        if (currentLessonIndex < allSubjectLessons.length - 1) {
            const nextLesson = allSubjectLessons[currentLessonIndex + 1];
            navigate(toLessonView({
                childId,
                lessonId: nextLesson.id,
                subjectId: subjectIdParam,
                topic: topicIdParam,
                url: playlistUrl
            }));
        } else {
            navigate(toKidDash(childId));
        }
    };

    // Auto-expand current playlist and handle navigation changes
    useEffect(() => {
        if (allTopics.length > 0 && currentTopicInfo) {
            const currentTopicIndex = allTopics.findIndex(t => t.id === currentTopicInfo.id);
            if (currentTopicIndex >= 0) {
                setExpandedPlaylists(prev => {
                    const newSet = new Set(prev);
                    newSet.clear();
                    newSet.add(currentTopicIndex);
                    return newSet;
                });
            }
        }
    }, [currentTopicInfo, allTopics]);

    // Find current lesson (needed for videoId)
    let lesson: { id: string; title: string; videoUrl?: string; completed: boolean } | undefined;
    let subjectName = '';
    let topicName = '';

    // Use the real lessons from the subject if available
    if (allSubjectLessons.length > 0) {
        const currentLesson = allSubjectLessons[currentLessonIndex];
        if (currentLesson) {
            lesson = currentLesson;
            subjectName = currentLesson.subjectName;
            topicName = currentLesson.topicName;
        }
    } else {
        // Fallback to searching through all data
        for (const yearGroup of child?.yearGroups || []) {
            for (const subject of yearGroup.subjects || []) {
                for (const topic of subject.topics || []) {
                    const found = topic.lessons?.find(l => l.id === lessonId);
                    if (found) {
                        lesson = found;
                        subjectName = subject.name;
                        topicName = topic.name;
                        break;
                    }
                }
                if (lesson) break;
            }
            if (lesson) break;
        }
    }

    const videoId = lesson?.videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/)?.[1];

    // Check if video is available and handle auto-advance
    useEffect(() => {
        if (!videoId) {
            setVideoUnavailable(true);
            // Auto-advance to next video after 3 seconds
            const timer = setTimeout(() => {
                if (currentLessonIndex < allSubjectLessons.length - 1) {
                    const nextLesson = allSubjectLessons[currentLessonIndex + 1];
                    navigate(toLessonView({
                        childId,
                        lessonId: nextLesson.id,
                        subjectId: subjectIdParam,
                        topic: topicIdParam,
                        url: playlistUrl
                    }));
                } else {
                    // Last video, go back to dashboard
                    navigate(toKidDash(childId));
                }
            }, 3000);
            
            setAutoAdvanceTimer(timer);
        } else {
            setVideoUnavailable(false);
            if (autoAdvanceTimer) {
                clearTimeout(autoAdvanceTimer);
                setAutoAdvanceTimer(null);
            }
        }
        
        return () => {
            if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
        };
    }, [videoId, currentLessonIndex, subjectData.lessons.length > 0 ? subjectData.lessons[0]?.id : '', childId, subjectIdParam, topicIdParam, playlistUrl, navigate]);

    const handleRetryVideo = () => {
        // Force reload the current video
        window.location.reload();
    };

    if (!child) {
        return (
            <div style={{
                minHeight: "100vh",
                background: DS.cream,
                position: "relative",
                overflow: "hidden"
            }}>
                <GlobalStyles />
                <Texture />
                <h1 style={{ position: "relative", zIndex: 10, padding: 40 }}>Child not found: {childId}</h1>
            </div>
        );
    }

    const themeColor = child.themeColor === 'purple' ? '#9B6DD6' : child.themeColor === 'blue' ? '#2B8ED4' : '#4CAF50';

    if (!lesson) {
        return (
            <div style={{
                minHeight: "100vh",
                background: DS.cream,
                position: "relative",
                overflow: "hidden"
            }}>
                <GlobalStyles />
                <Texture />
                <div style={{ position: "relative", zIndex: 10, textAlign: 'center', padding: 40 }}>
                    <h1>Lesson not found: {lessonId}</h1>
                    <button
                        onClick={() => navigate(toKidDash(childId))}
                        style={{ marginTop: 16, color: themeColor, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: DS.cream,
            position: "relative",
            overflow: "hidden"
        }}>
            <GlobalStyles />
            <Texture />
            <Blobs color={themeColor} />

            {/* Header - Full Width */}
            <div style={{
                position: "relative",
                zIndex: 10,
                background: `${DS.card}F5`,
                backdropFilter: "blur(14px)",
                borderBottom: DS.border,
                padding: "8px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
                height: 67
            }}>
                <div
                    style={{ position: "relative", borderRadius: DS.radius.pill, transition: "transform 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translate(0,0)"; }}
                >
                    <Shadow offset={1} size={1} radius={DS.radius.pill}>
                        <button
                            className="b"
                            onClick={() => navigate(toKidDash(childId))}
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: themeColor,
                                border: DS.border,
                                borderRadius: DS.radius.pill,
                                padding: "6px 14px",
                                cursor: "pointer",
                                fontWeight: 800,
                                fontSize: 13,
                                color: "#fff"
                            }}
                        >
                            ← Dashboard
                        </button>
                    </Shadow>
                </div>
                <div style={{ flex: 1 }}>
                    <div className="n t-label" style={{ color: themeColor, fontSize: 9 }}>{subjectName} · {topicName}</div>
                    <div className="b t-h2" style={{ color: DS.ink, fontSize: 18 }}>{lesson.title}</div>
                </div>

                {/* Timer */}
                <Shadow offset={2} size={2} radius={DS.radius.md}>
                    <div style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: remainingTime <= 0 ? "#dc2626" : themeColor,
                        border: DS.border,
                        borderRadius: DS.radius.md,
                        padding: "6px 12px"
                    }}>
                        <div>
                            <div className="b" style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                                {formatTime(elapsedSeconds)}
                            </div>
                            <div className="n t-label" style={{ color: "rgba(255,255,255,0.65)", fontSize: 8 }}>
                                {remainingTime <= 0 ? "limit reached" : "elapsed"}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                            <button 
                                onClick={toggleTimer}
                                disabled={remainingTime <= 0}
                                style={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: 6, 
                                    border: "2px solid rgba(255,255,255,0.5)", 
                                    background: remainingTime <= 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)", 
                                    color: remainingTime <= 0 ? "rgba(255,255,255,0.5)" : "#fff", 
                                    cursor: remainingTime <= 0 ? "not-allowed" : "pointer", 
                                    fontSize: 10 
                                }}
                            >
                                {isTimerRunning ? "⏸" : "▶"}
                            </button>
                            <button 
                                onClick={addTenMinutes}
                                disabled={remainingTime < 600}
                                style={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: 6, 
                                    border: "2px solid rgba(255,255,255,0.5)", 
                                    background: remainingTime < 600 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)", 
                                    color: remainingTime < 600 ? "rgba(255,255,255,0.5)" : "#fff", 
                                    cursor: remainingTime < 600 ? "not-allowed" : "pointer", 
                                    fontSize: 7, 
                                    fontWeight: 900 
                                }}
                            >
                                +10
                            </button>
                        </div>
                    </div>
                </Shadow>

                {/* Info Button */}
                <div
                    style={{ position: "relative", borderRadius: DS.radius.sm, transition: "transform 0.15s", flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translate(0,0)"; }}
                >
                    <Shadow offset={2} size={2} radius={DS.radius.sm}>
                        <button
                            style={{
                                position: "relative",
                                width: 32,
                                height: 32,
                                borderRadius: DS.radius.sm,
                                border: DS.border,
                                background: themeColor,
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 800
                            }}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? "✕" : "ℹ"}
                        </button>
                    </Shadow>
                </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div style={{ position: "relative", zIndex: 10, display: "flex", height: "calc(100vh - 60px)" }}>
                {/* Content */}
                <div style={{ flex: 1, padding: "24px", overflow: "auto" }}>
                    {/* Video Player */}
                    <div className="pop" style={{ maxWidth: 900, margin: "0 auto" }}>
                        <div style={{
                            position: "relative",
                            background: "#0F0D2A",
                            border: DS.border,
                            borderRadius: DS.radius.lg,
                            aspectRatio: "16 / 9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0
                        }}>
                            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${themeColor}28, transparent)` }}></div>

                            {videoId ? (
                                <iframe
                                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                    title={lesson.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div style={{ textAlign: "center", zIndex: 1, padding: 20 }}>
                                    <div style={{ fontSize: 40, marginBottom: 10 }}>🚫</div>
                                    <div className="n t-body" style={{ color: "#fff", opacity: 0.9, fontWeight: 700 }}>Video Not Available</div>
                                    <div className="n t-label" style={{ color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                                        This video may have been removed or made private
                                    </div>
                                    <div className="n t-small" style={{ color: "rgba(255,255,255,0.4)", marginTop: 12 }}>
                                        Auto-advancing to next video in 3 seconds...
                                    </div>
                                    <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
                                        <button
                                            onClick={handleSkipToNext}
                                            style={{
                                                padding: "8px 16px",
                                                background: themeColor,
                                                border: "none",
                                                borderRadius: 6,
                                                color: "#fff",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                        >
                                            Skip to Next →
                                        </button>
                                        <button
                                            onClick={handleRetryVideo}
                                            style={{
                                                padding: "8px 16px",
                                                background: "rgba(255,255,255,0.2)",
                                                border: "1px solid rgba(255,255,255,0.3)",
                                                borderRadius: 6,
                                                color: "#fff",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Progress bar */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "rgba(255,255,255,0.15)" }}>
                                <div style={{ width: "42%", height: "100%", background: themeColor }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Playlist Selector - show all playlists below video */}
                    {allTopics.length > 1 && (
                        <div className="pop" style={{ maxWidth: 900, margin: "20px auto 0" }}>
                            <div className="n t-label" style={{ color: DS.inkFade, marginBottom: 12, fontSize: 10 }}>PLAYLISTS IN THIS SUBJECT</div>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                {allTopics.map((topic, idx) => {
                                    const topicLessons = allSubjectLessons.filter(l => l.topicId === topic.id);
                                    const isCurrentTopic = currentTopicInfo?.id === topic.id;
                                    const completedCount = topicLessons.filter(l => l.completed).length;
                                    return (
                                        <button
                                            key={topic.id}
                                            onClick={() => {
                                                const firstLesson = topicLessons[0];
                                                if (firstLesson) {
                                                    navigate(toLessonView({
                                                        childId,
                                                        lessonId: firstLesson.id,
                                                        subjectId: subjectName || subjectIdParam,
                                                        topic: topic.id,
                                                        url: topic.id // Important: preserve URL for importer data
                                                    }));
                                                }
                                            }}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "10px 16px",
                                                borderRadius: DS.radius.md,
                                                border: isCurrentTopic ? `2px solid ${themeColor}` : `2px solid #E8E4DC`,
                                                background: isCurrentTopic ? `${themeColor}15` : DS.card,
                                                cursor: "pointer",
                                                transition: "all 0.15s",
                                            }}
                                        >
                                            <div style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 6,
                                                background: isCurrentTopic ? themeColor : DS.inkFade,
                                                color: "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 12,
                                                fontWeight: 800,
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div style={{ textAlign: "left" }}>
                                                <div className="n" style={{ fontSize: 12, fontWeight: 700, color: DS.ink }}>{topic.name}</div>
                                                <div className="n t-small" style={{ color: DS.inkFade }}>
                                                    {completedCount > 0 && <span style={{ color: themeColor }}>{completedCount}/</span>}
                                                    {topicLessons.length} videos
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Smart Breadcrumb Navigation - always show when there are multiple videos in current topic */}
                    {currentTopicLessons.length > 1 && (
                        <div style={{ maxWidth: 900, margin: "16px auto", display: "flex", justifyContent: "space-between", gap: 12 }}>
                            {currentTopicLessons.length <= 10 ? (
                                // For 10 or fewer videos: show Prev/Next buttons + dots
                                <>
                                    <Shadow offset={1} size={1} radius={DS.radius.md}>
                                        <button
                                            onClick={() => {
                                                if (currentTopicLessonIndex > 0) {
                                                    const prevLesson = currentTopicLessons[currentTopicLessonIndex - 1];
                                                    navigate(toLessonView({
                                                        childId,
                                                        lessonId: prevLesson.id,
                                                        subjectId: subjectIdParam,
                                                        topic: topicIdParam,
                                                    }));
                                                }
                                            }}
                                            disabled={currentTopicLessonIndex <= 0}
                                            style={{
                                                position: "relative",
                                                padding: "10px 20px",
                                                borderRadius: DS.radius.md,
                                                border: "2.5px solid #C4BBAF",
                                                background: currentTopicLessonIndex <= 0 ? "#EDE8E0" : DS.card,
                                                color: currentTopicLessonIndex <= 0 ? DS.inkFade : DS.ink,
                                                fontSize: 14,
                                                fontWeight: 800,
                                                cursor: currentTopicLessonIndex <= 0 ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8
                                            }}
                                        >
                                            ← Previous
                                        </button>
                                    </Shadow>

                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {currentTopicLessons.map((_, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    const l = currentTopicLessons[idx];
                                                    navigate(toLessonView({
                                                        childId,
                                                        lessonId: l.id,
                                                        subjectId: subjectIdParam,
                                                        topic: topicIdParam,
                                                    }));
                                                }}
                                                style={{
                                                    width: idx === currentTopicLessonIndex ? 24 : 12,
                                                    height: 12,
                                                    borderRadius: 6,
                                                    background: idx === currentTopicLessonIndex ? themeColor : idx < currentTopicLessonIndex ? `${themeColor}60` : "#EDE8E0",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s"
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <Shadow offset={1} size={1} radius={DS.radius.md}>
                                        <button
                                            onClick={() => {
                                                if (currentTopicLessonIndex < currentTopicLessons.length - 1) {
                                                    const nextLesson = currentTopicLessons[currentTopicLessonIndex + 1];
                                                    navigate(toLessonView({
                                                        childId,
                                                        lessonId: nextLesson.id,
                                                        subjectId: subjectIdParam,
                                                        topic: topicIdParam,
                                                        url: playlistUrl
                                                    }));
                                                }
                                            }}
                                            disabled={currentTopicLessonIndex >= currentTopicLessons.length - 1}
                                            style={{
                                                position: "relative",
                                                padding: "10px 20px",
                                                borderRadius: DS.radius.md,
                                                border: "2.5px solid #C4BBAF",
                                                background: currentTopicLessonIndex >= currentTopicLessons.length - 1 ? "#EDE8E0" : DS.card,
                                                color: currentTopicLessonIndex >= currentTopicLessons.length - 1 ? DS.inkFade : DS.ink,
                                                fontSize: 14,
                                                fontWeight: 800,
                                                cursor: currentTopicLessonIndex >= currentTopicLessons.length - 1 ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8
                                            }}
                                        >
                                            Next →
                                        </button>
                                    </Shadow>
                                </>
                            ) : (
                                // For 11+ videos: show only pagination controls (no main Prev/Next buttons)
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}>
                                    <Shadow offset={1} size={1} radius={DS.radius.md}>
                                        <button
                                            onClick={() => {
                                                const currentPage = Math.floor(currentTopicLessonIndex / 10);
                                                
                                                if (currentPage > 0) {
                                                    const targetIndex = (currentPage - 1) * 10;
                                                    const l = currentTopicLessons[targetIndex];
                                                    if (l) {
                                                        navigate(toLessonView({
                                                            childId,
                                                            lessonId: l.id,
                                                            subjectId: subjectIdParam,
                                                            topic: topicIdParam,
                                                        }));
                                                    } else {
                                                        console.error('No lesson found for Prev at index:', targetIndex);
                                                    }
                                                }
                                            }}
                                            disabled={currentTopicLessonIndex < 10}
                                            style={{
                                                position: "relative",
                                                padding: "8px 16px",
                                                borderRadius: DS.radius.md,
                                                border: "2.5px solid #C4BBAF",
                                                background: currentTopicLessonIndex < 10 ? "#EDE8E0" : DS.card,
                                                color: currentTopicLessonIndex < 10 ? DS.inkFade : DS.ink,
                                                fontSize: 13,
                                                fontWeight: 800,
                                                cursor: currentTopicLessonIndex < 10 ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6
                                            }}
                                        >
                                            ← Prev
                                        </button>
                                    </Shadow>
                                    
                                    {/* Smart sliding window pagination */}
                                    {(() => {
                                        const totalPages = Math.ceil(currentTopicLessons.length / 10);
                                        const currentPage = Math.floor(currentTopicLessonIndex / 10);
                                        
                                        // Adjust max visible buttons based on sidebar state
                                        const maxVisible = sidebarOpen ? 5 : 7;
                                        
                                        // For very large playlists, use sliding window
                                        if (totalPages > maxVisible + 2) {
                                            let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
                                            let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
                                            
                                            // Adjust to always show maxVisible pages
                                            if (endPage - startPage < maxVisible - 1) {
                                                startPage = Math.max(0, endPage - maxVisible + 1);
                                            }
                                            
                                            const pages = [];
                                            
                                            // Always show first page
                                            if (startPage > 0) {
                                                pages.push(0);
                                                if (startPage > 1) {
                                                    pages.push("ellipsis-start");
                                                }
                                            }
                                            
                                            // Show sliding window
                                            for (let i = startPage; i <= endPage; i++) {
                                                pages.push(i);
                                            }
                                            
                                            // Always show last page
                                            if (endPage < totalPages - 1) {
                                                if (endPage < totalPages - 2) {
                                                    pages.push("ellipsis-end");
                                                }
                                                pages.push(totalPages - 1);
                                            }
                                            
                                            return pages.map((page, idx) => {
                                                if (page === "ellipsis-start" || page === "ellipsis-end") {
                                                    return (
                                                        <div key={idx} style={{
                                                            padding: "8px 8px",
                                                            color: DS.inkFade,
                                                            fontSize: 14,
                                                            fontWeight: 800,
                                                            display: "flex",
                                                            alignItems: "center"
                                                        }}>
                                                            ...
                                                        </div>
                                                    );
                                                }
                                                
                                                const startIdx = page * 10;
                                                const endIdx = Math.min(startIdx + 9, currentTopicLessons.length - 1);
                                                const isCurrentPage = currentTopicLessonIndex >= startIdx && currentTopicLessonIndex <= endIdx;
                                                
                                                return (
                                                    <Shadow key={page} offset={1} size={1} radius={DS.radius.md}>
                                                        <button
                                                            onClick={() => {
                                                                const targetLesson = currentTopicLessons[startIdx];
                                                                if (targetLesson) {
                                                                    navigate(toLessonView({
                                                                        childId,
                                                                        lessonId: targetLesson.id,
                                                                        subjectId: subjectIdParam,
                                                                        topic: topicIdParam,
                                                                        url: playlistUrl
                                                                    }));
                                                                } else {
                                                                    console.error('No lesson found at index:', startIdx, 'array length:', currentTopicLessons.length);
                                                                }
                                                            }}
                                                            style={{
                                                                position: "relative",
                                                                padding: sidebarOpen ? "6px 12px" : "8px 16px",
                                                                borderRadius: DS.radius.md,
                                                                border: isCurrentPage ? `2.5px solid ${themeColor}` : "2.5px solid #C4BBAF",
                                                                background: isCurrentPage ? `${themeColor}15` : DS.card,
                                                                color: isCurrentPage ? themeColor : DS.ink,
                                                                fontSize: sidebarOpen ? 12 : 13,
                                                                fontWeight: 800,
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 2
                                                            }}
                                                        >
                                                            {currentTopicLessons.length > 20 
                                                                ? `${startIdx + 1}-${endIdx + 1}`
                                                                : `${startIdx + 1}-${endIdx + 1}`
                                                            }
                                                        </button>
                                                    </Shadow>
                                                );
                                            });
                                        } else {
                                            // For smaller playlists, show all pages with responsive sizing
                                            return Array.from({ length: totalPages }, (_, pageIdx) => {
                                                const startIdx = pageIdx * 10;
                                                const endIdx = Math.min(startIdx + 9, currentTopicLessons.length - 1);
                                                const isCurrentPage = currentTopicLessonIndex >= startIdx && currentTopicLessonIndex <= endIdx;
                                                
                                                return (
                                                    <Shadow key={pageIdx} offset={1} size={1} radius={DS.radius.md}>
                                                        <button
                                                            onClick={() => {
                                                                const targetLesson = currentTopicLessons[startIdx];
                                                                if (targetLesson) {
                                                                    navigate(toLessonView({
                                                                        childId,
                                                                        lessonId: targetLesson.id,
                                                                        subjectId: subjectIdParam,
                                                                        topic: topicIdParam,
                                                                        url: playlistUrl
                                                                    }));
                                                                } else {
                                                                    console.error('No lesson found at index (small):', startIdx, 'array length:', currentTopicLessons.length);
                                                                }
                                                            }}
                                                            style={{
                                                                position: "relative",
                                                                padding: sidebarOpen ? "6px 12px" : "8px 16px",
                                                                borderRadius: DS.radius.md,
                                                                border: isCurrentPage ? `2.5px solid ${themeColor}` : "2.5px solid #C4BBAF",
                                                                background: isCurrentPage ? `${themeColor}15` : DS.card,
                                                                color: isCurrentPage ? themeColor : DS.ink,
                                                                fontSize: sidebarOpen ? 12 : 13,
                                                                fontWeight: 800,
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 2
                                                            }}
                                                        >
                                                            {currentTopicLessons.length > 20 
                                                                ? `${startIdx + 1}-${endIdx + 1}`
                                                                : `${startIdx + 1}-${endIdx + 1}`
                                                            }
                                                        </button>
                                                    </Shadow>
                                                );
                                            });
                                        }
                                    })()}
                                    
                                    <Shadow offset={1} size={1} radius={DS.radius.md}>
                                        <button
                                            onClick={() => {
                                                const currentPage = Math.floor(currentTopicLessonIndex / 10);
                                                const maxPage = Math.floor((currentTopicLessons.length - 1) / 10);
                                                
                                                if (currentPage < maxPage) {
                                                    const targetIndex = (currentPage + 1) * 10;
                                                    const l = currentTopicLessons[Math.min(targetIndex, currentTopicLessons.length - 1)];
                                                    if (l) {
                                                        navigate(toLessonView({
                                                            childId,
                                                            lessonId: l.id,
                                                            subjectId: subjectIdParam,
                                                            topic: topicIdParam,
                                                        }));
                                                    } else {
                                                        console.error('No lesson found for Next at index:', targetIndex);
                                                    }
                                                }
                                            }}
                                            disabled={currentTopicLessonIndex >= Math.floor((currentTopicLessons.length - 1) / 10) * 10}
                                            style={{
                                                position: "relative",
                                                padding: "8px 16px",
                                                borderRadius: DS.radius.md,
                                                border: "2.5px solid #C4BBAF",
                                                background: currentTopicLessonIndex >= Math.floor((currentTopicLessons.length - 1) / 10) * 10 ? "#EDE8E0" : DS.card,
                                                color: currentTopicLessonIndex >= Math.floor((currentTopicLessons.length - 1) / 10) * 10 ? DS.inkFade : DS.ink,
                                                fontSize: 13,
                                                fontWeight: 800,
                                                cursor: currentTopicLessonIndex >= Math.floor((currentTopicLessons.length - 1) / 10) * 10 ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6
                                            }}
                                        >
                                            Next →
                                        </button>
                                    </Shadow>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{
                    position: "relative",
                    width: sidebarOpen ? 285 : 0,
                    overflow: "hidden",
                    transition: "width .3s ease",
                    flexShrink: 0
                }}>
                    {sidebarOpen && (
                        <div style={{
                            width: 285,
                            height: "100%",
                            background: DS.card,
                            borderLeft: DS.border,
                            padding: 20,
                            overflow: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 18
                        }}>
                            {/* Playlist - grouped by topic/playlist */}
                            <div>
                                <div className="n t-label" style={{ color: themeColor, marginBottom: 10, fontSize: 10 }}>
                                    {allTopics.length > 1 ? "ALL PLAYLISTS" : "PLAYLIST"}
                                </div>
                                {allTopics.map((topic, topicIdx) => {
                                    const topicLessons = allSubjectLessons.filter(l => l.topicId === topic.id);
                                    const isCurrentTopic = currentTopicInfo?.id === topic.id;
                                    return (
                                        <div key={topic.id} style={{ marginBottom: 16 }}>
                                            {/* Playlist header */}
                                            <button
                                                onClick={() => togglePlaylistExpansion(topicIdx)}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    padding: "8px 12px",
                                                    backgroundColor: "white",
                                                    border: DS.border,
                                                    borderRadius: DS.radius.md,
                                                    cursor: "pointer",
                                                    transition: "all 0.15s ease",
                                                    width: "100%"
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                                            >
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 10,
                                                    fontWeight: 800,
                                                    flexShrink: 0
                                                }}>
                                                    {topicIdx + 1}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div className="n" style={{ fontSize: 11, fontWeight: 700, color: DS.ink }}>
                                                        {topic.name}
                                                    </div>
                                                    <div className="n t-label" style={{ color: DS.inkFade, fontSize: 9 }}>
                                                        {topicLessons.length} videos
                                                    </div>
                                                </div>
                                                <span style={{ color: themeColor, fontSize: 14, transition: "transform 0.2s ease" }}>
                                                    {expandedPlaylists.has(topicIdx) ? '▲' : '▼'}
                                                </span>
                                            </button>

                                            {/* Videos in this playlist */}
                                            {expandedPlaylists.has(topicIdx) && (
                                                <div style={{ paddingLeft: 12 }}>
                                                {topicLessons.map((item, i) => {
                                                    const isActive = item.id === lessonId;
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => {
                                                                navigate(toLessonView({
                                                                    childId,
                                                                    lessonId: item.id,
                                                                    subjectId: subjectName || subjectIdParam,
                                                                    topic: topic.id,
                                                                    url: topic.id
                                                                }));
                                                            }}
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                                padding: "6px 8px",
                                                                borderRadius: DS.radius.sm,
                                                                marginBottom: 2,
                                                                background: isActive ? `${themeColor}10` : "transparent",
                                                                cursor: "pointer",
                                                                transition: "background 0.15s"
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: 16,
                                                                height: 16,
                                                                borderRadius: 4,
                                                                flexShrink: 0,
                                                                background: item.completed ? "#E8F8F0" : isActive ? `${themeColor}20` : "#F8F5F0",
                                                                border: `1.5px solid ${item.completed ? "#4CAF8A" : isActive ? themeColor : "#C4BBAF"}`,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: 8
                                                            }}>
                                                                {item.completed ? (
                                                                    <span style={{ color: "#4CAF8A", fontWeight: 900 }}>✓</span>
                                                                ) : isActive ? (
                                                                    <span style={{ color: themeColor }}>▶</span>
                                                                ) : null}
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div
                                                                    className="n t-small"
                                                                    style={{
                                                                        fontWeight: isActive ? 700 : 500,
                                                                        color: item.completed ? DS.inkFade : DS.ink,
                                                                        textDecoration: item.completed ? "line-through" : "none",
                                                                        whiteSpace: "nowrap",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis"
                                                                    }}
                                                                >
                                                                    {item.title}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonView;
