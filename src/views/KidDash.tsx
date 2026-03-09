import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { getSubjectHexColor, getSubjectIcon } from '../utils/subjects';
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

    const themeColor = selectedChild.themeColor === 'purple' ? '#7C3FE4'
        : selectedChild.themeColor === 'blue' ? '#2B8ED4'
            : selectedChild.themeColor === 'green' ? '#22C17A'
                : selectedChild.themeColor === 'amber' ? '#F5A623'
                    : selectedChild.themeColor === 'rose' ? '#FF6B6B'
                        : '#7C3FE4';
    const tintColor = selectedChild.themeColor === 'purple' ? '#F0E8FF'
        : selectedChild.themeColor === 'blue' ? '#EAF4FC'
            : selectedChild.themeColor === 'green' ? '#E4F9EF'
                : selectedChild.themeColor === 'amber' ? '#FFF4E0'
                    : selectedChild.themeColor === 'rose' ? '#FFF0F0'
                        : '#F0E8FF';

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

    const todayDone = subjects.reduce((sum, s) => sum + s.progress, 0);
    const totalToday = subjects.reduce((sum, s) => sum + s.total, 0) || 1;
    const streak = 5;
    const xp = 120;

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "#FDF8F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Nunito', sans-serif"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>Loading subjects...</div>
                    <div style={{ color: "#7B6F8A" }}>Loading {jsonYearKey} curriculum</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#FDF8F2",
            color: "#1A1028",
            fontFamily: "'Nunito', sans-serif",
            overflowX: "hidden",
            position: "relative"
        }}>
            {/* Background texture */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(124,63,228,0.04) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Floating blobs */}
            <div style={{
                position: 'fixed',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 0,
                filter: 'blur(80px)',
                opacity: 0.12,
                width: '400px',
                height: '400px',
                background: themeColor,
                top: '-10%',
                right: '-5%'
            }} />
            <div style={{
                position: 'fixed',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 0,
                filter: 'blur(80px)',
                opacity: 0.12,
                width: '300px',
                height: '300px',
                background: '#22C17A',
                bottom: '-5%',
                left: '-5%'
            }} />

            {/* NAV */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(253,248,242,0.92)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1.5px solid rgba(26,16,40,0.1)',
                padding: '0 32px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: themeColor,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(124,63,228,0.35)'
                    }}>🎓</div>
                    <span style={{
                        fontFamily: "'Baloo 2', cursive",
                        fontSize: '17px',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        color: '#1A1028'
                    }}>DADDY DASHBOARD</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#FFF4E0',
                        border: '1.5px solid rgba(245,166,35,0.3)',
                        borderRadius: '100px',
                        padding: '5px 14px',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#B8740A'
                    }}>🔥 5 day streak!</div>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: '#fff',
                        border: '1.5px solid rgba(26,16,40,0.1)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 12px rgba(26,16,40,0.08)'
                    }}>{profile.emoji}</div>
                </div>
            </nav>

            {/* MAIN */}
            <main style={{
                position: 'relative',
                zIndex: 1,
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '28px 32px 48px'
            }}>

                {/* HERO */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '32px',
                    gap: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)`,
                            borderRadius: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '36px',
                            boxShadow: `0 8px 24px ${themeColor}4D`,
                            flexShrink: 0
                        }}>{profile.emoji}</div>
                        <div>
                            <h1 style={{
                                fontFamily: "'Baloo 2', cursive",
                                fontSize: '36px',
                                fontWeight: 800,
                                lineHeight: 1,
                                color: '#1A1028',
                                margin: 0
                            }}>Hey <span style={{ color: themeColor }}>{profile.name}</span>! 👋</h1>
                            <p style={{
                                color: '#7B6F8A',
                                fontSize: '15px',
                                fontWeight: 600,
                                marginTop: '4px',
                                margin: 0
                            }}>Ready for today's adventure? Let's go! 🚀</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                        <div style={{
                            background: '#FFFFFF',
                            border: '1.5px solid rgba(26,16,40,0.1)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 12px rgba(26,16,40,0.08)',
                            minWidth: '90px'
                        }}>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>✅</div>
                            <div style={{
                                fontFamily: "'Baloo 2', cursive",
                                fontSize: '18px',
                                fontWeight: 800,
                                color: themeColor,
                                lineHeight: 1
                            }}>{todayDone}</div>
                            <div style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                color: '#C4BAD0',
                                textTransform: 'uppercase',
                                marginTop: '2px'
                            }}>TODAY</div>
                        </div>
                        <div style={{
                            background: '#FFFFFF',
                            border: '1.5px solid rgba(26,16,40,0.1)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 12px rgba(26,16,40,0.08)',
                            minWidth: '90px'
                        }}>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔥</div>
                            <div style={{
                                fontFamily: "'Baloo 2', cursive",
                                fontSize: '18px',
                                fontWeight: 800,
                                color: themeColor,
                                lineHeight: 1
                            }}>{streak} days</div>
                            <div style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                color: '#C4BAD0',
                                textTransform: 'uppercase',
                                marginTop: '2px'
                            }}>STREAK</div>
                        </div>
                        <div style={{
                            background: '#FFFFFF',
                            border: '1.5px solid rgba(26,16,40,0.1)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            textAlign: 'center',
                            boxShadow: '0 2px 12px rgba(26,16,40,0.08)',
                            minWidth: '90px'
                        }}>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>⭐</div>
                            <div style={{
                                fontFamily: "'Baloo 2', cursive",
                                fontSize: '18px',
                                fontWeight: 800,
                                color: themeColor,
                                lineHeight: 1
                            }}>+{xp}</div>
                            <div style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                color: '#C4BAD0',
                                textTransform: 'uppercase',
                                marginTop: '2px'
                            }}>XP</div>
                        </div>
                    </div>
                </div>

                {/* TODAY'S PLAN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{
                        fontFamily: "'Baloo 2', cursive",
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#fff',
                        background: themeColor,
                        borderRadius: '8px',
                        padding: '3px 14px'
                    }}>Today's Plan</span>
                    <div style={{
                        flex: 1,
                        height: '1.5px',
                        background: 'rgba(26,16,40,0.1)',
                        borderRadius: '100px'
                    }} />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    paddingTop: '4px',
                    marginBottom: '36px',
                    scrollbarWidth: 'none'
                }}>
                    {schedule.map((item: any, i: number) => {
                        const isLunch = item.status === "lunch";
                        const statusClass = item.status === "done" ? "done" : 
                                         item.status === "active" ? "active" : 
                                         isLunch ? "break" : "upcoming";
                        
                        return (
                            <div key={i} style={{
                                flexShrink: 0,
                                width: '160px',
                                background: isLunch ? '#FFF4E0' : 
                                           item.status === "done" ? '#E4F9EF' :
                                           item.status === "active" ? tintColor : '#FFFFFF',
                                border: `2px solid ${isLunch ? 'rgba(245,166,35,0.4)' : 
                                                   item.status === "done" ? 'rgba(34,193,122,0.4)' :
                                                   item.status === "active" ? `${themeColor}80` : 'rgba(26,16,40,0.1)'}`,
                                borderRadius: '20px',
                                padding: '18px 16px',
                                textAlign: 'center',
                                cursor: isLunch ? 'default' : 'pointer',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                boxShadow: '0 2px 12px rgba(26,16,40,0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                                opacity: item.status === "upcoming" ? 0.6 : 1
                            }}>
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: 800,
                                    color: '#1A1028',
                                    marginBottom: '4px'
                                }}>{item.subject}</div>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#7B6F8A',
                                    lineHeight: 1.4,
                                    marginBottom: '10px'
                                }}>{isLunch ? '12 – 1 PM' : item.topic}</div>
                                
                                {item.frequency !== 'balanced' && !isLunch && (
                                    <span style={{ 
                                        marginLeft: 6, 
                                        fontSize: 10, 
                                        color: item.frequency === 'high' ? '#22C17A' : '#F5A623' 
                                    }}>
                                        {item.frequency === 'high' ? '⭐' : '○'}
                                    </span>
                                )}
                                
                                {item.total !== undefined && item.total > 0 && !isLunch && (
                                    <span style={{ marginLeft: 4, color: '#7B6F8A', fontSize: '10px' }}>
                                        ({item.progress}/{item.total})
                                    </span>
                                )}
                                
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    borderRadius: '100px',
                                    padding: '3px 10px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background: isLunch ? '#F5A623' : 
                                              item.status === "done" ? '#22C17A' :
                                              item.status === "active" ? themeColor : '#C4BAD0',
                                    color: '#fff',
                                    animation: item.status === "active" ? 'pulse-ring 2s infinite' : 'none'
                                }}>
                                    {isLunch ? '🍽️ Break' : 
                                     item.status === "done" ? '✓ Done' :
                                     item.status === "active" ? '● Now' : 'Up next'}
                                </div>
                                
                                {item.status === "upcoming" && !isLunch && (
                                    <div style={{
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        color: '#7B6F8A',
                                        marginTop: '4px'
                                    }}>
                                        {item.weight === 3 ? 'Priority' : item.weight === 1 ? 'Optional' : 'Regular'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* SUBJECTS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{
                        fontFamily: "'Baloo 2', cursive",
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#fff',
                        background: themeColor,
                        borderRadius: '8px',
                        padding: '3px 14px'
                    }}>My Subjects</span>
                    <div style={{
                        flex: 1,
                        height: '1.5px',
                        background: 'rgba(26,16,40,0.1)',
                        borderRadius: '100px'
                    }} />
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '28px 20px',
                    paddingBottom: '20px'
                }}>
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
            </main>

            {/* Add pulse animation */}
            <style>{`
                @keyframes pulse-ring {
                    0%, 100% { box-shadow: 0 0 0 0 ${themeColor}66; }
                    50% { box-shadow: 0 0 0 6px ${themeColor}00; }
                }
            `}</style>
        </div>
    );
};

export default KidDash;
