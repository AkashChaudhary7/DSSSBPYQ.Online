import React, { useState, useEffect } from 'react';
import { 
  Database, FileJson, FolderOpen, AlertTriangle, CheckCircle, RefreshCw, 
  Upload, Terminal, Copy, Check, ChevronRight, FileCheck, ArrowRight, ShieldAlert,
  List, HelpCircle
} from 'lucide-react';
import { Quiz } from '../types';

interface DataManagerProps {
  staticQuizzes: Quiz[];
}

interface IndexData {
  files: string[];
  computer_topics: Array<{
    code: string;
    title: string;
    folder: string;
    path: string;
    mockCount: number;
  }>;
}

export default function DataManager({ staticQuizzes }: DataManagerProps) {
  // States
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  
  // Validation/Simulation tool states
  const [uploadedTests, setUploadedTests] = useState<Array<{
    fileName: string;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    qCount: number;
    title: string;
    suggestedPath: string;
    generatedMetadata: any;
  }>>([]);
  const [dragActive, setDragActive] = useState(false);

  // Fetch the current server-generated directory index
  const fetchIndex = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/content/index.json?t=' + Date.now()).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setIndexData(data);
      } else {
        throw new Error("Unable to fetch public/content/index.json directory index.");
      }
    } catch (err: any) {
      console.warn(err);
      setError("Failed to load server directory index. Make sure node sync_and_generate.js has been run at least once during build.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndex();
  }, []);

  // Compute orphan files (files in index.json but NOT in quizzes-metadata.json / staticQuizzes)
  const orphanFiles = React.useMemo(() => {
    if (!indexData || !indexData.files) return [];
    
    // Normalize static quiz file paths for strict comparison
    const registeredPaths = new Set(
      staticQuizzes
        .map(q => (q as any).file || '')
        .filter(Boolean)
        .map(p => p.toLowerCase().trim())
    );

    return indexData.files.filter(filePath => {
      const normalized = filePath.toLowerCase().trim();
      return !registeredPaths.has(normalized);
    });
  }, [indexData, staticQuizzes]);

  // Handle Copy Snippet
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Generate metadata snippet for orphan files
  const generateMetadataSnippet = (filePaths: string[]) => {
    const snippets = filePaths.map(filePath => {
      const parts = filePath.split('/');
      const fileName = parts.pop() || 'mock.json';
      const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const formattedTitle = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const testId = `custom_part_b_${cleanName.toLowerCase().replace(/\s+/g, '_')}_50`;
      
      return {
        testId,
        title: formattedTitle,
        totalTimeMinutes: 60,
        markingScheme: { correct: 1, negative: 0.25 },
        category: "part_b",
        subject: "Computer Science",
        topic: "General Practice",
        isPartA: false,
        file: filePath,
        qCount: 50
      };
    });

    return JSON.stringify(snippets, null, 2);
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process raw quiz text / JSON to validate structure & recommend metadata
  const processUploadedFile = async (file: File) => {
    try {
      const text = await file.text();
      let rawData: any;
      try {
        rawData = JSON.parse(text);
      } catch (e) {
        setUploadedTests(prev => [...prev, {
          fileName: file.name,
          isValid: false,
          errors: ["The file is not a valid JSON document. Please fix syntax errors."],
          warnings: [],
          qCount: 0,
          title: "Invalid JSON",
          suggestedPath: "",
          generatedMetadata: null
        }]);
        return;
      }

      let questions: any[] = [];
      if (Array.isArray(rawData)) {
        questions = rawData;
      } else if (rawData && Array.isArray(rawData.questions)) {
        questions = rawData.questions;
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      if (questions.length === 0) {
        errors.push("No questions found. The file must contain an array of question objects.");
      }

      // Check structure of first 5 questions
      questions.slice(0, 5).forEach((q, idx) => {
        if (!q.question && !q.text && !q.q_text) {
          errors.push(`Question #${idx + 1} is missing the "question" or "text" text property.`);
        }
        if (!q.options && !q.choices && !q.answers) {
          errors.push(`Question #${idx + 1} is missing "options" array.`);
        } else {
          const opts = q.options || q.choices || q.answers;
          if (!Array.isArray(opts) || opts.length < 2) {
            errors.push(`Question #${idx + 1} has insufficient options (must be at least 2).`);
          }
        }
        
        let ans = q.answer;
        if (ans === undefined) ans = q.correct_answer || q.correctAnswer || q.ans || q.correct;
        if (ans === undefined) {
          warnings.push(`Question #${idx + 1} is missing a specified "answer" index. Falling back to option A (0).`);
        }
      });

      const qCount = questions.length;
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const formattedTitle = rawData.title || rawData.test_title || baseName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      // Determine topic suggestions
      let suggestedTopic = "General Practice";
      let folderPath = "Computer/Computer Basics and P.C. Software";
      const fileLower = file.name.toLowerCase();
      
      if (fileLower.includes("network") || fileLower.includes("cn_")) {
        suggestedTopic = "Computer Networks";
        folderPath = "Computer/Computer Networks";
      } else if (fileLower.includes("operating") || fileLower.includes("os_")) {
        suggestedTopic = "Operating System";
        folderPath = "Computer/Operating Systems";
      } else if (fileLower.includes("dbms") || fileLower.includes("database")) {
        suggestedTopic = "DBMS";
        folderPath = "Computer/Database Management System (DBMS)";
      } else if (fileLower.includes("software") && fileLower.includes("eng")) {
        suggestedTopic = "Software Engineering";
        folderPath = "Computer/Software Engineering";
      }

      const cleanTitle = fileLower.includes("mock") ? formattedTitle : `${suggestedTopic} Mock Test`;
      const testId = `custom_part_b_${baseName.toLowerCase().replace(/\s+/g, '_')}_${qCount}`;

      const generatedMetadata = {
        testId,
        title: cleanTitle,
        totalTimeMinutes: Math.max(15, Math.ceil(qCount * 1.2)),
        markingScheme: { correct: 1, negative: 0.25 },
        category: "part_b",
        subject: "Computer Science",
        topic: suggestedTopic,
        isPartA: false,
        file: `/${folderPath}/${file.name}`,
        qCount
      };

      setUploadedTests(prev => [...prev, {
        fileName: file.name,
        isValid: errors.length === 0,
        errors,
        warnings,
        qCount,
        title: cleanTitle,
        suggestedPath: `public/${folderPath}/${file.name}`,
        generatedMetadata
      }]);

    } catch (e: any) {
      setUploadedTests(prev => [...prev, {
        fileName: file.name,
        isValid: false,
        errors: [`Processing failed: ${e.message}`],
        warnings: [],
        qCount: 0,
        title: "Load Error",
        suggestedPath: "",
        generatedMetadata: null
      }]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        await processUploadedFile(e.dataTransfer.files[i]);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      for (let i = 0; i < e.target.files.length; i++) {
        await processUploadedFile(e.target.files[i]);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600">
            <Database className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">DSSSB Mock Tests Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight display-font">
            JSON Data Manager &amp; Indexer
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Monitor mock test files, check index integrity, validate raw quiz files, and manage metadata.
          </p>
        </div>

        <button
          onClick={fetchIndex}
          disabled={loading}
          className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-indigo-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto shadow-2xs active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Scanning...' : 'Scan Directory Index'}
        </button>
      </div>

      {/* Directory Integrity & Orphan Detector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
            Server Directory Hierarchy ({indexData?.files?.length || 0} JSON Files Found)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            These files are currently stored in your live workspace. Whenever you run the sync script or trigger a GitHub push, they are structured into the 32 Computer Science Modules automatically.
          </p>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[11px] font-bold text-slate-400">Reading directory content...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded-2xl flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Index Data Missing</p>
                <p className="text-rose-700/90 mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 max-h-[340px] overflow-y-auto bg-slate-50/30">
              {indexData?.files && indexData.files.length > 0 ? (
                indexData.files.map((file, idx) => {
                  const isOrphan = orphanFiles.includes(file);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileJson className={`w-4 h-4 ${isOrphan ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="font-semibold text-slate-700 truncate">{file}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-4">
                        {isOrphan ? (
                          <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md">
                            ⚠️ Mismatch / Orphan
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-md">
                            ✅ Linked &amp; Indexed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">No files detected. Run sync_and_generate.js to begin.</div>
              )}
            </div>
          )}
        </div>

        {/* Missing Metadata & Orphans Helper */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Metadata Integrity
            </h3>
            
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Total Stored Quizzes:</span>
                <span className="text-slate-950">{staticQuizzes.length}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Indexed Files:</span>
                <span className="text-slate-950">{indexData?.files?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600 border-t border-slate-200/60 pt-2">
                <span>Orphaned/Unlinked Files:</span>
                <span className={orphanFiles.length > 0 ? "text-amber-700 font-extrabold" : "text-emerald-700"}>
                  {orphanFiles.length}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              An **Orphan file** is a JSON quiz that is physically on your server but lacks an active registry item in `quizzes-metadata.json`. Thanks to our new **Dynamic Path Resolver**, users can still load these files instantly using their formatted IDs.
            </p>
          </div>

          {orphanFiles.length > 0 ? (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                <span>Generate Metadata Fix:</span>
                <button
                  onClick={() => handleCopy(generateMetadataSnippet(orphanFiles), 'fixed-meta')}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-extrabold text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedText === 'fixed-meta' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedText === 'fixed-meta' ? 'Copied' : 'Copy Fix Array'}
                </button>
              </div>
              <textarea
                readOnly
                value={generateMetadataSnippet(orphanFiles)}
                className="w-full h-[120px] bg-slate-950 text-emerald-400 font-mono text-[9px] p-2.5 rounded-xl focus:outline-none border border-slate-800"
              />
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-950 p-4 rounded-2xl flex items-center gap-2.5 text-xs mt-auto">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Perfect Sync!</p>
                <p className="text-emerald-700/90 text-[11px] mt-0.5">All server files match and are correctly registered in the system metadata.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Validator Tool */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Upload, Validate &amp; Format Raw Mocks
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Drag and drop or select raw quiz files (or simple questions arrays) to validate their compliance. The tool will automatically structure them, detect topics, and formulate the exact metadata parameters required.
          </p>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 relative ${
            dragActive ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileJson className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700">Drag and drop raw mock JSON files here</p>
            <p className="text-[11px] text-slate-400 font-medium">Or choose files from your device to validate</p>
          </div>
          <input
            type="file"
            multiple
            accept=".json"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl pointer-events-none shadow-2xs">
            Browse Files
          </button>
        </div>

        {uploadedTests.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Processed Files ({uploadedTests.length})</h4>
              <button 
                onClick={() => setUploadedTests([])}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Clear List
              </button>
            </div>

            <div className="space-y-4">
              {uploadedTests.map((test, index) => (
                <div key={index} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-3 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className={`w-5 h-5 ${test.isValid ? 'text-emerald-500' : 'text-rose-500'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{test.fileName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Auto-Mapped: <span className="font-bold text-slate-700">{test.title} ({test.qCount} Questions)</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      {test.isValid ? (
                        <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1">
                          Compliant &amp; Safe
                        </span>
                      ) : (
                        <span className="bg-rose-50 border border-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1">
                          Validation Errors
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Errors / Warnings List */}
                  {(test.errors.length > 0 || test.warnings.length > 0) && (
                    <div className="space-y-1">
                      {test.errors.map((err, i) => (
                        <div key={i} className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span>Error: {err}</span>
                        </div>
                      ))}
                      {test.warnings.map((warn, i) => (
                        <div key={i} className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>Warning: {warn}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Steps */}
                  {test.isValid && test.generatedMetadata && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest block">How to add this file</span>
                        <div className="bg-white border border-slate-150 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed space-y-1">
                          <div className="flex items-center gap-1 font-bold text-slate-800">
                            <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px]">1</span>
                            <span>Save this JSON inside the folder:</span>
                          </div>
                          <p className="bg-slate-50 border border-slate-150 px-2 py-1 rounded font-mono text-[9px] text-indigo-950 truncate">{test.suggestedPath}</p>
                          <div className="flex items-center gap-1 font-bold text-slate-800 mt-1.5">
                            <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px]">2</span>
                            <span>Or upload it to `pending_mocks/` directly!</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest">Metadata Registry Block</span>
                          <button
                            onClick={() => handleCopy(JSON.stringify(test.generatedMetadata, null, 2), `meta-${index}`)}
                            className="text-[10px] font-extrabold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedText === `meta-${index}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedText === `meta-${index}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={JSON.stringify(test.generatedMetadata, null, 2)}
                          className="w-full h-[90px] bg-slate-950 text-emerald-400 font-mono text-[9px] p-2 rounded-xl border border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide on Adding Content & GitHub sync */}
      <div className="bg-indigo-950 text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Terminal className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Git &amp; Deployment Guide</span>
          </div>
          <h3 className="text-lg md:text-xl font-black display-font tracking-tight">How Content is Auto-Organized &amp; Synced</h3>
          <p className="text-xs text-indigo-200/80 max-w-2xl">
            You don't need to rebuild the Android App Bundle (AAB/APK) file or make any manual linking modifications when you add new mock tests! Everything is dynamic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center font-black text-indigo-300 text-sm">1</div>
            <h4 className="font-extrabold text-xs">Drop JSON File</h4>
            <p className="text-[11px] text-indigo-200/70 leading-relaxed">
              Place your new raw JSON quiz file into the <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">pending_mocks/</code> directory in GitHub or write it directly in your local system.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center font-black text-indigo-300 text-sm">2</div>
            <h4 className="font-extrabold text-xs">Auto-Sync Script Runs</h4>
            <p className="text-[11px] text-indigo-200/70 leading-relaxed">
              When pushing changes, our GitHub Action or dev compiler executes <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">sync_and_generate.js</code>. This auto-standardizes, auto-classifies, and moves the file to its proper subtopic.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center font-black text-indigo-300 text-sm">3</div>
            <h4 className="font-extrabold text-xs">Instant App Update</h4>
            <p className="text-[11px] text-indigo-200/70 leading-relaxed">
              The live website and the Android AAB webview fetch files instantly over the network. Your content updates live for all your students in real-time!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
