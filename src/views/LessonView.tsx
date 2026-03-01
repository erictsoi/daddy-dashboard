import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDummyChild } from '../data/dummyData';
import { ChildProfile } from '../types';
import { DS } from '../components/design-system';

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
        html, body { font-family: 'Nunito Sans', sans-serif; background: #FAF6F0; color: #1A1A2E; }
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

const BendayShadow = ({ offset = 2 }: { offset?: number }) => (
    <div style={{ position: "absolute", top: offset, left: offset, right: -offset, bottom: -offset, zIndex: -1, pointerEvents: "none", backgroundImage: `radial-gradient(circle, ${DS.dotBrown} 3px, transparent 3px)`, backgroundSize: "6.6px 6.6px", borderRadius: "inherit", opacity: 0.35 }} />
);

const Shadow: React.FC<{ children: React.ReactNode; offset?: number; size?: number; radius?: number; style?: React.CSSProperties }> = ({ children, offset = 3, radius, style = {} }) => (
    <div style={{ position: "relative", borderRadius: radius, ...style }}>
        <BendayShadow offset={offset} />
        {children}
    </div>
);

const Texture = () => (
    <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `radial-gradient(circle, #1A1A2E08 1px, transparent 1px)`,
        backgroundSize: "20px 20px"
    }} />
);

const Blobs = ({ color }: { color: string }) => (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-12%", right: "-4%", width: 380, height: 380, borderRadius: "50%", background: color, opacity: .06, filter: "blur(64px)" }} />
        <div style={{ position: "absolute", bottom: "-5%", left: "-8%", width: 300, height: 300, borderRadius: "50%", background: color, opacity: .04, filter: "blur(52px)" }} />
    </div>
);

