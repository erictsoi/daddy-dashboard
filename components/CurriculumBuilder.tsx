import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, FileText, CheckCircle } from 'lucide-react';

interface ParsedRow {
  childName: string;
  yearGroup: string;
  subjectCategory: string;
  subjectName: string;
  lessonTitle: string;
  notes: string;
  videoUrl: string;
  isValid: boolean;
}

interface Props {
  onBack: () => void;
  onImport: (rows: ParsedRow[]) => void;
}

export const CurriculumBuilder: React.FC<Props> = ({ onBack, onImport }) => {
  const [inputText, setInputText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);

  // Parse text whenever it changes
  useEffect(() => {
    if (!inputText.trim()) {
      setParsedRows([]);
      return;
    }

    const rows = inputText.split(/\r?\n/).filter(line => line.trim() !== '').map(line => {
      // Split by tab (excel copy/paste)
      const cols = line.split('\t');
      
      // Expected format: Who | Year | Subject | Subcategory | YT Playlist Focus | Notes | Video Link
      const childName = cols[0]?.trim() || '';
      const yearGroup = cols[1]?.trim() || '';
      const subjectCategory = cols[2]?.trim() || '';
      const subjectName = cols[3]?.trim() || '';
      const lessonTitle = cols[4]?.trim() || '';
      const notes = cols[5]?.trim() || '';
      const videoUrl = cols[6]?.trim() || '';

      const isValid = !!(childName && yearGroup && subjectCategory && subjectName && lessonTitle);

      return {
        childName,
        yearGroup,
        subjectCategory,
        subjectName,
        lessonTitle,
        notes,
        videoUrl,
        isValid
      };
    });

    setParsedRows(rows);
  }, [inputText]);

  const handleImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;
    onImport(validRows);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Curriculum Importer</h1>
              <p className="text-sm text-gray-500">Bulk add lessons from spreadsheet</p>
            </div>
          </div>
          <button 
            onClick={handleImport}
            disabled={parsedRows.filter(r => r.isValid).length === 0}
            className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
              parsedRows.filter(r => r.isValid).length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={18} />
            Import {parsedRows.filter(r => r.isValid).length} Rows
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-blue-500"/> Paste Data Here
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Copy columns from Excel/Sheets: <br/>
              <span className="font-mono bg-gray-100 px-1">Who | Year | Subject | Subcategory | Lesson Title | Notes | Link</span>
            </p>
            <textarea
              className="w-full h-96 p-3 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none whitespace-nowrap overflow-auto"
              placeholder={`Sophia\tYr 5\tEnglish\tReading\tShort Stories\tNotes...\thttps://...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
            <h3 className="font-bold mb-1 flex items-center gap-2">
              <AlertCircle size={16} /> Quick Tips
            </h3>
            <ul className="list-disc pl-4 space-y-1 opacity-80">
              <li>Ensure columns are in the correct order.</li>
              <li>"Who" must match "Adrian" or "Sophia".</li>
              <li>"Subject" is the main category (Maths, English, etc).</li>
              <li>"Subcategory" groups lessons (e.g., Algebra).</li>
            </ul>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Preview Data</h2>
            <div className="flex gap-4 text-xs font-medium">
               <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14}/> {parsedRows.filter(r => r.isValid).length} Valid</span>
               <span className="flex items-center gap-1 text-red-500"><AlertCircle size={14}/> {parsedRows.filter(r => !r.isValid).length} Invalid</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Who</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Lesson</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400 italic">
                      Paste data to see preview...
                    </td>
                  </tr>
                )}
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className={row.isValid ? 'hover:bg-gray-50' : 'bg-red-50'}>
                    <td className="p-3">
                      {row.isValid ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <AlertCircle size={16} className="text-red-500" />
                      )}
                    </td>
                    <td className="p-3 font-medium text-gray-800">{row.childName}</td>
                    <td className="p-3 text-gray-600">{row.yearGroup}</td>
                    <td className="p-3 text-gray-600">{row.subjectCategory}</td>
                    <td className="p-3 text-gray-600">{row.subjectName}</td>
                    <td className="p-3 text-gray-800">{row.lessonTitle}</td>
                    <td className="p-3 text-gray-500 truncate max-w-xs">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
