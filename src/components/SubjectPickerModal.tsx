import React, { useState } from 'react';
import { DS } from '../components/design-system';
import { ProfileTemplate, TopicFrequency } from '../types';
import { UK_CURRICULUM, getCurriculumForYear } from '../data/ukCurriculum';
import { getSubjectHexColor, getSubjectIcon } from '../utils/subjects';
import { X, Plus } from 'lucide-react';

interface SubjectConfig {
  subject: string;
  focus: string;
  frequency: TopicFrequency;
  isCore: boolean;
}

interface Props {
  childId: string;
  yearGroup: string;
  currentSubjects: SubjectConfig[];
  onSave: (subjects: SubjectConfig[]) => void;
  onClose: () => void;
}

const normalizeYearGroup = (year: string): ProfileTemplate => {
  const yearMatch = year.match(/Year\s*(\d+)/i);
  if (yearMatch) {
    const yearNum = parseInt(yearMatch[1]);
    if (yearNum <= 2) return 'Y1-2';
    if (yearNum <= 4) return 'Y3-4';
    if (yearNum <= 6) return 'Y5-6';
    if (yearNum <= 9) return 'Y7-9';
    if (yearNum <= 11) return 'Y10-11';
    return 'Y12-13';
  }
  const direct = UK_CURRICULUM.find(c => c.yearGroup.toLowerCase() === year.toLowerCase());
  if (direct) return direct.yearGroup;
  return 'Y5-6';
};

const CORE_SUBJECTS = ['English', 'Maths', 'Science'];

export const SubjectPickerModal: React.FC<Props> = ({
  childId,
  yearGroup,
  currentSubjects,
  onSave,
  onClose
}) => {
  const normalizedYear = normalizeYearGroup(yearGroup);
  const curriculum = getCurriculumForYear(normalizedYear);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectConfig[]>(currentSubjects);
  const [showAll, setShowAll] = useState(false);

  if (!curriculum) return null;

  const availableSubjects = curriculum.subjects.map(s => s.subject);
  const uniqueSubjects = [...new Set(availableSubjects)];

  const toggleSubject = (subject: string) => {
    const exists = selectedSubjects.find(s => s.subject === subject);
    if (exists) {
      setSelectedSubjects(selectedSubjects.filter(s => s.subject !== subject));
    } else {
      const subjectData = curriculum.subjects.find(s => s.subject === subject);
      const isCore = CORE_SUBJECTS.includes(subject);
      setSelectedSubjects([
        ...selectedSubjects,
        {
          subject,
          focus: subjectData?.focus || subject,
          frequency: isCore ? 'balanced' : 'low',
          isCore
        }
      ]);
    }
  };

  const updateFrequency = (subject: string, freq: TopicFrequency) => {
    setSelectedSubjects(selectedSubjects.map(s => 
      s.subject === subject ? { ...s, frequency: freq } : s
    ));
  };

  const toggleCore = (subject: string) => {
    setSelectedSubjects(selectedSubjects.map(s => 
      s.subject === subject ? { ...s, isCore: !s.isCore } : s
    ));
  };

  const handleSave = () => {
    onSave(selectedSubjects);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid #EDE8E0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 className="b t-h2" style={{ color: DS.ink }}>Edit Subjects</h2>
            <p className="n t-label" style={{ color: DS.inkFade }}>
              {normalizedYear} • {selectedSubjects.length} selected
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: 4,
              color: DS.inkFade
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, overflowY: 'auto', maxHeight: '60vh' }}>
          {/* Core subjects always shown */}
          <div style={{ marginBottom: 20 }}>
            <div className="n t-small" style={{ color: DS.inkFade, marginBottom: 8, fontWeight: 700 }}>
              CORE SUBJECTS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {uniqueSubjects.filter(s => CORE_SUBJECTS.includes(s)).map(subject => {
                const isSelected = selectedSubjects.some(s => s.subject === subject);
                const color = getSubjectHexColor(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 10,
                      border: isSelected ? `2px solid ${color}` : '2px dashed #C4BBAF',
                      background: isSelected ? `${color}15` : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{getSubjectIcon(subject)}</span>
                    <span className="n t-small" style={{ 
                      color: isSelected ? color : DS.inkFade,
                      fontWeight: 600
                    }}>{subject}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional subjects */}
          <div style={{ marginBottom: 20 }}>
            <div className="n t-small" style={{ color: DS.inkFade, marginBottom: 8, fontWeight: 700 }}>
              OPTIONAL SUBJECTS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {uniqueSubjects.filter(s => !CORE_SUBJECTS.includes(s)).map(subject => {
                const isSelected = selectedSubjects.some(s => s.subject === subject);
                const color = getSubjectHexColor(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 10,
                      border: isSelected ? `2px solid ${color}` : '2px dashed #C4BBAF',
                      background: isSelected ? `${color}15` : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{getSubjectIcon(subject)}</span>
                    <span className="n t-small" style={{ 
                      color: isSelected ? color : DS.inkFade,
                      fontWeight: 600
                    }}>{subject}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected subjects configuration */}
          {selectedSubjects.length > 0 && (
            <div>
              <div className="n t-small" style={{ color: DS.inkFade, marginBottom: 8, fontWeight: 700 }}>
                CONFIGURE SELECTED
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedSubjects.map(config => {
                  const color = getSubjectHexColor(config.subject);
                  return (
                    <div
                      key={config.subject}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: `1.5px solid ${color}40`,
                        background: `${color}08`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{getSubjectIcon(config.subject)}</span>
                      <span className="n t-small" style={{ 
                        color: DS.ink, 
                        fontWeight: 700,
                        flex: 1
                      }}>{config.subject}</span>
                      
                      {/* Core toggle */}
                      <button
                        onClick={() => toggleCore(config.subject)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: 'none',
                          background: config.isCore ? color : '#EDE8E0',
                          color: config.isCore ? '#FFF' : DS.inkFade,
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer'
                        }}
                      >
                        {config.isCore ? 'Core' : 'Optional'}
                      </button>

                      {/* Frequency stars */}
                      <div style={{ display: 'flex', gap: 2 }}>
                        {(['low', 'balanced', 'high'] as TopicFrequency[]).map((freq, i) => (
                          <span
                            key={freq}
                            onClick={() => updateFrequency(config.subject, freq)}
                            style={{
                              fontSize: 14,
                              color: i <= ['low', 'balanced', 'high'].indexOf(config.frequency) 
                                ? '#F5A623' 
                                : 'rgba(26,26,46,0.12)',
                              cursor: 'pointer'
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #EDE8E0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1.5px solid #C4BBAF',
              background: 'transparent',
              color: DS.ink,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              background: DS.ink,
              color: '#FFF',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectPickerModal;
