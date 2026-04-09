'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAI } from '@/hooks/useAI';
import { useUsage } from '@/hooks/useUsage';
import { HandleItRobotLogo } from '@/components/Logo';
import { UpgradeModal } from './UpgradeModal';
import { ResultDisplay } from './ResultDisplay';
import { UsageBar } from './UsageBar';
import { Particles } from './Particles';
import { createClient } from '@/lib/supabase/client';
import { ClipboardList, Mail, MessageCircle, Upload, X, FileText, ImageIcon, ArrowRight, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GeneratedResult, ToolId } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  form: ClipboardList,
  letter: Mail,
  reply: MessageCircle,
};

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
const LETTER_RESULT_CACHE_KEY = 'handleit_letter_result_v2';
const LEGACY_LETTER_RESULT_CACHE_KEY = 'handleit_letter_result_v1';
const LETTER_RESULT_CACHE_TTL_MS = 30 * 60 * 1000;

interface StoredLetterResult {
  userId: string;
  savedAt: number;
  result: GeneratedResult;
}

interface ToolConfig {
  id: ToolId;
  color: string;
  glow: string;
  allowFileUpload?: boolean;
}

interface Props {
  tool: ToolConfig;
}

function clearStoredLetterResult() {
  localStorage.removeItem(LETTER_RESULT_CACHE_KEY);
  localStorage.removeItem(LEGACY_LETTER_RESULT_CACHE_KEY);
}

function readStoredLetterResult(userId: string | null): GeneratedResult | null {
  if (!userId) {
    clearStoredLetterResult();
    return null;
  }

  localStorage.removeItem(LEGACY_LETTER_RESULT_CACHE_KEY);
  const raw = localStorage.getItem(LETTER_RESULT_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredLetterResult>;
    const cachedResult = parsed.result;
    const isExpired = typeof parsed.savedAt !== 'number' || Date.now() - parsed.savedAt > LETTER_RESULT_CACHE_TTL_MS;
    const hasValidResult = !!cachedResult && typeof cachedResult.text === 'string';

    if (parsed.userId !== userId || isExpired || !hasValidResult) {
      clearStoredLetterResult();
      return null;
    }

    return cachedResult;
  } catch {
    clearStoredLetterResult();
    return null;
  }
}

