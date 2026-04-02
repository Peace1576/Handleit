'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAI } from '@/hooks/useAI';
import { HandleItRobotLogo } from '@/components/Logo';
import { UpgradeModal } from './UpgradeModal';
import { ResultDisplay } from './ResultDisplay';
import { UsageBar } from './UsageBar';
import { Particles } from './Particles';
import { ClipboardList, Mail, MessageCircle, Upload, X, FileText, ImageIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ToolId } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  form: ClipboardList,
  letter: Mail,
  reply: MessageCircle,
};

interface ToolConfig {
  id: ToolId;
  name: string;
  desc: string;
  color: string;
  glow: string;
  placeholder: string;
  companyTypes?: string[];
  allowFileUpload?: boolean;
}

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'image/heic': 'HEIC',
  'image/heif': 'HEIF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'text/plain': 'TXT',
};
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.docx,.doc,.txt';
const MAX_FILE_MB = 20;

interface Props {
  tool: ToolConfig;
}

export function ToolPage({ tool }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [company, setCompany] = useState('Airline');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { generate, result, loading, error } = useAI(() => setShowUpgrade(true));

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Strip the data:mime/type;base64, prefix — Gemini wants raw base64
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = useCallback(async (file: File) => {
    setFileError(null);

    // Determine MIME — browsers sometimes return '' for PDFs on Windows, so fall back to extension
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const EXT_TO_MIME: Record<string, string> = {
      pdf:  'application/pdf',
      jpg:  'image/jpeg',
      jpeg: 'image/jpeg',
      png:  'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
      heif: 'image/heif',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc:  'application/msword',
      txt:  'text/plain',
    };
    const mime = (file.type && ACCEPTED_TYPES[file.type]) ? file.type : (EXT_TO_MIME[ext] ?? '');

    if (!mime || !ACCEPTED_TYPES[mime]) {
      setFileError('Unsupported file type. Please upload a PDF, JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File is too large. Max size is ${MAX_FILE_MB} MB.`);
      return;
    }
    try {
      const base64 = await readFileAsBase64(file);
      setUploadedFile(file);
      setFileData(base64);
      setFileMime(mime);
    } catch {
      setFileError('Could not read file. Please try again.');
    }
  }, []);

  const clearFile = () => {
    setUploadedFile(null);
    setFileData(null);
    setFileMime(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fn = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', fn);
    return () => el.removeEventListener('scroll', fn);
  }, []);

  const handleSubmit = async () => {
    const hasText = input.trim().length > 0;
    const hasFile = !!fileData;
    if (!hasText && !hasFile) return;
    await generate({
      tool_id: tool.id,
      input_text: input,
      company_type: tool.id === 'letter' ? company : undefined,
      ...(hasFile ? { file_data: fileData!, file_mime_type: fileMime! } : {}),
    });
  };

  const canSubmit = !loading && (input.trim().length > 0 || !!fileData);

  return (
    <div ref={containerRef} className="ios-bg" style={{ minHeight: '100vh', overflowY: 'auto', position: 'relative' }}>
      <Particles />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Floating header */}
      <div style={{ position: 'sticky', top: 16, zIndex: 40, padding: '0 16px', pointerEvents: 'none' }}>
        <div className={`nav-bubble specular relative rounded-2xl mx-auto flex items-center justify-between transition-all duration-300 ${scrolled ? 'tab-bar-compact' : 'tab-bar-expanded'}`}
          style={{ maxWidth: 560, pointerEvents: 'all' }}>
          <button onClick={() => router.push('/dashboard')} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            {t.backToDashboard}
          </button>
          <div style={{ fontWeight: 900, fontSize: 17, color: 'white', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <HandleItRobotLogo size={48} /><span><span style={{ color: '#60A5FA' }}>Handle</span>It</span>
          </div>
          <UsageBar />
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 16px 80px' }}>
        {/* Tool card */}
        <div className="glass-card fade-up relative overflow-hidden" style={{ borderRadius: 28, padding: 24, marginBottom: 16 }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: tool.glow, filter: 'blur(40px)', opacity: 0.6, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: tool.color + '22', border: `1px solid ${tool.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(() => { const Icon = TOOL_ICONS[tool.id]; return <Icon size={26} color={tool.color} strokeWidth={1.8} />; })()}
              </div>
            </div>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 4, letterSpacing: '-0.02em' }}>{tool.name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>{tool.desc}</p>

            {tool.id === 'letter' && tool.companyTypes && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{t.companyType}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tool.companyTypes.map(c => (
                    <button key={c} onClick={() => setCompany(c)}
                      style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: company === c ? tool.color + 'cc' : 'rgba(255,255,255,0.08)', color: company === c ? 'white' : 'rgba(255,255,255,0.5)', border: `1px solid ${company === c ? tool.color + '80' : 'rgba(255,255,255,0.1)'}`, backdropFilter: 'blur(10px)' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* File upload zone — only on tools with allowFileUpload */}
            {tool.allowFileUpload && (
              <div style={{ marginBottom: 14 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />

                {uploadedFile ? (
                  /* File preview chip */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: tool.color + '18', border: `1px solid ${tool.color}40` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: tool.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {fileMime?.startsWith('image/') ? <ImageIcon size={18} color={tool.color} /> : <FileText size={18} color={tool.color} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFile.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{(uploadedFile.size / 1024).toFixed(0)} KB · {ACCEPTED_TYPES[fileMime ?? ''] ?? 'File'}</div>
                    </div>
                    <button onClick={clearFile} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <X size={14} color="rgba(255,255,255,0.6)" />
                    </button>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? tool.color : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: 14,
                      padding: '20px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: isDragging ? tool.color + '10' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: tool.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <Upload size={20} color={tool.color} />
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      {t.dropzoneTitle} <span style={{ color: tool.color }}>{t.dropzoneBrowse}</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{t.dropzoneFormats}</div>
                  </div>
                )}

                {fileError && <p style={{ color: '#F87171', fontSize: 12, marginTop: 6, marginBottom: 0 }}>{fileError}</p>}

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 600 }}>{t.orType}</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>
              </div>
            )}

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={uploadedFile ? t.addNotes : tool.placeholder}
              rows={uploadedFile ? 3 : 6}
              className="glass-input w-full rounded-2xl"
              style={{ padding: '16px', fontSize: 14, lineHeight: 1.7, resize: 'none', width: '100%', fontFamily: 'inherit', borderRadius: 16 }}
            />

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full rounded-2xl font-bold text-white mt-3 ${canSubmit ? 'glass-btn-blue' : ''}`}
              style={{ padding: '16px', fontSize: 15, fontWeight: 800, border: 'none', cursor: !canSubmit ? 'not-allowed' : 'pointer', background: !canSubmit ? 'rgba(255,255,255,0.08)' : '', color: !canSubmit ? 'rgba(255,255,255,0.3)' : 'white', borderRadius: 16 }}
            >
              {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span className="spin">◌</span> {t.working}</span> : t.submitBtn}
            </button>

            {error && <p style={{ color: '#F87171', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{error}</p>}
          </div>
        </div>

        {/* Loading shimmer */}
        {loading && (
          <div className="glass-card" style={{ borderRadius: 24, padding: 20, marginBottom: 16 }}>
            {[80, 60, 90, 50, 70].map((w, i) => (
              <div key={i} className="shimmer-line" style={{ height: 12, width: `${w}%`, marginBottom: 10 }} />
            ))}
          </div>
        )}

        {/* Result */}
        {result && !loading && <ResultDisplay result={result} color={tool.color} />}
      </div>
    </div>
  );
}
