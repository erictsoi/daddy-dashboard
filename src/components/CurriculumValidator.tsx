import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, AlertTriangle, Download, Upload, Trash2 } from 'lucide-react';
import { parseRawData, validateAllPlaylists, PlaylistRow } from '../data/curriculumData';
import { validateTopic, CurriculumValidationResult } from '../lib/curriculumValidator';
import { ProfileTemplate } from '../types';
import { Card } from './design-system';

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Curriculum Validator</h1>
      </div>

      <div className="p-6">
        {summary && (
          <div className="mb-6 grid grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{summary.total}</div>
              <div className="text-gray-600">Total Playlists</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{summary.valid}</div>
              <div className="text-gray-600">Valid (UK Curriculum)</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{summary.invalid}</div>
              <div className="text-gray-600">Need Review</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">
                {Math.round((summary.valid / summary.total) * 100)}%
              </div>
              <div className="text-gray-600">Match Rate</div>
            </Card>
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

        <div className="space-y-2">
          {filteredResults.map((r, idx) => (
            <Card key={idx} className={`p-3 ${r.valid ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {r.valid ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <X size={18} className="text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{r.row.profile}</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-medium">{r.row.subject}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-600">{r.row.topic}</span>
                  </div>
                  <div className="text-sm text-gray-500">{r.row.focus}</div>
                  {!r.valid && r.validation.issues.length > 0 && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
                      <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                      <div>
                        {r.validation.issues.map((issue, i) => (
                          <div key={i}>{issue}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!r.valid && r.validation.suggestions.length > 0 && (
                    <div className="mt-1 text-sm text-gray-500">
                      Suggestion: {r.validation.suggestions[0]}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurriculumValidator;
