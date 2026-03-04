import React, { useState, useMemo } from 'react';
import { DS } from '../components/design-system';
import { ProfileTemplate, TopicFrequency } from '../types';
import { SubjectCard } from './SubjectCard';
import { SubjectPickerModal } from './SubjectPickerModal';
import { useSubjectConfigs, SubjectConfig } from '../hooks/useSubjectConfigs';
import { getSubjectHexColor, getSubjectIcon, normalizeYearGroup } from '../utils/subjects';
import { getSubjectCardsForYear, SubjectCard as JSONSubjectCard } from '../lib/subjectCards';
import { Plus } from 'lucide-react';

interface SubjectFieldsProps {
  childId: string;
  childName: string;
  yearGroup: string;
  themeColor: string;
}

const STARTER_SUBJECTS = ['English', 'Maths', 'Science', 'History', 'Geography', 'Art & Design', 'Music', 'PE', 'Computing'];

// Removed duplicate normalizeYearGroup - now imported from utils/subjects

export const SubjectFields: React.FC<SubjectFieldsProps> = ({
  childId,
  childName,
  yearGroup,
  themeColor
}) => {
  const { configs, setConfig, updateFrequency, toggleCore, clearConfigs } = useSubjectConfigs();
  const [showPicker, setShowPicker] = useState(false);

  const normalizedYear = normalizeYearGroup(yearGroup);
  const savedConfig = configs[childId];
  
  // Load real subject cards from JSON
  const yearKeyMap: Record<string, string> = {
    'Y5-6': 'Y5-6',
    'Y7-9': 'Y7-9',
    'Y10-11': 'Y7-9',
    'Y12-13': 'Y7-9'
  };
  const jsonYearKey = yearKeyMap[normalizedYear] || 'Y5-6';
  const jsonSubjectCards = useMemo(() => getSubjectCardsForYear(jsonYearKey), [jsonYearKey]);

  // Clear saved config if no real data available for this year group
  React.useEffect(() => {
    if (savedConfig && savedConfig.length > 0 && jsonSubjectCards.length === 0) {
      clearConfigs();
    }
  }, [normalizedYear]);

  // Initialize with defaults if no config saved
  const getSubjects = (): SubjectConfig[] => {
    if (savedConfig && savedConfig.length > 0) {
      return savedConfig;
    }
    
    // Only use real JSON data - no fallback to curriculum
    if (jsonSubjectCards.length > 0) {
      return jsonSubjectCards.map((card: JSONSubjectCard) => {
        const isCore = STARTER_SUBJECTS.includes(card.subject) && ['English', 'Maths', 'Science', 'History', 'Geography'].includes(card.subject);
        return {
          subject: card.subject,
          focus: card.focus,
          frequency: isCore ? 'balanced' : 'low',
          isCore,
          topicCards: card.playlists.map(p => ({
            title: p.title,
            videoCount: p.videos.length,
            url: p.url
          }))
        };
      });
    }
    
    // No data available - return empty
    return [];
  };

  const subjects = getSubjects();

  const handleSaveSubjects = (newSubjects: SubjectConfig[]) => {
    setConfig(childId, newSubjects);
  };

  const handleFrequencyChange = (subject: string, freq: TopicFrequency) => {
    const newSubjects = subjects.map(s => 
      s.subject === subject ? { ...s, frequency: freq } : s
    );
    setConfig(childId, newSubjects);
  };

  const handleRemoveSubject = (subject: string) => {
    const newSubjects = subjects.filter(s => s.subject !== subject);
    setConfig(childId, newSubjects);
  };

  const handleCoreToggle = (subject: string) => {
    const newSubjects = subjects.map(s => 
      s.subject === subject ? { ...s, isCore: !s.isCore } : s
    );
    setConfig(childId, newSubjects);
  };

  const coreSubjects = subjects.filter(s => s.isCore);
  const optionalSubjects = subjects.filter(s => !s.isCore);

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: 16 
      }}>
        <div
          style={{
            background: themeColor,
            padding: '4px 16px',
            borderRadius: 8,
            fontWeight: 700,
            color: '#FFF',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span>{childName}'s SUBJECTS</span>
          <span style={{ opacity: 0.8 }}>{normalizedYear}</span>
        </div>
        <div style={{ flex: 1, height: 2, background: '#EDE8E0', borderRadius: 100 }} />
        <button
          onClick={() => setShowPicker(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            border: '1.5px dashed #C4BBAF',
            background: 'transparent',
            color: DS.ink,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Plus size={14} />
          Edit Subjects
        </button>
      </div>

      {/* Core Subjects */}
      {coreSubjects.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: 14 
          }}>
            {coreSubjects.map(config => {
              const color = getSubjectHexColor(config.subject);
              const topicCards = config.topicCards?.map((tc, idx) => ({
                focus: tc.title,
                approved: idx === 0 // First playlist is primary
              })) || [];
              return (
                <SubjectCard
                  key={config.subject}
                  subject={config.subject}
                  subjectData={{
                    color,
                    icon: getSubjectIcon(config.subject),
                    topic: config.focus,
                    category: config.isCore ? 'core' : 'optional',
                    progress: config.topicCards ? config.topicCards.reduce((sum, tc) => sum + tc.videoCount, 0) : 0,
                    total: config.topicCards ? config.topicCards.reduce((sum, tc) => sum + tc.videoCount, 0) : 10,
                    cards: topicCards
                  }}
                  frequency={config.frequency}
                  isCore={config.isCore}
                  isEditable={true}
                  onFrequencyChange={(freq) => handleFrequencyChange(config.subject, freq)}
                  onRemove={() => handleRemoveSubject(config.subject)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Subjects */}
      {optionalSubjects.length > 0 && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: 14 
          }}>
            {optionalSubjects.map(config => {
              const color = getSubjectHexColor(config.subject);
              const topicCards = config.topicCards?.map((tc, idx) => ({
                focus: tc.title,
                approved: idx === 0
              })) || [];
              return (
                <SubjectCard
                  key={config.subject}
                  subject={config.subject}
                  subjectData={{
                    color,
                    icon: getSubjectIcon(config.subject),
                    topic: config.focus,
                    category: config.isCore ? 'core' : 'optional',
                    progress: config.topicCards ? config.topicCards.reduce((sum, tc) => sum + tc.videoCount, 0) : 0,
                    total: config.topicCards ? config.topicCards.reduce((sum, tc) => sum + tc.videoCount, 0) : 10,
                    cards: topicCards
                  }}
                  frequency={config.frequency}
                  isCore={config.isCore}
                  isEditable={true}
                  onFrequencyChange={(freq) => handleFrequencyChange(config.subject, freq)}
                  onRemove={() => handleRemoveSubject(config.subject)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Picker Modal */}
      {showPicker && (
        <SubjectPickerModal
          childId={childId}
          yearGroup={yearGroup}
          currentSubjects={subjects}
          onSave={handleSaveSubjects}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

export default SubjectFields;
