import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Check, X, Save, Filter, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  fetchCurriculumLibrary,
  saveCuratedPlaylist,
  deleteCuratedPlaylist,
  verifyPlaylist
} from '../lib/curriculumLibrary';
import { validateTopic, getCurriculumSuggestions, isAgeAppropriate } from '../lib/curriculumValidator';
import { CuratedPlaylist, ProfileTemplate } from '../types';
import { generateUuid } from '../lib/helpers';
import { DS, Card, Shadow } from './design-system';

interface Props {
  onBack: () => void;
}

const YEAR_GROUPS: { id: ProfileTemplate; label: string; age: string }[] = [
  { id: 'Y1-2', label: 'Y1-2', age: '5-7 years' },
  { id: 'Y3-4', label: 'Y3-4', age: '7-9 years' },
  { id: 'Y5-6', label: 'Y5-6', age: '9-11 years' },
  { id: 'Y7-9', label: 'Y7-9', age: '11-14 years' },
  { id: 'Y10-11', label: 'Y10-11', age: '14-16 years' },
  { id: 'Y12-13', label: 'Y12-13', age: '16-18 years' },
];

const SUBJECTS = [
  'English', 'Maths', 'Science', 'History', 'Geography',
  'Modern Language', 'Art & Design', 'Music', 'Drama',
  'Computing', 'Design & Technology', 'PE', 'PSHE', 'RE'
];

