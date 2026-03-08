import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { getSubjectHexColor, getSubjectIcon } from '../utils/subjects';
import { DS, Texture, Deco, Shadow, Chip, SectionHead } from '../components/design-system';
import { toLessonView } from '../lib/routes';
import { useAppContext } from '../context/AppContext';
import { getSubjectCardsForYear, loadSubjectCardsForYear } from '../lib/subjectCards';
import { SubjectCard } from '../components/SubjectCard';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { countCompletedToday } from '../utils/dashboardStats';

const generateAutoSchedule = (child: any, subjects: any[]) => {
  const childId = child.id;
  const freqModes = JSON.parse(localStorage.getItem('child_freq_modes') || '{}');
  const childFreqWeights = JSON.parse(localStorage.getItem('child_freq_weights') || '{}');
  
  const childMode = childFreqWeights[childId] || 'balanced';
  const subjectFreqs = freqModes[childId] || {};
  
  const completedToday = countCompletedToday(child);
  
  const weightedSubjects = subjects.map(subject => {
    const freq = subjectFreqs[subject.subject] || 'balanced';
    let weight = 1;
    
    if (childMode === 'stem') {
      const isStem = ['Maths', 'Science', 'Physics', 'Technology', 'Computer Science'].includes(subject.subject);
      weight = isStem ? 3 : 1;
    } else if (childMode === 'arts') {
      const isCore = ['Maths', 'English', 'Science'].includes(subject.subject);
      const isArts = subject.category === 'arts' || subject.category === 'Creative';
      weight = isCore ? 2 : (isArts ? 3 : 1);
    } else {
      weight = freq === 'high' ? 3 : freq === 'low' ? 1 : 2;
    }
    
    return { ...subject, weight, frequency: freq };
  });
  
  weightedSubjects.sort((a, b) => {
    if (a.weight !== b.weight) return b.weight - a.weight;
    return a.progress - b.progress;
  });
  
  const scheduleItems = weightedSubjects.slice(0, 5).map((subject, index) => {
    const progressRatio = subject.progress / subject.total;
    let status: 'done' | 'active' | 'upcoming';
    
    if (progressRatio >= 1) {
      status = 'done';
    } else if (progressRatio > 0) {
      status = 'active';
    } else {
      status = 'upcoming';
    }
    
    if (index === 0 && status === 'upcoming' && completedToday === 0) {
      status = 'active';
    }
    
    return {
      subject: subject.subject,
      topic: subject.topic,
      icon: subject.icon,
      status,
      progress: subject.progress,
      total: subject.total,
      weight: subject.weight,
      frequency: subject.frequency
    };
  });
  
  return scheduleItems;
};

