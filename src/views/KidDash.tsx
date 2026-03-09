import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { getSubjectHexColor, getSubjectIcon } from '../utils/subjects';
import { toLessonView } from '../lib/routes';
import { useAppContext } from '../context/AppContext';
import { getSubjectCardsForYear, loadSubjectCardsForYear } from '../lib/subjectCards';
import { KawaiiSubjectCard } from '../components/KawaiiSubjectCard';
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

const KidDash: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { children, loading } = useAppContext();
    const childId = searchParams.get('child');
    const [subjectCards, setSubjectCards] = useState<any[]>([]);

    const selectedChild = useMemo(() => {
        if (childId) {
            if (childId.startsWith('demo-')) {
                const demoProfile = DEMO_PROFILES.find(p => p.id === childId);
                if (demoProfile) {
                    return {
                        id: demoProfile.id,
                        name: demoProfile.name,
                        avatar: demoProfile.emoji,
                        themeColor: demoProfile.color,
                        yearGroups: [{ name: demoProfile.year }],
                        profileData: {
                            customName: demoProfile.name,
                            template: demoProfile.year,
                            stacks: []
                        }
                    };
                }
            }
            return children.find(c => c.id === childId);
        }
        return children[0];
    }, [children, childId]);

    const subjects = useMemo(() => {
        let subjectsArray: any[] = [];
        
        if (selectedChild.id.startsWith('demo-')) {
            const demoSubjects = [
                { name: 'English', icon: '📖', color: '#E84848', progress: 35, total: 282, category: 'core', topics: 'Comprehension, Composition, SPaG' },
                { name: 'Maths', icon: '📐', color: '#F5A623', progress: 42, total: 156, category: 'core', topics: 'Fractions, Decimals, Geometry' },
                { name: 'Science', icon: '🔬', color: '#00A8DD', progress: 12, total: 89, category: 'core', topics: 'Earth/space, Forces, Living things' },
                { name: 'Design & Tech', icon: '⚙️', color: '#1A9BB5', progress: 0, total: 45, category: 'core', topics: 'Technical knowledge' },
                { name: 'History', icon: '📚', color: '#C2680A', progress: 8, total: 67, category: 'core', topics: 'Ancient civilizations, World wars' },
                { name: 'Geography', icon: '🌍', color: '#2ECC71', progress: 15, total: 78, category: 'core', topics: 'Maps, Climate, Population' },
                { name: 'Art', icon: '🎨', color: '#9B4FD4', progress: 28, total: 134, category: 'arts', topics: 'Drawing, Painting, Sculpture' },
                { name: 'Music', icon: '🎵', color: '#8855EE', progress: 19, total: 92, category: 'arts', topics: 'Theory, Performance, Composition' },
                { name: 'PE', icon: '⚽', color: '#44AA22', progress: 45, total: 180, category: 'arts', topics: 'Games, Fitness, Sports' },
                { name: 'Computing', icon: '💻', color: '#3355DD', progress: 7, total: 56, category: 'core', topics: 'Programming, Digital literacy' }
            ];
            
            return demoSubjects.map(subject => ({
                ...subject,
                isStack: true,
                topics: [],
                subjectId: subject.name,
                topicCards: [],
                stackCount: Math.floor(Math.random() * 8) + 3
            }));
        }
        
        if (selectedChild.profileData?.stacks?.length > 0) {
            subjectsArray = selectedChild.profileData.stacks
                .filter(stack => stack.cards.length > 0)
                .map(stack => {
                    const cardProgress = stack.cards.filter(c => c.approved).length;
                    return {
                        name: stack.subject,
                        icon: stack.emoji || '📚',
                        color: getSubjectHexColor(stack.subject),
                        progress: cardProgress,
                        total: stack.cards.length,
                        category: 'core',
                        isStack: true,
                        topics: stack.cards.map(c => ({ name: c.focus, lessons: [] })),
                        subjectId: stack.subject,
                        topicCards: stack.cards.map((card: any) => ({
                            title: card.focus,
                            videoCount: card.videoCount || 0,
                            url: card.url || '',
                            firstVideoId: card.firstVideoId || ''
                        })),
                        stackCount: stack.cards.length
                    };
                });
        } else if (selectedChild.yearGroups) {
            const allSubjectTopics: any[] = [];
            selectedChild.yearGroups.forEach((yg: any) => {
                yg.subjects.forEach((s: any) => {
                    s.topics.forEach((topic: any, topicIdx: number) => {
                        const lessonCount = topic.lessons?.length || 0;
                        const completedCount = topic.lessons?.filter((l: any) => l.completed).length || 0;
                        allSubjectTopics.push({
                            subject: s.name,
                            topic: topic.name,
                            icon: getSubjectIcon(s.name),
                            color: getSubjectHexColor(s.name),
                            progress: completedCount,
                            total: lessonCount,
                            category: s.category || 'core',
                            isStack: true,
                            topics: s.topics,
                            currentTopicIndex: topicIdx,
                            subjectId: s.subjectId || s.name
                        });
                    });
                });
            });

            const groupedSubjects = allSubjectTopics.reduce((acc, item) => {
                if (!acc[item.subject]) {
                    acc[item.subject] = {
                        name: item.subject,
                        icon: item.icon,
                        color: item.color,
                        progress: item.progress,
                        total: item.total,
                        category: item.category,
                        isStack: true,
                        topics: item.topics,
                        subjectId: item.subjectId,
                        topicCards: [],
                        stackCount: Math.floor(Math.random() * 8) + 3
                    };
                } else {
                    acc[item.subject].progress += item.progress;
                    acc[item.subject].total += item.total;
                }
                return acc;
            }, {} as Record<string, any>);

            subjectsArray = Object.values(groupedSubjects);
        }

        return subjectsArray;
    }, [selectedChild]);

    useEffect(() => {
        if (selectedChild) {
            const cards = getSubjectCardsForYear(selectedChild.yearGroups[0]?.name || 'Y3-4');
            if (!cards || cards.length === 0) {
                loadSubjectCardsForYear(selectedChild.yearGroups[0]?.name || 'Y3-4');
            }
            setSubjectCards(cards || []);
        }
    }, [selectedChild]);

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
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(124,63,228,0.2)',
                        borderTop: '4px solid #7C3FE4',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <div style={{ color: '#1A1028', fontWeight: 600 }}>Loading...</div>
                </div>
            </div>
        );
    }

    if (!selectedChild) {
        return <Navigate to="/" replace />;
    }

    const profile = {
        name: selectedChild.profileData?.customName || selectedChild.name,
        emoji: selectedChild.avatar,
        color: getSubjectHexColor(selectedChild.themeColor as any),
        year: selectedChild.profileData?.template || selectedChild.yearGroups[0]?.name || 'N/A'
    };

    const autoSchedule = generateAutoSchedule(selectedChild, subjects);
    const schedule = [
        ...autoSchedule.map(item => ({
            ...item,
            subjectId: "",
            topicId: ""
        })),
        { subject: "LUNCH", topic: "", icon: "🍽️", status: "lunch", subjectId: "", topicId: "" }
    ];

    // Helper to get subject color class
    const getSubjectClass = (subjectName: string) => {
        const nameMap: Record<string, string> = {
            'English': 'c-english',
            'Maths': 'c-maths', 
            'Science': 'c-science',
            'History': 'c-history',
            'Geography': 'c-geography',
            'Design & Tech': 'c-dt',
            'Art': 'c-art',
            'Music': 'c-music',
            'PE': 'c-pe',
            'Computing': 'c-computing'
        };
        return nameMap[subjectName] || 'c-english';
    };

    return (
        <div style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>
            <style>{`
                :root {
                    --bg: #FDF8F2;
                    --surface: #FFFFFF;
                    --ink: #1A1028;
                    --ink-muted: #7B6F8A;
                    --ink-faint: #C4BAD0;
                    --accent: #7C3FE4;
                    --accent-soft: #F0E8FF;
                    --green: #22C17A;
                    --green-soft: #E4F9EF;
                    --amber: #F5A623;
                    --amber-soft: #FFF4E0;
                    --border: rgba(26,16,40,0.1);
                    --shadow: 0 2px 12px rgba(26,16,40,0.08);
                    --shadow-lg: 0 8px 32px rgba(26,16,40,0.12);
                    --radius: 18px;
                    --radius-sm: 10px;
                }

                * { margin: 0; padding: 0; box-sizing: border-box; }

                body {
                    font-family: 'Nunito', sans-serif;
                    background: var(--bg);
                    color: var(--ink);
                    min-height: 100vh;
                    overflow-x: hidden;
                }

                /* Background texture */
                body::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image: radial-gradient(circle, rgba(124,63,228,0.04) 1px, transparent 1px);
                    background-size: 24px 24px;
                    pointer-events: none;
                    z-index: 0;
                }

                /* Floating blobs */
                .blob {
                    position: fixed;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 0;
                    filter: blur(80px);
                    opacity: 0.12;
                }
                .blob-1 { width: 400px; height: 400px; background: var(--accent); top: -10%; right: -5%; }
                .blob-2 { width: 300px; height: 300px; background: var(--green); bottom: -5%; left: -5%; }

                /* ─── NAV ─── */
                nav {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: rgba(253,248,242,0.92);
                    backdrop-filter: blur(16px);
                    border-bottom: 1.5px solid var(--border);
                    padding: 0 32px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .nav-logo {
                    width: 36px;
                    height: 36px;
                    background: var(--accent);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    box-shadow: 0 4px 12px rgba(124,63,228,0.35);
                }

                .nav-title {
                    font-family: 'Baloo 2', cursive;
                    font-size: 17px;
                    font-weight: 800;
                    letter-spacing: 0.04em;
                    color: var(--ink);
                }

                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .streak-pill {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: var(--amber-soft);
                    border: 1.5px solid rgba(245,166,35,0.3);
                    border-radius: 100px;
                    padding: 5px 14px;
                    font-size: 13px;
                    font-weight: 800;
                    color: #B8740A;
                }

                /* ─── MAIN ─── */
                main {
                    position: relative;
                    z-index: 1;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 28px 32px 48px;
                }

                /* ─── HERO ─── */
                .hero {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 32px;
                    gap: 24px;
                }

                .hero-left {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                }

                .avatar {
                    width: 72px;
                    height: 72px;
                    background: linear-gradient(135deg, var(--accent) 0%, #B07CF8 100%);
                    border-radius: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 36px;
                    box-shadow: 0 8px 24px rgba(124,63,228,0.3);
                    flex-shrink: 0;
                }

                .hero-text h1 {
                    font-family: 'Baloo 2', cursive;
                    font-size: 36px;
                    font-weight: 800;
                    line-height: 1;
                    color: var(--ink);
                }

                .hero-text h1 span { color: var(--accent); }

                .hero-text p {
                    color: var(--ink-muted);
                    font-size: 15px;
                    font-weight: 600;
                    margin-top: 4px;
                }

                .hero-stats {
                    display: flex;
                    gap: 12px;
                    flex-shrink: 0;
                }

                .stat-card {
                    background: var(--surface);
                    border: 1.5px solid var(--border);
                    border-radius: var(--radius-sm);
                    padding: 12px 16px;
                    text-align: center;
                    box-shadow: var(--shadow);
                    min-width: 90px;
                }

                .stat-card .stat-icon { font-size: 20px; margin-bottom: 4px; }
                .stat-card .stat-value {
                    font-family: 'Baloo 2', cursive;
                    font-size: 18px;
                    font-weight: 800;
                    color: var(--accent);
                    line-height: 1;
                }
                .stat-card .stat-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: var(--ink-faint);
                    text-transform: uppercase;
                    margin-top: 2px;
                }

                /* ─── SECTION HEADER ─── */
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .section-label {
                    font-family: 'Baloo 2', cursive;
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #fff;
                    background: var(--accent);
                    border-radius: 8px;
                    padding: 3px 14px;
                }

                .section-line {
                    flex: 1;
                    height: 1.5px;
                    background: var(--border);
                    border-radius: 100px;
                }

                /* ─── TODAY'S PLAN ─── */
                .plan-track {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    padding-top: 4px;
                    margin-bottom: 36px;
                    scrollbar-width: none;
                }
                .plan-track::-webkit-scrollbar { display: none; }

                .plan-card {
                    flex-shrink: 0;
                    width: 160px;
                    background: var(--surface);
                    border: 2px solid var(--border);
                    border-radius: 20px;
                    padding: 18px 16px;
                    text-align: center;
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.15s;
                    box-shadow: var(--shadow);
                    position: relative;
                    overflow: hidden;
                }

                .plan-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }

                .plan-card.done {
                    background: var(--green-soft);
                    border-color: rgba(34,193,122,0.4);
                }
                .plan-card.active {
                    background: var(--accent-soft);
                    border-color: rgba(124,63,228,0.5);
                    box-shadow: 0 0 0 3px rgba(124,63,228,0.12), var(--shadow-lg);
                }
                .plan-card.break {
                    background: var(--amber-soft);
                    border-color: rgba(245,166,35,0.4);
                    cursor: default;
                }
                .plan-card.upcoming {
                    opacity: 0.6;
                }

                .plan-card .plan-icon { font-size: 28px; margin-bottom: 8px; }
                .plan-card .plan-name {
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--ink);
                    margin-bottom: 4px;
                }
                .plan-card .plan-topics {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--ink-muted);
                    line-height: 1.4;
                    margin-bottom: 10px;
                }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    border-radius: 100px;
                    padding: 3px 10px;
                    font-size: 11px;
                    font-weight: 700;
                }
                .status-pill.done { background: var(--green); color: #fff; }
                .status-pill.active { background: var(--accent); color: #fff; animation: pulse-ring 2s infinite; }
                .status-pill.break { background: var(--amber); color: #fff; }
                .status-pill.upcoming { background: var(--ink-faint); color: #fff; }

                @keyframes pulse-ring {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(124,63,228,0.4); }
                    50% { box-shadow: 0 0 0 6px rgba(124,63,228,0); }
                }

                /* ─── COLOR SYSTEM PER SUBJECT ─── */
                .c-english   { --c: #E84848; --cs: rgba(232,72,72,0.12); --cl: #fff0f0; }
                .c-maths     { --c: #F5A623; --cs: rgba(245,166,35,0.12); --cl: #fffbf0; }
                .c-science   { --c: #00A8DD; --cs: rgba(0,168,221,0.12); --cl: #f0faff; }
                .c-history   { --c: #C2680A; --cs: rgba(194,104,10,0.12); --cl: #fff8f0; }
                .c-geography { --c: #2ECC71; --cs: rgba(46,204,113,0.12); --cl: #f0fff8; }
                .c-dt        { --c: #1A9BB5; --cs: rgba(26,155,181,0.12); --cl: #f0fafd; }
                .c-art       { --c: #9B4FD4; --cs: rgba(155,79,212,0.12); --cl: #faf0ff; }
                .c-music     { --c: #8855EE; --cs: rgba(136,85,238,0.12); --cl: #f5f0ff; }
                .c-pe        { --c: #44AA22; --cs: rgba(68,170,34,0.12); --cl: #f0fff0; }
                .c-computing { --c: #3355DD; --cs: rgba(51,85,221,0.12); --cl: #f0f3ff; }

                /* ─── SUBJECTS GRID ─── */
                .subjects-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 28px 20px;
                    padding-bottom: 20px;
                }

                @media (max-width: 1100px) { .subjects-grid { grid-template-columns: repeat(4, 1fr); } }
                @media (max-width: 860px)  { .subjects-grid { grid-template-columns: repeat(3, 1fr); } }

                /* Stack count badge */
                .stack-count {
                    position: absolute;
                    top: -8px; right: 10px;
                    z-index: 10;
                    background: var(--c); color: #fff;
                    font-size: 9px; font-weight: 900;
                    padding: 2px 8px; border-radius: 100px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    letter-spacing: 0.04em;
                    transition: opacity 0.3s;
                }

                /* Floating emojis */
                .float-emoji {
                    position: fixed;
                    pointer-events: none;
                    z-index: 0;
                    font-size: 20px;
                    opacity: 0.12;
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            {/* Background elements */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>

            {/* Floating emojis */}
            <div className="float-emoji" style={{left:'3%',top:'15%',animationDelay:'0s'}}>⭐</div>
            <div className="float-emoji" style={{left:'91%',top:'20%',animationDelay:'0.4s'}}>✨</div>
            <div className="float-emoji" style={{left:'1%',top:'55%',animationDelay:'0.8s'}}>🚀</div>
            <div className="float-emoji" style={{left:'95%',top:'65%',animationDelay:'1.2s'}}>💫</div>

            {/* NAV */}
            <nav>
                <div className="nav-brand">
                    <div className="nav-logo">🎓</div>
                    <span className="nav-title">DADDY DASHBOARD</span>
                </div>
                <div className="nav-right">
                    <div className="streak-pill">🔥 5 day streak!</div>
                    <div style={{
                        width:'36px',height:'36px',background:'#fff',border:'1.5px solid var(--border)',
                        borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:'18px',cursor:'pointer',boxShadow:'var(--shadow)'
                    }}>{profile.emoji}</div>
                </div>
            </nav>

            {/* MAIN */}
            <main>
                {/* HERO */}
                <div className="hero">
                    <div className="hero-left">
                        <div className="avatar">{profile.emoji}</div>
                        <div className="hero-text">
                            <h1>Hey <span>{profile.name}</span>! 👋</h1>
                            <p>Ready for today's adventure? Let's go! 🚀</p>
                        </div>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-value">851</div>
                            <div className="stat-label">Today's XP</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🔥</div>
                            <div className="stat-value">5 days</div>
                            <div className="stat-label">Streak</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-value">+120</div>
                            <div className="stat-label">XP Earned</div>
                        </div>
                    </div>
                </div>

                {/* TODAY'S PLAN */}
                <div className="section-header">
                    <span className="section-label">Today's Plan</span>
                    <div className="section-line"></div>
                </div>

                <div className="plan-track">
                    {schedule.map((item: any, i: number) => {
                        const isLunch = item.status === "lunch";
                        return (
                            <div key={i} className={`plan-card ${item.status}`}>
                                <div className="plan-icon">{item.icon}</div>
                                <div className="plan-name">{item.subject}</div>
                                <div className="plan-topics" style={{color: isLunch ? '#B8740A' : 'var(--ink-muted)'}}>
                                    {isLunch ? '12 – 1 PM' : item.topic}
                                </div>
                                <span className={`status-pill ${item.status}`}>
                                    {isLunch ? '🍽️ Break' : 
                                     item.status === "done" ? '✓ Done' :
                                     item.status === "active" ? '● Now' : 'Up next'}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* SUBJECTS */}
                <div className="section-header">
                    <span className="section-label">My Subjects</span>
                    <div className="section-line"></div>
                </div>

                <div className="subjects-grid">
                    {subjects.map((s, i) => (
                        <div key={i} className={`card-stack ${getSubjectClass(s.name)}`} onClick={() => {
                            const firstCard = s.topicCards?.[0];
                            if (firstCard) {
                                navigate(toLessonView({
                                    childId: selectedChild.id, lessonId: firstCard.firstVideoId || '',
                                    subjectId: s.subjectId, topic: firstCard.title, url: firstCard.url,
                                }));
                            }
                        }}>
                            <div className="stack-count">{s.stackCount} cards</div>
                            <KawaiiSubjectCard
                                subject={s.name} icon={s.icon} color={s.color}
                                progress={s.progress} total={s.total} topicCards={s.topicCards || []}
                                isCore={s.category === 'core'}
                                onClick={() => {
                                    const firstCard = s.topicCards?.[0];
                                    if (firstCard) {
                                        navigate(toLessonView({
                                            childId: selectedChild.id, lessonId: firstCard.firstVideoId || '',
                                            subjectId: s.subjectId, topic: firstCard.title, url: firstCard.url,
                                        }));
                                    }
                                }}
                                onCardClick={(card) => {
                                    navigate(toLessonView({
                                        childId: selectedChild.id, lessonId: card.firstVideoId || '',
                                        subjectId: s.subjectId, topic: card.title, url: card.url,
                                    }));
                                }}
                            />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default KidDash;
