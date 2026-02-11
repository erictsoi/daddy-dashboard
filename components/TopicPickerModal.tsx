import React, { useState } from 'react';
import { ChildProfile } from '../types';
import { X } from 'lucide-react';

interface Props {
  child: ChildProfile | undefined;
  onSelect: (subjectId: string, topicId: string, lessonId: string, subjectName: string, lessonTitle: string) => void;
  onClose: () => void;
}

export const TopicPickerModal: React.FC<Props> = ({ child, onSelect, onClose }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  if (!child) return null;

  const allSubjects = child.yearGroups.flatMap(yg => yg.subjects);
  const selectedSubject = allSubjects.find(s => s.id === selectedSubjectId);
  const selectedTopic = selectedSubject?.topics.find(t => t.id === selectedTopicId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Choose Activity</h2>
            <p className="text-sm text-gray-500">{child.name}&apos;s schedule</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allSubjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubjectId(subject.id);
                    setSelectedTopicId(null);
                    setSelectedLessonId(null);
                  }}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedSubjectId === subject.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-800 text-sm">{subject.name}</div>
                  <div className="text-xs text-gray-500">{subject.topics.length} topics</div>
                </button>
              ))}
            </div>
          </div>

          {selectedSubject && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <div className="grid grid-cols-2 gap-2">
                {selectedSubject.topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setSelectedLessonId(null);
                    }}
                    className={`p-3 rounded-lg border text-left transition ${
                      selectedTopicId === topic.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-800 text-sm">{topic.name}</div>
                    <div className="text-xs text-gray-500">{topic.lessons.length} lessons</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTopic && selectedTopic.lessons.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lesson</label>
              <div className="space-y-2">
                {selectedTopic.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full p-3 rounded-lg border text-left transition ${
                      selectedLessonId === lesson.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-800 text-sm">{lesson.title}</div>
                    {lesson.completed && (
                      <span className="text-xs text-green-600">✓ Completed</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => onSelect('', '', '', 'Free Time', 'Free Time')}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition"
            >
              <span className="font-medium">Free Time</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedSubject && selectedTopic && selectedLessonId) {
                onSelect(
                  selectedSubject.id,
                  selectedTopic.id,
                  selectedLessonId,
                  selectedSubject.name,
                  selectedTopic.lessons.find(l => l.id === selectedLessonId)?.title || ''
                );
              }
            }}
            disabled={!selectedSubjectId || !selectedTopicId || !selectedLessonId}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
