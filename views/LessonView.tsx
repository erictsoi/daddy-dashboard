import React from 'react';
import { getDummyChild } from '../src/data/dummyData';

interface LessonViewProps {
    childId: string;
    lessonId: string;
}

const DS = {
    cream: "#FAF6F0",
    card: "#FFFFFF",
    ink: "#1A1A2E",
    inkSoft: "#6B6580",
    inkFade: "#B0A8C0",
    border: "2.5px solid #1A1A2E",
    borderThick: "3px solid #1A1A2E",
    radius: { sm: 10, md: 16, lg: 22, pill: 100 },
};

export const LessonView: React.FC<LessonViewProps> = ({ childId, lessonId }) => {
    const child = getDummyChild(childId);
    
    if (!child) {
        return (
            <div style={{ 
                minHeight: "100vh", 
                background: DS.cream, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontFamily: "'Nunito Sans', sans-serif",
                color: DS.ink
            }}>
                <h1>Child not found: {childId}</h1>
            </div>
        );
    }

    const themeColor = child.themeColor === 'purple' ? '#9B6DD6' : child.themeColor === 'blue' ? '#2B8ED4' : '#4CAF50';
    
    let lesson: { id: string; title: string; videoUrl?: string; completed: boolean } | undefined;
    let subjectName = '';
    let topicName = '';
    
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

    if (!lesson) {
        return (
            <div style={{ 
                minHeight: "100vh", 
                background: DS.cream, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontFamily: "'Nunito Sans', sans-serif",
                color: DS.ink
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>Lesson not found: {lessonId}</h1>
                    <a href={`/kiddash?child=${childId}`} style={{ color: themeColor, fontWeight: 700 }}>← Back to Dashboard</a>
                </div>
            </div>
        );
    }

    const videoId = lesson.videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/)?.[1];

    return (
        <div style={{ 
            minHeight: "100vh", 
            background: DS.cream,
            fontFamily: "'Nunito Sans', sans-serif",
            color: DS.ink
        }}>
            {/* Header */}
            <div style={{ 
                background: themeColor, 
                padding: "20px 24px",
                borderBottom: DS.borderThick
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <a href={`/kiddash?child=${childId}`} style={{ 
                        color: "#fff", 
                        textDecoration: "none",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}>
                        ← Back to {child.name}'s Space
                    </a>
                    <div style={{ color: "#fff", fontWeight: 600 }}>
                        {subjectName} • {topicName}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
                {/* Video Player */}
                <div style={{ 
                    background: DS.card, 
                    border: DS.border, 
                    borderRadius: DS.radius.lg, 
                    overflow: "hidden",
                    marginBottom: 24
                }}>
                    {videoId ? (
                        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                            <iframe 
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                title={lesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div style={{ 
                            padding: "80px 40px", 
                            textAlign: "center",
                            background: "#f5f5f5"
                        }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                            <div style={{ color: DS.inkSoft, fontWeight: 600 }}>No video available</div>
                        </div>
                    )}
                </div>

                {/* Lesson Info */}
                <div style={{ 
                    background: DS.card, 
                    border: DS.border, 
                    borderRadius: DS.radius.lg, 
                    padding: 24
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Baloo 2', cursive", margin: 0 }}>
                                {lesson.title}
                            </h1>
                            <p style={{ color: DS.inkSoft, marginTop: 4 }}>{subjectName} • {topicName}</p>
                        </div>
                        <button style={{
                            background: lesson.completed ? "#4CAF50" : themeColor,
                            color: "#fff",
                            border: DS.border,
                            borderRadius: DS.radius.sm,
                            padding: "12px 24px",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: "pointer",
                            boxShadow: "4px 4px 0 #1A1A2E"
                        }}>
                            {lesson.completed ? "✓ Completed" : "Mark Complete"}
                        </button>
                    </div>

                    {/* Learning Outcomes */}
                    <div style={{ 
                        background: DS.cream, 
                        borderRadius: DS.radius.md, 
                        padding: 20,
                        marginTop: 20
                    }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            🎯 Learning Outcomes
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            <li style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" }}>
                                <span style={{ color: themeColor, fontWeight: 900 }}>•</span>
                                <span style={{ color: DS.inkSoft }}>Understand the key concepts from this lesson</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" }}>
                                <span style={{ color: themeColor, fontWeight: 900 }}>•</span>
                                <span style={{ color: DS.inkSoft }}>Apply knowledge to solve practice problems</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0" }}>
                                <span style={{ color: themeColor, fontWeight: 900 }}>•</span>
                                <span style={{ color: DS.inkSoft }}>Build confidence in this subject area</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonView;