export const KidDash: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const childId = searchParams.get('child');
    const { children } = useAppContext();
    
    let selectedChild = children.find(c => c.id === childId);
    if (!selectedChild && childId) {
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
            selectedChild = {
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
                yearGroups: [{
                    id: 'demo-year',
                    name: demoProfile.year,
                    subjects: []
                }]
            };
        }
    }

    if (!childId || !selectedChild) {
        return <Navigate to="/" replace />;
    }

    const [loading, setLoading] = useState(true);

    const yearKeyMap: Record<string, string> = {
        'Y5-6': 'Y5-6',
        'Y7-9': 'Y7-9',
        'Y10-11': 'Y7-9',
        'Y12-13': 'Y7-9'
    };
    const rawYear = selectedChild.yearGroups?.[0]?.name || 'Y5-6';
    const yearMatch = rawYear.match(/Year\s*(\d+)/i);
    let normalizedYear = 'Y5-6';
    if (yearMatch) {
        const yearNum = parseInt(yearMatch[1]);
        if (yearNum <= 2) normalizedYear = 'Y1-2';
        else if (yearNum <= 4) normalizedYear = 'Y3-4';
        else if (yearNum <= 6) normalizedYear = 'Y5-6';
        else if (yearNum <= 9) normalizedYear = 'Y7-9';
        else if (yearNum <= 11) normalizedYear = 'Y10-11';
        else normalizedYear = 'Y12-13';
    }
    const jsonYearKey = yearKeyMap[normalizedYear] || 'Y5-6';

    useEffect(() => {
        loadSubjectCardsForYear(jsonYearKey).then(() => {
            setLoading(false);
        });
    }, [jsonYearKey]);

    const themeColor = selectedChild.themeColor === 'purple' ? '#9B6DD6'
        : selectedChild.themeColor === 'blue' ? '#2B8ED4'
            : selectedChild.themeColor === 'green' ? '#4CAF8A'
                : selectedChild.themeColor === 'amber' ? '#F5A623'
                    : selectedChild.themeColor === 'rose' ? '#FF6B6B'
                        : '#9B6DD6';
    const tintColor = selectedChild.themeColor === 'purple' ? '#F3EEFF'
        : selectedChild.themeColor === 'blue' ? '#EAF4FC'
            : selectedChild.themeColor === 'green' ? '#EDFAF4'
                : selectedChild.themeColor === 'amber' ? '#FFF8EC'
                    : selectedChild.themeColor === 'rose' ? '#FFF0F0'
                        : '#F3EEFF';

    const profile = {
        name: selectedChild.name,
        year: selectedChild.yearGroups?.[0]?.name || "Student",
        color: themeColor,
        tint: tintColor,
        emoji: selectedChild.avatar
    };

    const jsonSubjectCards = useMemo(() => getSubjectCardsForYear(jsonYearKey), [jsonYearKey, loading]);

    const subjects: any[] = [];

    if (jsonSubjectCards.length > 0) {
        for (const card of jsonSubjectCards) {
            const totalVideos = card.playlists.reduce((sum, p) => sum + p.videos.length, 0);
            const firstPlaylist = card.playlists[0];
            const completedCount = firstPlaylist ? firstPlaylist.videos.length : 0;

            const allLessons = card.playlists.flatMap((p, pIdx) =>
                p.videos.map(v => ({
                    id: v.id,
                    title: v.title,
                    videoUrl: v.url,
                    completed: pIdx === 0
                }))
            );

            const firstTopicUrl = firstPlaylist?.url;

            subjects.push({
                name: card.subject,
                icon: getSubjectIcon(card.subject),
                progress: completedCount,
                total: totalVideos || 1,
                topic: card.focus,
                color: getSubjectHexColor(card.subject),
                subjectId: card.id,
                topicId: firstTopicUrl || '',
                lessons: allLessons,
                topicCards: card.playlists.map(p => ({
                    title: p.title,
                    videoCount: p.videos.length,
                    url: p.url,
                    firstVideoId: p.videos[0]?.id
                }))
            });
        }
    } else if (selectedChild.yearGroups) {
        for (const yg of selectedChild.yearGroups) {
            for (const sub of yg.subjects || []) {
                let lessonCount = 0;
                let completedCount = 0;
                let subjectId = sub.id;
                let allLessons: any[] = [];
                let firstTopicId = '';

                for (const topic of sub.topics || []) {
                    if (!firstTopicId) firstTopicId = topic.id;
                    for (const lesson of topic.lessons || []) {
                        lessonCount++;
                        if (lesson.completed) completedCount++;
                        allLessons.push({
                            id: lesson.id,
                            title: lesson.title,
                            videoUrl: lesson.videoUrl,
                            completed: lesson.completed
                        });
                    }
                }

                const subjectName = sub.category || sub.name;
                subjects.push({
                    name: sub.name,
                    icon: getSubjectIcon(subjectName),
                    progress: completedCount,
                    total: lessonCount || 1,
                    topic: sub.topics?.[0]?.name || sub.category || 'General',
                    color: getSubjectHexColor(subjectName),
                    subjectId,
                    topicId: firstTopicId,
                    lessons: allLessons,
                    topicCards: []
                });
            }
        }
    }

    const autoSchedule = generateAutoSchedule(selectedChild, subjects);
    const schedule = [
        ...autoSchedule.map(item => ({
            ...item,
            subjectId: "",
            topicId: ""
        })),
        { subject: "LUNCH", topic: "", icon: "🍽️", status: "lunch", subjectId: "", topicId: "" }
    ];

    const statusCfg: Record<string, { bg: string; border: string; label: string }> = {
        done: { bg: "#E8F8F0", border: "#4CAF8A", label: "✓ Done" },
        active: { bg: profile.tint, border: profile.color, label: "● Now" },
        pending: { bg: DS.card, border: "#C4BBAF", label: "Up next" },
        stretch: { bg: "#FFFBEC", border: "#F5A623", label: "★ Bonus" },
        lunch: { bg: "#FFF8EC", border: "#F5A623", label: "🍽 Lunch" },
    };

    const todayDone = subjects.reduce((sum, s) => sum + s.progress, 0);
    const totalToday = subjects.reduce((sum, s) => sum + s.total, 0) || 1;
    const streak = 5;
    const xp = 120;

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                background: DS.cream,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>Loading subjects...</div>
                    <div style={{ color: DS.inkFade }}>Loading {jsonYearKey} curriculum</div>
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
            <Texture />
            <Deco color={profile.color} />

            <div style={{ position: "relative", zIndex: 10, background: `${DS.card}F2`, backdropFilter: "blur(14px)", borderBottom: DS.border, padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Shadow offset={2} size={2} radius={10}>
                        <div style={{ position: "relative", width: 38, height: 38, background: profile.color, border: DS.border, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
                    </Shadow>
                    <span className="b t-h3" style={{ color: DS.ink, fontSize: 18 }}>DADDY DASHBOARD</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Shadow offset={2} size={1.5} radius={DS.radius.sm}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, background: profile.tint, border: DS.border, borderRadius: DS.radius.sm, padding: "6px 14px" }}>
                            <span>🔥</span>
                            <span className="n t-small" style={{ fontWeight: 800, color: DS.ink }}>5 day streak!</span>
                        </div>
                    </Shadow>
                    <div
                        className="float"
                        onClick={() => navigate('/returningview')}
                        style={{ width: 38, height: 38, background: DS.card, border: DS.border, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer" }}
                    >
                        {profile.emoji}
                    </div>
                </div>
            </div>

            {childId ? (
                <div style={{ position: "relative", zIndex: 5, padding: "26px 30px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
                        <Shadow offset={4} size={2.5} radius={20}>
                            <div style={{ position: "relative", width: 70, height: 70, background: profile.color, border: DS.border, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>{profile.emoji}</div>
                        </Shadow>
                        <div style={{ flex: 1 }}>
                            <h1 className="b" style={{ fontSize: 38, fontWeight: 800, color: DS.ink, lineHeight: 1 }}>
                                Hey <span style={{ color: profile.color }}>{profile.name}</span>! 👋
                            </h1>
                            <p className="n t-body" style={{ color: DS.inkSoft, marginTop: 4 }}>Ready for today's adventure? Let's go! 🚀</p>
                        </div>
                        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                            <Chip icon="✅" val={`${todayDone}/${totalToday}`} label="TODAY" color={profile.color} />
                            <Chip icon="🔥" val={`${streak} days`} label="STREAK" color={profile.color} />
                            <Chip icon="⭐" val={`+${xp}`} label="XP" color={profile.color} />
                        </div>
                    </div>

                    <SectionHead label="TODAY'S PLAN" color={profile.color} />
                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, paddingTop: 8, marginBottom: 28 }}>
                        {schedule.map((item, i) => {
                            const cfg = statusCfg[item.status] || statusCfg.pending;
                            const isLunch = item.status === "lunch";
                            const isActive = item.status === "active";
                            return (
                                <div key={i} className={isActive ? "float" : ""}>
                                    <Shadow offset={2} size={2} radius={DS.radius.lg} style={{ flexShrink: 0, overflow: "visible", marginTop: 4 }}>
                                        <div
                                            style={{
                                                position: "relative",
                                                background: cfg.bg,
                                                border: `3px solid ${cfg.border}`,
                                                borderRadius: DS.radius.lg,
                                                padding: "16px 18px",
                                                minWidth: 148,
                                                height: 148,
                                                textAlign: "center",
                                                cursor: !isLunch ? "pointer" : "default",
                                                transition: "all .2s"
                                            }}
                                        >
                                            {isLunch ? (
                                                <>
                                                    <div style={{ fontSize: 28, marginBottom: 4 }}>🍽️</div>
                                                    <div className="b t-h3" style={{ color: DS.ink }}>LUNCH</div>
                                                    <div className="n t-label" style={{ color: "#B87A10", marginTop: 2 }}>12 – 1PM</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</div>
                                                    <div className="b t-h3" style={{ color: DS.ink, marginBottom: 2 }}>{item.subject}</div>
                                                    <div className="n t-label" style={{ color: DS.inkSoft, marginBottom: 10, fontWeight: 600 }}>{item.topic}</div>
                                                    {item.frequency !== 'balanced' && (
                                                        <span style={{ marginLeft: 6, fontSize: 10, color: item.frequency === 'high' ? '#4CAF50' : '#FF9800' }}>
                                                            {item.frequency === 'high' ? '⭐' : '○'}
                                                        </span>
                                                    )}
                                                    {item.total !== undefined && item.total > 0 && (
                                                        <span style={{ marginLeft: 4, color: DS.inkSoft }}>
                                                            ({item.progress}/{item.total})
                                                        </span>
                                                    )}
                                                    <Shadow offset={1} size={1.5} radius={DS.radius.pill} style={{ display: "inline-block" }}>
                                                        <div style={{ position: "relative", background: cfg.border, border: DS.border, borderRadius: DS.radius.pill, padding: "2px 10px" }}>
                                                            <span className="n t-label" style={{ color: "#fff" }}>{cfg.label}</span>
                                                        </div>
                                                    </Shadow>
                                                    {item.status === "active" && <span className="n t-label" style={{ color: profile.color, background: `${profile.color}18`, padding: "2px 8px", borderRadius: DS.radius.pill }}>NOW</span>}
                                                    {item.status === "done" && <span className="n t-label" style={{ color: DS.inkFade }}>✓ Done</span>}
                                                    {item.status === "upcoming" && (
                                                        <span className="n t-label" style={{ color: DS.inkFade, fontSize: 10 }}>
                                                            {item.weight === 3 ? 'Priority' : item.weight === 1 ? 'Optional' : 'Regular'}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </Shadow>
                                </div>
                            );
                        })}
                    </div>

                    <SectionHead label="MY SUBJECTS" color={profile.color} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
                        {(() => {
                            const coreSubjects = ['English', 'Maths', 'Science', 'History', 'Geography'];
                            const sortedSubjects = [...subjects].sort((a, b) => {
                                const aIsCore = coreSubjects.includes(a.name);
                                const bIsCore = coreSubjects.includes(b.name);
                                if (aIsCore && !bIsCore) return -1;
                                if (!aIsCore && bIsCore) return 1;
                                return 0;
                            });
                            return sortedSubjects.map((s, i) => {
                                const isCoreSubject = coreSubjects.includes(s.name);
                                const subjectCardsData = {
                                    color: s.color,
                                    icon: s.icon,
                                    topic: s.topic,
                                    category: isCoreSubject ? 'core' : 'optional',
                                    progress: s.progress,
                                    total: s.total,
                                    cards: s.topicCards?.slice(0, 7).map((tc: any, idx: number) => ({
                                        focus: tc.title,
                                        approved: idx === 0
                                    })) || []
                                };

                                return (
                                    <div key={i}>
                                        <SubjectCard
                                            subject={s.name}
                                            subjectData={subjectCardsData}
                                            frequency="balanced"
                                            isCore={isCoreSubject}
                                            isEditable={false}
                                            onAddTopic={undefined}
                                            onFrequencyChange={undefined}
                                            onRemove={undefined}
                                            onClick={() => {
                                                const firstCard = s.topicCards?.[0];
                                                if (firstCard) {
                                                    navigate(
                                                        toLessonView({
                                                            childId,
                                                            lessonId: firstCard.firstVideoId || '',
                                                            subjectId: s.subjectId,
                                                            topic: firstCard.title,
                                                            url: firstCard.url,
                                                        })
                                                    );
                                                }
                                            }}
                                            onCardClick={(card) => {
                                                const clickedCard = s.topicCards?.find((tc: any) => tc.title === card.focus);
                                                if (clickedCard) {
                                                    navigate(
                                                        toLessonView({
                                                            childId,
                                                            lessonId: clickedCard.firstVideoId || '',
                                                            subjectId: s.subjectId,
                                                            topic: clickedCard.title,
                                                            url: clickedCard.url,
                                                        })
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            ) : (
                <div style={{ padding: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                        {children.map((child) => {
                            const childSchedule = generateAutoSchedule(child, child.yearGroups?.flatMap((yg: any) => yg.subjects || []) || []);
                            
                            return (
                                <div key={child.id} style={{ background: `${DS.card}F2`, border: DS.border, borderRadius: DS.radius.lg, padding: 20 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                        <Shadow offset={2} size={2} radius={10}>
                                            <div style={{ position: "relative", width: 38, height: 38, background: child.themeColor === 'purple' ? '#9B6DD6' : child.themeColor === 'blue' ? '#2B8ED4' : child.themeColor === 'green' ? '#4CAF8A' : child.themeColor === 'amber' ? '#F5A623' : child.themeColor === 'rose' ? '#FF6B6B' : '#9B6DD6', border: DS.border, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
                                        </Shadow>
                                        <div style={{ flex: 1 }}>
                                            <h2 className="b" style={{ fontSize: 20, fontWeight: 800, color: DS.ink, lineHeight: 1 }}>
                                                {child.name}'s Schedule
                                            </h2>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 16 }}>
                                        {childSchedule.length > 0 ? (
                                            childSchedule.map((item: any, i: number) => {
                                                const cfg = statusCfg[item.status] || statusCfg.pending;
                                                const isLunch = item.status === "lunch";
                                                
                                                return (
                                                    <div key={i} style={{ marginBottom: 12 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: DS.radius.sm, background: isLunch ? "#FFF8EC" : `${child.themeColor === 'purple' ? '#9B6DD6' : child.themeColor === 'blue' ? '#2B8ED4' : child.themeColor === 'green' ? '#4CAF8A' : child.themeColor === 'amber' ? '#F5A623' : child.themeColor === 'rose' ? '#FF6B6B' : '#9B6DD6'}15`, border: DS.border }}>
                                                            <div style={{ fontSize: 16, textAlign: "center", minWidth: 120 }}>
                                                                {isLunch ? (
                                                                    <>
                                                                        <div style={{ fontSize: 20, marginBottom: 4 }}>🍽️</div>
                                                                        <div className="b t-h3" style={{ color: DS.ink }}>LUNCH</div>
                                                                        <div className="n t-label" style={{ color: "#B87A10", marginTop: 2 }}>12 – 1PM</div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                                                                        <div className="b t-h3" style={{ color: DS.ink, marginBottom: 2 }}>{item.subject}</div>
                                                                        <div className="n t-label" style={{ color: DS.inkSoft, marginBottom: 10, fontWeight: 600 }}>{item.topic}</div>
                                                                        {item.frequency !== 'balanced' && (
                                                                            <span style={{ marginLeft: 6, fontSize: 10, color: item.frequency === 'high' ? '#4CAF50' : '#FF9800' }}>
                                                                                {item.frequency === 'high' ? '⭐' : '○'}
                                                                            </span>
                                                                        )}
                                                                        {item.total !== undefined && item.total > 0 && (
                                                                            <span style={{ marginLeft: 4, color: DS.inkSoft }}>
                                                                                ({item.progress}/{item.total})
                                                                            </span>
                                                                        )}
                                                                        <Shadow offset={1} size={1.5} radius={DS.radius.pill} style={{ display: "inline-block" }}>
                                                                            <div style={{ position: "relative", background: cfg.border, border: DS.border, borderRadius: DS.radius.pill, padding: "2px 10px" }}>
                                                                                <span className="n t-label" style={{ color: "#fff" }}>{cfg.label}</span>
                                                                            </div>
                                                                        </Shadow>
                                                                        {item.status === "active" && <span className="n t-label" style={{ color: child.themeColor === 'purple' ? '#9B6DD6' : child.themeColor === 'blue' ? '#2B8ED4' : child.themeColor === 'green' ? '#4CAF8A' : child.themeColor === 'amber' ? '#F5A623' : child.themeColor === 'rose' ? '#FF6B6B' : '#9B6DD6', background: `${child.themeColor === 'purple' ? '#9B6DD6' : child.themeColor === 'blue' ? '#2B8ED4' : child.themeColor === 'green' ? '#4CAF8A' : child.themeColor === 'amber' ? '#F5A623' : child.themeColor === 'rose' ? '#FF6B6B' : '#9B6DD6'}18`, padding: "2px 8px", borderRadius: DS.radius.pill }}>NOW</span>}
                                                                        {item.status === "done" && <span className="n t-label" style={{ color: DS.inkFade }}>✓ Done</span>}
                                                                        {item.status === "upcoming" && (
                                                                            <span className="n t-label" style={{ color: DS.inkFade, fontSize: 10 }}>
                                                                                {item.weight === 3 ? 'Priority' : item.weight === 1 ? 'Optional' : 'Regular'}
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div style={{ textAlign: "center", padding: "20px", color: DS.inkSoft }}>
                                                No subjects scheduled for {child.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KidDash;
