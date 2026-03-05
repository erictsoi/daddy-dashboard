import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, AlertTriangle, Download, Upload, Trash2 } from 'lucide-react';
import { parseRawData, validateAllPlaylists, PlaylistRow } from '../data/curriculumData';
import { validateTopic, CurriculumValidationResult } from '../lib/curriculumValidator';
import { getCurriculumForYear, getTopicsForSubject } from '../data/ukCurriculum';
import { ProfileTemplate } from '../types';
import { Card, Shadow, DS, IconButton } from './design-system';
import { Youtube, ExternalLink, Play, Search, Star, Info } from 'lucide-react';

interface Props {
  onBack: () => void;
}

interface ValidationResult {
  row: PlaylistRow;
  validation: CurriculumValidationResult;
  valid: boolean;
}

export const CurriculumValidator: React.FC<Props> = ({ onBack }) => {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [summary, setSummary] = useState<{ total: number; valid: number; invalid: number; byYear: Record<string, { total: number; valid: number }> } | null>(null);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'invalid'>('all');
  const [savedData, setSavedData] = useState<PlaylistRow[]>([]);

  useEffect(() => {
    runValidation();
    const saved = localStorage.getItem('curriculum_test_data');
    if (saved) {
      try {
        setSavedData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved curriculum data:', e);
        localStorage.removeItem('curriculum_test_data');
      }
    }
  }, []);

  const runValidation = () => {
    const data = validateAllPlaylists();
    setResults(data);

    const totals = {
      total: data.length,
      valid: data.filter(r => r.valid).length,
      invalid: data.filter(r => !r.valid).length,
      byYear: {} as Record<string, { total: number; valid: number }>,
    };

    for (const r of data) {
      if (!totals.byYear[r.row.profile]) {
        totals.byYear[r.row.profile] = { total: 0, valid: 0 };
      }
      totals.byYear[r.row.profile].total++;
      if (r.valid) totals.byYear[r.row.profile].valid++;
    }

    setSummary(totals);
  };

  const filteredResults = results.filter(r => {
    if (filterYear !== 'all' && r.row.profile !== filterYear) return false;
    if (filterStatus === 'valid' && !r.valid) return false;
    if (filterStatus === 'invalid' && r.valid) return false;
    return true;
  });

  const saveToLocalStorage = () => {
    const rows = parseRawData();
    localStorage.setItem('curriculum_test_data', JSON.stringify(rows));
    setSavedData(rows);
    alert(`Saved ${rows.length} playlists to localStorage`);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('curriculum_test_data');
    setSavedData([]);
    alert('Cleared localStorage');
  };

  const exportCSV = () => {
    const headers = ['Profile', 'Subject', 'Topic', 'Focus', 'Primary Playlist', 'Backup 1', 'Backup 2', 'Notes', 'Outcomes', 'Validation'];
    const csvContent = [
      headers.join(','),
      ...results.map(r => [
        r.row.profile,
        `"${r.row.subject}"`,
        `"${r.row.topic}"`,
        `"${r.row.focus}"`,
        `"${r.row.primaryPlaylist}"`,
        `"${r.row.backupPlaylist1}"`,
        `"${r.row.backupPlaylist2}"`,
        `"${r.row.notes}"`,
        `"${r.row.outcomes}"`,
        r.valid ? 'VALID' : `INVALID: ${r.validation.issues.join('; ')}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curriculum_validation.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-white border-b-2 border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <IconButton onClick={onBack} size={42} title="Back">
            <ArrowLeft size={18} />
          </IconButton>
          <div>
            <h1 className="b t-h1" style={{ fontSize: 28, color: DS.ink }}>Curriculum Quality Audit</h1>
            <p className="n t-small" style={{ color: DS.inkSoft, fontWeight: 800 }}>UK NATIONAL STANDARDS COMPLIANCE</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runValidation}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
          >
            Run Audit
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {summary && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Shadow offset={4} size={3} radius={DS.radius.lg}>
              <div className="bg-white p-6 border-2 border-slate-100 rounded-2xl text-center">
                <div className="text-4xl font-black text-slate-800 mb-1">{summary.total}</div>
                <div className="t-label" style={{ color: DS.inkFade }}>PLAYLISTS AUDITED</div>
              </div>
            </Shadow>
            <Shadow offset={4} size={3} radius={DS.radius.lg}>
              <div className="bg-white p-6 border-2 border-green-400 rounded-2xl text-center shadow-lg shadow-green-50">
                <div className="text-4xl font-black text-green-600 mb-1">{summary.valid}</div>
                <div className="t-label" style={{ color: DS.inkFade }}>VERIFIED COMPLIANT</div>
              </div>
            </Shadow>
            <Shadow offset={4} size={3} radius={DS.radius.lg}>
              <div className="bg-white p-6 border-2 border-rose-300 rounded-2xl text-center shadow-lg shadow-rose-50">
                <div className="text-4xl font-black text-rose-600 mb-1">{summary.invalid}</div>
                <div className="t-label" style={{ color: DS.inkFade }}>FAILED STANDARDS</div>
              </div>
            </Shadow>
            <Shadow offset={4} size={3} radius={DS.radius.lg}>
              <div className="bg-white p-6 border-2 border-amber-300 rounded-2xl text-center shadow-lg shadow-amber-50">
                <div className="text-4xl font-black text-amber-600 mb-1">
                  {Math.round((summary.valid / summary.total) * 100)}%
                </div>
                <div className="t-label" style={{ color: DS.inkFade }}>CURRICULUM SCORE</div>
              </div>
            </Shadow>
          </div>
        )}

        <div className="mb-4 flex gap-4 items-center flex-wrap">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Year Groups</option>
            {summary && Object.keys(summary.byYear).map(y => (
              <option key={y} value={y}>{y} ({summary.byYear[y].valid}/{summary.byYear[y].total})</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="valid">Valid Only</option>
            <option value="invalid">Needs Review</option>
          </select>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={runValidation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Re-validate
            </button>
            <button
              onClick={saveToLocalStorage}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Upload size={16} /> Save to Test
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <Download size={16} /> Export CSV
            </button>
            {savedData.length > 0 && (
              <button
                onClick={clearLocalStorage}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 size={16} /> Clear Saved
              </button>
            )}
          </div>
        </div>

        {savedData.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            ✓ {savedData.length} playlists saved to localStorage (ready for testing without Firebase)
          </div>
        )}

        <div className="flex flex-col gap-6">
          {filteredResults.map((r, idx) => {
            const curriculum = getCurriculumForYear(r.row.profile as ProfileTemplate);
            const sub = curriculum?.subjects.find(s => s.subject === r.row.subject);

            return (
              <Shadow key={idx} offset={r.valid ? 2 : 4} size={r.valid ? 2 : 3} radius={DS.radius.lg}>
                <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${r.valid ? 'border-slate-100 opacity-80' : 'border-rose-400 shadow-xl shadow-rose-50'
                  }`}>
                  <div className={`p-4 flex items-center justify-between border-b ${r.valid ? 'bg-slate-50' : 'bg-rose-50/50'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${r.valid ? 'bg-white border-slate-100 text-slate-400' : 'bg-white border-rose-200 text-rose-600'
                        }`}>
                        {r.valid ? <Check size={20} /> : <AlertTriangle size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800">{r.row.subject}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-100 rounded-full">
                            {r.row.profile}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{r.row.topic}</div>
                      </div>
                    </div>
                    {!r.valid && (
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border-2 border-rose-100">
                        INCONSISTENT WITH UK CURRICULUM
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Info size={10} className="text-blue-400" /> Learning Objective
                      </h4>
                      <p className="text-sm text-slate-600 font-bold mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                        "{r.row.focus}"
                      </p>

                      {!r.valid && (
                        <div className="space-y-3">
                          <div className="bg-rose-50 border-2 border-rose-100 rounded-xl p-4">
                            <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">CRITICAL ISSUES</h5>
                            <div className="space-y-1">
                              {r.validation.issues.map((issue, i) => (
                                <div key={i} className="text-xs text-rose-800 font-bold flex gap-2">
                                  <span className="text-rose-400">•</span> {issue}
                                </div>
                              ))}
                            </div>
                          </div>

                          {r.validation.suggestions.length > 0 && (
                            <div className="bg-amber-50 border-2 border-amber-100 rounded-xl p-4">
                              <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">RECOMMENDED CORRECTION</h5>
                              <div className="text-xs text-amber-800 font-bold leading-relaxed">
                                {r.validation.suggestions[0]}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                      <div className="mb-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <Star size={10} className="text-amber-400" /> UK Goals for {r.row.profile}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed bg-blue-50/20 p-3 rounded-xl border border-blue-50">
                          {sub?.description || "Generic UK Standards apply."}
                        </p>
                      </div>

                      <div className="bg-white border-2 border-slate-100 rounded-2xl p-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">PLAYLIST AUDIT</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold">PRIMARY URL</span>
                            <a href={r.row.primaryPlaylist} target="_blank" className="text-blue-500 hover:text-blue-700 transition-colors">
                              <Youtube size={16} />
                            </a>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold">BACKUPS</span>
                            <div className="flex gap-2">
                              {r.row.backupPlaylist1 && <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-500">B1</span>}
                              {r.row.backupPlaylist2 && <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-500">B2</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Shadow>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurriculumValidator;