export const CurriculumLibrary: React.FC<Props> = ({ onBack }) => {
  const [playlists, setPlaylists] = useState<CuratedPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<ProfileTemplate | 'all'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [showUnverified, setShowUnverified] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<Partial<CuratedPlaylist>>({
    yearGroup: 'Y1-2',
    subject: 'English',
    topic: '',
    focus: '',
    primaryPlaylist: '',
    backupPlaylist1: '',
    backupPlaylist2: '',
    notes: '',
    outcomes: '',
    verified: false,
    addedBy: 'admin'
  });

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    const data = await fetchCurriculumLibrary();
    setPlaylists(data);
    setLoading(false);
  };

  const filteredPlaylists = playlists.filter(p => {
    if (filterYear !== 'all' && p.yearGroup !== filterYear) return false;
    if (filterSubject !== 'all' && p.subject !== filterSubject) return false;
    if (!showUnverified && !p.verified) return false;
    return true;
  });

  const handleImport = async (data: any) => {
    // data can be an array or a single object
    const items = Array.isArray(data) ? data : [data];
    let count = 0;
    for (const item of items) {
      // Basic validation
      if (!item.topic && !item.subject) continue;

      const playlist = {
        id: item.id || generateUuid(),
        yearGroup: item.yearGroup || item.year_group || 'Y5-6',
        subject: item.subject || '',
        topic: item.topic || '',
        focus: item.focus || '',
        primaryPlaylist: item.primaryPlaylist || item.primary_playlist || '',
        backupPlaylist1: item.backupPlaylist1 || item.backup_playlist_1,
        backupPlaylist2: item.backupPlaylist2 || item.backup_playlist_2,
        notes: item.notes,
        outcomes: item.outcomes,
        verified: !!item.verified,
        addedBy: item.addedBy || item.added_by || 'admin',
        createdAt: item.createdAt || item.created_at || new Date().toISOString()
      };

      await saveCuratedPlaylist(playlist);
      count++;
    }
    alert(`Imported ${count} playlists`);
    await loadLibrary();
  };

  const handleSave = async () => {
    if (!formData.topic || !formData.focus || !formData.primaryPlaylist) {
      alert('Please fill in topic, focus, and primary playlist');
      return;
    }

    const validation = validateTopic(
      formData.yearGroup as ProfileTemplate,
      formData.subject || '',
      formData.topic,
      formData.focus
    );

    if (!validation.isValid && !confirm(`Validation warnings:\n${validation.issues.join('\n')}\n\nSave anyway?`)) {
      return;
    }

    const playlist: CuratedPlaylist = {
      id: editingId || generateUuid(),
      yearGroup: formData.yearGroup as ProfileTemplate,
      subject: formData.subject || 'English',
      topic: formData.topic,
      focus: formData.focus,
      primaryPlaylist: formData.primaryPlaylist,
      backupPlaylist1: formData.backupPlaylist1,
      backupPlaylist2: formData.backupPlaylist2,
      notes: formData.notes,
      outcomes: formData.outcomes,
      verified: formData.verified || false,
      addedBy: 'admin',
      createdAt: new Date().toISOString()
    };

    await saveCuratedPlaylist(playlist);
    await loadLibrary();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this playlist?')) return;
    await deleteCuratedPlaylist(id);
    await loadLibrary();
  };

  const handleVerify = async (id: string, verified: boolean) => {
    await verifyPlaylist(id, verified);
    await loadLibrary();
  };

  const handleEdit = (p: CuratedPlaylist) => {
    setFormData(p);
    setEditingId(p.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      yearGroup: 'Y1-2',
      subject: 'English',
      topic: '',
      focus: '',
      primaryPlaylist: '',
      backupPlaylist1: '',
      backupPlaylist2: '',
      notes: '',
      outcomes: '',
      verified: false,
      addedBy: 'admin'
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getAgeWarning = (p: CuratedPlaylist) => {
    if (isAgeAppropriate(p.yearGroup, p.topic)) return null;
    return (
      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">
        May be inappropriate for {p.yearGroup}
      </span>
    );
  };

  const getValidationStatus = () => {
    if (!formData.yearGroup || !formData.topic) return null;
    return validateTopic(
      formData.yearGroup as ProfileTemplate,
      formData.subject || '',
      formData.topic,
      formData.focus || ''
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading curriculum library...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Curriculum Library</h1>
        <span className="text-gray-500">({playlists.length} playlists)</span>
      </div>

      <div className="p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value as ProfileTemplate | 'all')}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Year Groups</option>
            {YEAR_GROUPS.map(y => (
              <option key={y.id} value={y.id}>{y.label} ({y.age})</option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer">
            <input
              type="checkbox"
              checked={showUnverified}
              onChange={(e) => setShowUnverified(e.target.checked)}
            />
            Show Unverified
          </label>

          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const text = await file.text();
                try {
                  const imported = JSON.parse(text);
                  handleImport(imported);
                } catch (err) {
                  alert('Invalid JSON file');
                }
              };
              input.click();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <Filter size={18} /> Import from Applet
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={18} /> Add Playlist
          </button>
        </div>

        {filteredPlaylists.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-gray-500">
              No playlists found. Add some to get started!
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPlaylists.map(p => (
              <div key={p.id}>
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{p.subject}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-sm text-gray-600">{p.yearGroup}</span>
                        {p.verified ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <X size={16} className="text-red-500" />
                        )}
                        {getAgeWarning(p)}
                      </div>
                      <div className="font-medium">{p.topic}</div>
                      <div className="text-sm text-gray-500">{p.focus}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Primary: {p.primaryPlaylist.slice(0, 50)}...
                        {p.backupPlaylist1 && <span> | Backup1: {p.backupPlaylist1.slice(0, 30)}...</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(p.id, !p.verified)}
                        className={`p-2 rounded ${p.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        title={p.verified ? 'Unverify' : 'Verify'}
                      >
                        {p.verified ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 bg-blue-100 text-blue-700 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 bg-red-100 text-red-700 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Playlist' : 'Add New Playlist'}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Year Group</label>
                  <select
                    value={formData.yearGroup}
                    onChange={(e) => setFormData({ ...formData, yearGroup: e.target.value as ProfileTemplate })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {YEAR_GROUPS.map(y => (
                      <option key={y.id} value={y.id}>{y.label} ({y.age})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Topic *</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Reading Comprehension, Algebra, Fractions"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Focus *</label>
                  <input
                    type="text"
                    value={formData.focus}
                    onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                    placeholder="e.g., Narrative Writing, Times Tables"
                    className="w-full px-3 py-2 border rounded"
                  />
                  {formData.yearGroup && formData.topic && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      {(() => {
                        const v = validateTopic(
                          formData.yearGroup as ProfileTemplate,
                          formData.subject || '',
                          formData.topic,
                          formData.focus || ''
                        );
                        if (v.isValid) {
                          return (
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle size={16} />
                              <span>Matches UK National Curriculum for {formData.yearGroup}</span>
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-1">
                            {v.issues.map((issue, i) => (
                              <div key={i} className="flex items-start gap-2 text-amber-700">
                                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                                <span>{issue}</span>
                              </div>
                            ))}
                            {v.suggestions.slice(0, 2).map((sug, i) => (
                              <div key={i} className="text-gray-600 text-xs ml-5">{sug}</div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Primary Playlist URL *</label>
                  <input
                    type="text"
                    value={formData.primaryPlaylist}
                    onChange={(e) => setFormData({ ...formData, primaryPlaylist: e.target.value })}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Backup Playlist 1</label>
                  <input
                    type="text"
                    value={formData.backupPlaylist1}
                    onChange={(e) => setFormData({ ...formData, backupPlaylist1: e.target.value })}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Backup Playlist 2</label>
                  <input
                    type="text"
                    value={formData.backupPlaylist2}
                    onChange={(e) => setFormData({ ...formData, backupPlaylist2: e.target.value })}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Learning Outcomes</label>
                  <textarea
                    value={formData.outcomes}
                    onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    />
                    Verified (ready for use)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Save size={18} /> Save
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumLibrary;