export const LessonView: React.FC<LessonViewProps> = ({ childId, lessonId, data = [], subjectId, topicId }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    // Get subject and topic from params if not passed as props
    const subjectIdParam = subjectId || searchParams.get('subject') || '';
    const topicIdParam = topicId || searchParams.get('topic') || '';
    
    const child = data.find(c => c.id === childId) || getDummyChild(childId) || getDummyChild(`demo-${childId}`);

    // Collect all lessons for the subject grouped by topic
    const subjectData = useMemo(() => {
        if (!child || !subjectIdParam) return { lessons: [], topics: [] };
        const lessons: { id: string; title: string; videoUrl?: string; completed: boolean; subjectName: string; topicName: string; topicId: string }[] = [];
        const topics: { id: string; name: string; lessonIds: string[] }[] = [];
        
        for (const yearGroup of child.yearGroups || []) {
            for (const subject of yearGroup.subjects || []) {
                if (subject.id === subjectIdParam || subject.name.toLowerCase() === subjectIdParam.toLowerCase()) {
                    for (const topic of subject.topics || []) {
                        const topicLessonIds = topic.lessons?.map(l => l.id) || [];
                        topics.push({ id: topic.id, name: topic.name, lessonIds: topicLessonIds });
                        for (const lesson of topic.lessons || []) {
                            lessons.push({
                                ...lesson,
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
    }, [child, subjectIdParam]);
    
    const allSubjectLessons = subjectData.lessons;
    const allTopics = subjectData.topics;
    
    // Find current lesson and topic
    const currentLessonIndex = allSubjectLessons.findIndex(l => l.id === lessonId);
    const currentTopicInfo = allTopics.find(t => t.lessonIds.includes(lessonId));
    const currentTopicIndex = allTopics.findIndex(t => t.id === currentTopicInfo?.id);
    
    // Check if all lessons in current topic are completed
    const isCurrentTopicComplete = useMemo(() => {
        if (!currentTopicInfo) return false;
        const topicLessons = allSubjectLessons.filter(l => l.topicId === currentTopicInfo.id);
        return topicLessons.length > 0 && topicLessons.every(l => l.completed);
    }, [allSubjectLessons, currentTopicInfo]);
    
    // Auto-advance to next topic when current topic is complete
    useMemo(() => {
        if (isCurrentTopicComplete && currentTopicIndex < allTopics.length - 1) {
            const nextTopic = allTopics[currentTopicIndex + 1];
            const nextTopicFirstLesson = allSubjectLessons.find(l => l.topicId === nextTopic.id);
            if (nextTopicFirstLesson) {
                navigate(`/lessonview?child=${childId}&lesson=${nextTopicFirstLesson.id}&subject=${subjectIdParam}&topic=${nextTopic.id}`);
            }
        }
    }, [isCurrentTopicComplete]);
    
    const playlist = allSubjectLessons.length > 0 ? allSubjectLessons : [
        { title: "What is an Ecosystem?", duration: "7:20", completed: true, active: false },
        { title: "Producers, Consumers & Decomposers", duration: "9:15", completed: true, active: false },
        { title: "Food Chains Explained", duration: "11:40", completed: false, active: true },
        { title: "Food Webs & Energy Flow", duration: "8:30", completed: false, active: false },
        { title: "Ecosystems Under Threat", duration: "12:10", completed: false, active: false },
    ];

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
        for (const yearGroup of child.yearGroups || []) {
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
                    <a href={`/kiddash?child=${childId}`} style={{ color: themeColor, fontWeight: 700 }}></a>
                    ← Back to Dashboard </div>
            </div>
        );
    }

    const videoId = lesson.videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/)?.[1];

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
                            onClick={() => navigate(`/kiddash?child=${childId}`)}
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
                        background: themeColor,
                        border: DS.border,
                        borderRadius: DS.radius.md,
                        padding: "6px 12px"
                    }}>
                        <div>
                            <div className="b" style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>18:15</div>
                            <div className="n t-label" style={{ color: "rgba(255,255,255,0.65)", fontSize: 8 }}>elapsed</div>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                            <button style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", fontSize: 10 }}>⏸</button>
                            <button style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", fontSize: 7, fontWeight: 900 }}>+10</button>
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
                                <div style={{ textAlign: "center", zIndex: 1 }}>
                                    <div style={{ fontSize: 50, marginBottom: 10 }}>▶</div>
                                    <div className="n t-body" style={{ color: "#fff", opacity: 0.8 }}>YouTube Video Player</div>
                                    <div className="n t-label" style={{ color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{lesson.title} · 11:40</div>
                                </div>
                            )}

                            {/* Progress bar */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "rgba(255,255,255,0.15)" }}>
                                <div style={{ width: "42%", height: "100%", background: themeColor }}></div>
                            </div>

                            {/* Simulate video end button */}
                            <button
                                style={{
                                    position: "absolute",
                                    bottom: 14,
                                    right: 14,
                                    background: "rgba(255,255,255,0.15)",
                                    border: "2px solid rgba(255,255,255,0.35)",
                                    color: "#fff",
                                    padding: "6px 16px",
                                    borderRadius: 100,
                                    fontSize: 11,
                                    cursor: "pointer",
                                    fontWeight: 800,
                                    backdropFilter: "blur(6px)"
                                }}
                            >
                                Simulate video end ▸
                            </button>
                        </div>
                    </div>

                    {/* Next/Previous Navigation */}
                    {allSubjectLessons.length > 1 && (
                        <div style={{ maxWidth: 900, margin: "16px auto", display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <Shadow offset={1} size={1} radius={DS.radius.md}>
                                <button
                                    onClick={() => {
                                        if (currentLessonIndex > 0) {
                                            const prevLesson = allSubjectLessons[currentLessonIndex - 1];
                                            navigate(`/lessonview?child=${childId}&lesson=${prevLesson.id}&subject=${subjectIdParam}&topic=${topicIdParam}`);
                                        }
                                    }}
                                    disabled={currentLessonIndex <= 0}
                                    style={{
                                        position: "relative",
                                        padding: "10px 20px",
                                        borderRadius: DS.radius.md,
                                        border: "2.5px solid #C4BBAF",
                                        background: currentLessonIndex <= 0 ? "#EDE8E0" : DS.card,
                                        color: currentLessonIndex <= 0 ? DS.inkFade : DS.ink,
                                        fontSize: 14,
                                        fontWeight: 800,
                                        cursor: currentLessonIndex <= 0 ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8
                                    }}
                                >
                                    ← Previous
                                </button>
                            </Shadow>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {allSubjectLessons.map((_, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            const l = allSubjectLessons[idx];
                                            navigate(`/lessonview?child=${childId}&lesson=${l.id}&subject=${subjectIdParam}&topic=${topicIdParam}`);
                                        }}
                                        style={{
                                            width: idx === currentLessonIndex ? 20 : 8,
                                            height: 8,
                                            borderRadius: 4,
                                            background: idx === currentLessonIndex ? themeColor : idx < currentLessonIndex ? `${themeColor}60` : "#EDE8E0",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                    />
                                ))}
                            </div>

                            <Shadow offset={1} size={1} radius={DS.radius.md}>
                                <button
                                    onClick={() => {
                                        if (currentLessonIndex < allSubjectLessons.length - 1) {
                                            const nextLesson = allSubjectLessons[currentLessonIndex + 1];
                                            navigate(`/lessonview?child=${childId}&lesson=${nextLesson.id}&subject=${subjectIdParam}&topic=${topicIdParam}`);
                                        }
                                    }}
                                    disabled={currentLessonIndex >= allSubjectLessons.length - 1}
                                    style={{
                                        position: "relative",
                                        padding: "10px 20px",
                                        borderRadius: DS.radius.md,
                                        border: "2.5px solid #C4BBAF",
                                        background: currentLessonIndex >= allSubjectLessons.length - 1 ? "#EDE8E0" : DS.card,
                                        color: currentLessonIndex >= allSubjectLessons.length - 1 ? DS.inkFade : DS.ink,
                                        fontSize: 14,
                                        fontWeight: 800,
                                        cursor: currentLessonIndex >= allSubjectLessons.length - 1 ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8
                                    }}
                                >
                                    Next →
                                </button>
                            </Shadow>
                        </div>
                    )}

                    {/* Complete Button */}
                    <div style={{ maxWidth: 900, margin: "16px 0 0" }}>
                        <div style={{ width: "fit-content" }}>
                            <Shadow offset={1} size={1} radius={DS.radius.pill}>
                                <button
                                    disabled
                                    className="b"
                                    style={{
                                        position: "relative",
                                        padding: "14px 40px",
                                        borderRadius: DS.radius.pill,
                                        border: "2.5px solid #C4BBAF",
                                        background: "#EDE8E0",
                                        color: DS.inkFade,
                                        fontSize: 18,
                                        fontWeight: 800,
                                        cursor: "not-allowed",
                                        transition: "transform 0.2s"
                                    }}
                                >
                                    Finish the video first 👀
                                </button>
                            </Shadow>
                            <p className="n t-small" style={{ color: themeColor, marginTop: 6, fontWeight: 700 }}>
                                Button unlocks when the video ends
                            </p>
                        </div>
                    </div>

                </div>

                {/* Collapsible Sidebar */}

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
                            {/* About */}
                            <div>
                                <div className="n t-label" style={{ color: themeColor, marginBottom: 7 }}>About this lesson</div>
                                <p className="ns t-body" style={{ color: DS.inkSoft }}>
                                    Discover how energy moves through ecosystems via food chains — from producers right up to apex predators.
                                </p>
                            </div>

                            {/* Learning Outcomes */}
                            <div>
                                <div className="n t-label" style={{ color: themeColor, marginBottom: 7 }}>Learning outcomes</div>
                                {[
                                    "Understand producer & consumer roles",
                                    "Trace energy through a food chain",
                                    "Identify apex predators",
                                    "Explain what happens when a link breaks"
                                ].map((outcome, i) => (
                                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7 }}>
                                        <span style={{ color: themeColor, fontWeight: 900, fontSize: 13, lineHeight: 1.5, flexShrink: 0 }}>→</span>
                                        <span className="ns t-small" style={{ color: DS.inkSoft, lineHeight: 1.6 }}>{outcome}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Playlist */}
                            <div>
                                <div className="n t-label" style={{ color: themeColor, marginBottom: 7, fontSize: 10 }}>Playlist · 3/5</div>
                                {playlist.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {}}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "7px 0",
                                            borderBottom: i < playlist.length - 1 ? "1px solid #F3EEFF" : "none",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: 5,
                                            flexShrink: 0,
                                            background: item.completed ? "#E8F8F0" : item.active ? "#F3EEFF" : "#F8F5F0",
                                            border: `1.5px solid ${item.completed ? "#4CAF8A" : item.active ? themeColor : "#C4BBAF"}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 9
                                        }}>
                                            {item.completed ? (
                                                <span style={{ color: "#4CAF8A", fontWeight: 900 }}>✓</span>
                                            ) : item.active ? (
                                                <span style={{ color: themeColor }}>▶</span>
                                            ) : null}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                className="n t-small"
                                                style={{
                                                    fontWeight: item.active ? 700 : 500,
                                                    color: item.completed ? DS.inkFade : DS.ink,
                                                    textDecoration: item.completed ? "line-through" : "none"
                                                }}
                                            >
                                                {item.title}
                                            </div>
                                        </div>
                                        <div className="n t-label" style={{ color: DS.inkFade }}>{item.duration}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonView;