export function ToolPage({ tool }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const toolCopy = tool.id === 'form'
    ? {
        name: t.formName,
        desc: t.formDesc,
        placeholder: t.formPlaceholder,
        accent: t.tools.form.accent,
        bestFor: t.tools.form.bestFor,
        companyTypes: undefined,
      }
    : tool.id === 'letter'
    ? {
        name: t.letterName,
        desc: t.letterDesc,
        placeholder: t.letterPlaceholder,
        accent: t.tools.letter.accent,
        bestFor: t.tools.letter.bestFor,
        companyTypes: t.tools.companyTypes,
      }
    : {
        name: t.replyName,
        desc: t.replyDesc,
        placeholder: t.replyPlaceholder,
        accent: t.tools.reply.accent,
        bestFor: t.tools.reply.bestFor,
        companyTypes: undefined,
      };
  const [input, setInput] = useState('');
  const [company, setCompany] = useState(toolCopy.companyTypes?.[0] ?? '');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { generate, result, loading, error, hydrate, reset } = useAI(() => setShowUpgrade(true));
  const { plan, uses_remaining, refresh: refreshUsage } = useUsage();

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = useCallback(async (file: File) => {
    setFileError(null);

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const extToMime: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
      heif: 'image/heif',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      txt: 'text/plain',
    };

    const mime = (file.type && ACCEPTED_TYPES[file.type]) ? file.type : (extToMime[ext] ?? '');
    if (!mime || !ACCEPTED_TYPES[mime]) {
      setFileError(t.fileTypeError);
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(t.fileSizeError);
      return;
    }

    try {
      const base64 = await readFileAsBase64(file);
      setUploadedFile(file);
      setFileData(base64);
      setFileMime(mime);
    } catch {
      setFileError(t.toolPage.fileReadError);
    }
  }, [t]);

  const clearFile = () => {
    setUploadedFile(null);
    setFileData(null);
    setFileMime(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearCurrentResult = useCallback(() => {
    reset();
    if (tool.id === 'letter') clearStoredLetterResult();
  }, [reset, tool.id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onScroll = () => setScrolled(element.scrollTop > 20);
    element.addEventListener('scroll', onScroll);
    return () => element.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const companyTypes = toolCopy.companyTypes as readonly string[] | undefined;
    if (tool.id !== 'letter' || !companyTypes?.length) return;
    if (!companyTypes.includes(company)) {
      setCompany(companyTypes[0]);
    }
  }, [company, tool.id, toolCopy.companyTypes]);

  useEffect(() => {
    if (tool.id !== 'letter') return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setViewerUserId(data.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;
      setViewerUserId(currentUserId => {
        if (currentUserId && currentUserId !== nextUserId) {
          clearStoredLetterResult();
          reset();
        }
        if (!nextUserId) {
          clearStoredLetterResult();
          reset();
        }
        return nextUserId;
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [tool.id, reset]);

  useEffect(() => {
    if (tool.id !== 'letter') return;
    const storedResult = readStoredLetterResult(viewerUserId);
    if (storedResult) {
      hydrate(storedResult);
      return;
    }
    if (!viewerUserId) reset();
  }, [tool.id, viewerUserId, hydrate, reset]);

  useEffect(() => {
    if (tool.id !== 'letter') return;
    if (!viewerUserId || !result) {
      if (!result) clearStoredLetterResult();
      return;
    }

    const payload: StoredLetterResult = {
      userId: viewerUserId,
      savedAt: Date.now(),
      result,
    };

    localStorage.setItem(LETTER_RESULT_CACHE_KEY, JSON.stringify(payload));
    localStorage.removeItem(LEGACY_LETTER_RESULT_CACHE_KEY);
  }, [result, tool.id, viewerUserId]);

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
    refreshUsage();
  };

  const canSubmit = !loading && (input.trim().length > 0 || !!fileData);
  const Icon = TOOL_ICONS[tool.id];

  return (
    <div ref={containerRef} className="ios-bg" style={{ minHeight: '100vh', overflowY: 'auto', position: 'relative' }}>
      <Particles />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <div style={{ position: 'sticky', top: 16, zIndex: 40, padding: '0 16px', pointerEvents: 'none' }}>
        <div
          className={`nav-bubble specular page-wrap ${scrolled ? 'tab-bar-compact' : 'tab-bar-expanded'}`}
          style={{ pointerEvents: 'all', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
        >
          <button className="ghost-btn" onClick={() => router.push('/dashboard')}>{t.backToDashboard}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontWeight: 800 }}>
            <HandleItRobotLogo size={44} />
            <span><span style={{ color: '#58A6FF' }}>Handle</span>It</span>
          </div>
          <UsageBar />
        </div>
      </div>

      <div className="page-wrap" style={{ padding: '34px 0 88px' }}>
        <div className="two-column fade-up" style={{ alignItems: 'start', gap: 24, marginBottom: 18 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>{toolCopy.name}</div>
            <h1 style={{ fontSize: 'clamp(30px,4vw,44px)', marginBottom: 12 }}>{toolCopy.name}</h1>
            <p className="section-copy" style={{ maxWidth: 560 }}>{toolCopy.desc}</p>
          </div>

          <div className="surface-card fade-up fade-up-delay-1" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: `${tool.color}18`, border: `1px solid ${tool.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={tool.color} />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{toolCopy.name}</div>
                <div style={{ color: 'rgba(232,241,255,0.5)', fontSize: 13 }}>
                  {toolCopy.bestFor}
                </div>
              </div>
            </div>
            <div style={{ color: 'rgba(232,241,255,0.64)', fontSize: 14, lineHeight: 1.7 }}>
              {t.toolPage.helperText}
            </div>
          </div>
        </div>

        <div className="surface-card fade-up fade-up-delay-1" style={{ padding: 24, marginBottom: 18 }}>
          {tool.id === 'letter' && toolCopy.companyTypes && (
            <div style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>{t.toolPage.companyType}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {toolCopy.companyTypes.map(type => {
                  const selected = company === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setCompany(type)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: 999,
                        border: `1px solid ${selected ? `${tool.color}55` : 'rgba(255,255,255,0.08)'}`,
                        background: selected ? `${tool.color}18` : 'rgba(255,255,255,0.04)',
                        color: selected ? 'white' : 'rgba(232,241,255,0.58)',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tool.allowFileUpload && (
            <div style={{ marginBottom: 18 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>{t.toolPage.optionalFile}</div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              {uploadedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 14, background: `${tool.color}18`, border: `1px solid ${tool.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {fileMime?.startsWith('image/') ? <ImageIcon size={18} color={tool.color} /> : <FileText size={18} color={tool.color} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{uploadedFile.name}</div>
                    <div style={{ color: 'rgba(232,241,255,0.42)', fontSize: 12, marginTop: 4 }}>
                      {(uploadedFile.size / 1024).toFixed(0)} KB · {ACCEPTED_TYPES[fileMime ?? ''] ?? 'File'}
                    </div>
                  </div>
                  <button className="secondary-btn" onClick={clearFile}><X size={14} /></button>
                </div>
              ) : (
                <button
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '22px 18px',
                    borderRadius: 20,
                    border: `1px dashed ${isDragging ? `${tool.color}88` : 'rgba(160,186,215,0.18)'}`,
                    background: isDragging ? `${tool.color}12` : 'rgba(255,255,255,0.03)',
                    color: 'rgba(232,241,255,0.62)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 14, background: `${tool.color}18`, border: `1px solid ${tool.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Upload size={18} color={tool.color} />
                  </div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                    {t.toolPage.dropFile}
                  </div>
                  <div style={{ color: 'rgba(232,241,255,0.42)', fontSize: 12 }}>
                    {t.toolPage.fileFormats.replace('{{size}}', String(MAX_FILE_MB))}
                  </div>
                </button>
              )}

              {fileError && <div className="status-banner status-error" style={{ marginTop: 10 }}>{fileError}</div>}
            </div>
          )}

          <div className="section-label" style={{ marginBottom: 12 }}>{t.toolPage.describeSituation}</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={uploadedFile ? t.addNotes : toolCopy.placeholder}
            rows={uploadedFile ? 4 : 7}
            className="text-area"
            style={{ resize: 'vertical', minHeight: uploadedFile ? 128 : 180, marginBottom: 16 }}
          />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="primary-btn" onClick={handleSubmit} disabled={!canSubmit}>
              {loading ? <><span className="spin">◌</span> {t.working}</> : <>{t.submitBtn} <ArrowRight size={16} /></>}
            </button>

            {(result || input || uploadedFile) && (
              <button className="secondary-btn" onClick={() => { setInput(''); clearFile(); clearCurrentResult(); }}>
                <RotateCcw size={16} />
                {t.toolPage.clear}
              </button>
            )}
          </div>

          {error && <div className="status-banner status-error" style={{ marginTop: 14 }}>{error}</div>}
        </div>

        {loading && (
          <div className="surface-card fade-up" style={{ padding: 22, marginBottom: 18 }}>
            {[90, 78, 66, 85].map((width, index) => (
              <div key={index} className="shimmer-line" style={{ height: 12, width: `${width}%`, marginBottom: 12 }} />
            ))}
          </div>
        )}

        {result && !loading && (
          <>
            <ResultDisplay result={result} color={tool.color} toolId={tool.id} />
            {plan === 'free' && typeof uses_remaining === 'number' && (
              <div className="surface-card" style={{ padding: 18, marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: uses_remaining <= 1 ? '#F4B860' : 'rgba(232,241,255,0.72)', fontWeight: 700, fontSize: 14 }}>
                    {uses_remaining <= 0
                      ? t.toolPage.allFreeUses
                      : uses_remaining === 1
                      ? t.toolPage.oneFreeUse
                      : t.toolPage.manyFreeUses.replace('{{count}}', String(uses_remaining))}
                  </span>
                  <button className="secondary-btn" onClick={() => router.push('/pricing')}>{t.toolPage.upgrade}</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
