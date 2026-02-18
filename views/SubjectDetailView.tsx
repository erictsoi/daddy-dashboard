import React from 'react';
import { ChildProfile, Subject, Topic, Lesson, ViewOrigin } from '../types';
import { PlayCircle, CheckCircle, Clock, RotateCcw, Trash2, Play, ChevronRight } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';

interface SubjectDetailProps {
  childId: string;
  subjectId: string;
  origin: ViewOrigin;
  data: ChildProfile[];
  setView: (v: any) => void;
  setData: React.Dispatch<React.SetStateAction<ChildProfile[]>>;
  user: any;
  onAddLesson: (childId: string, subjectId: string, topicId: string, title: string) => void;
  onDeleteTopic: (childId: string, subjectId: string, topicId: string) => void;
  onDeleteSubject: (childId: string, subjectId: string) => void;
  onCompleteLesson: (childId: string, subjectId: string, topicId: string, lessonId: string, timeSpentSeconds: number) => void;
  onRestoreLesson: (childId: string, subjectId: string, topicId: string, lessonId: string) => void;
  onHardDeleteLesson: (childId: string, subjectId: string, topicId: string, lessonId: string) => void;
  onSoftDeleteLesson: (childId: string, subjectId: string, topicId: string, lessonId: string) => void;
  onUpdateTopicFrequency: (childId: string, subjectId: string, topicId: string, frequency: number) => void;
}

export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  childId,
  subjectId,
  origin,
  data,
  setView,
  setData,
  user,
  onAddLesson,
  onDeleteTopic,
  onDeleteSubject,
  onCompleteLesson,
  onRestoreLesson,
  onHardDeleteLesson,
  onSoftDeleteLesson,
  onUpdateTopicFrequency,
}) => {
  const child = data.find(c => c.id === childId);
  const yearGroup = child?.yearGroups.find(y => y.subjects.some(s => s.id === subjectId));
  const subject = yearGroup?.subjects.find(s => s.id === subjectId);
  
  if (!child || !subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Subject Not Found</h2>
          <button
            onClick={() => setView({ type: 'ADMIN' })}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (origin === 'KIDSDASH') {
      setView({ type: 'KIDSDASH', childId });
    } else {
      setView({ type: 'ADMIN' });
    }
  };

  const handleLessonClick = (topicId: string, lessonId: string) => {
    setView({
      type: 'LESSON',
      childId,
      subjectId,
      topicId,
      lessonId,
      origin
    });
  };

  const handleAddTopic = () => {
    const topicName = prompt('Enter topic name:');
    if (!topicName) return;
    
    const newTopic: Topic = {
      id: Math.random().toString(36).substr(2, 9),
      name: topicName,
      lessons: [],
      frequency: 1,
    };
    
    setData(prev => prev.map(c => {
      if (c.id !== childId) return c;
      return {
        ...c,
        yearGroups: c.yearGroups.map(yg => ({
          ...yg,
          subjects: yg.subjects.map(s => {
            if (s.id !== subjectId) return s;
            return {
              ...s,
              topics: [...s.topics, newTopic]
            };
          })
        }))
      };
    }));
  };

  const handleAddLessonToTopic = (topicId: string) => {
    const title = prompt('Enter lesson title:');
    if (!title) return;
    onAddLesson(childId, subjectId, topicId, title);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="rotate-180" size={24} />
            </button>
            <div>
              <p className="text-sm text-gray-500">{child.name} • {yearGroup?.name}</p>
              <h1 className="text-2xl font-bold text-gray-800">{subject.name}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTopic}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Play size={18} /> Add Topic
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {subject.topics.map(topic => {
          const completedLessons = topic.lessons.filter(l => l.completed && !l.deleted).length;
          const totalLessons = topic.lessons.filter(l => !l.deleted).length;
          const activeLessons = topic.lessons.filter(l => !l.deleted);
          
          return (
            <div key={topic.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800">{topic.name}</h3>
                    {completedLessons === totalLessons && totalLessons > 0 && (
                      <CheckCircle size={18} className="text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 max-w-xs">
                      <ProgressBar
                        current={completedLessons}
                        total={totalLessons}
                        colorClass="bg-blue-500"
                        heightClass="h-2"
                      />
                    </div>
                    <span className="text-sm text-gray-500">
                      {completedLessons}/{totalLessons} completed
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddLessonToTopic(topic.id)}
                    className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                  >
                    + Lesson
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete topic "${topic.name}" and all ${topic.lessons.length} lessons?`)) {
                        onDeleteTopic(childId, subjectId, topic.id);
                      }
                    }}
                    className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {activeLessons.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No lessons yet. Click "+ Lesson" to add one.
                  </div>
                ) : (
                  activeLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer group"
                      onClick={() => handleLessonClick(topic.id, lesson.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          lesson.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                        }`}>
                          {lesson.completed ? <CheckCircle size={16} /> : index + 1}
                        </div>
                        <div>
                          <p className={`font-medium ${lesson.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {lesson.title}
                          </p>
                          {lesson.videoUrl && (
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              <PlayCircle size={12} /> Video lesson
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        {lesson.deleted ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestoreLesson(childId, subjectId, topic.id, lesson.id);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Restore"
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Permanently delete this lesson?')) {
                                  onHardDeleteLesson(childId, subjectId, topic.id, lesson.id);
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Permanently Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSoftDeleteLesson(childId, subjectId, topic.id, lesson.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Archive"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
        
        {subject.topics.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <PlayCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">No topics yet</h3>
            <p className="text-gray-500 mb-4">Add your first topic to start organizing lessons</p>
            <button
              onClick={handleAddTopic}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Add First Topic
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
