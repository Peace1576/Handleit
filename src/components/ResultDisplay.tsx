'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCopy } from '@/lib/formatCopy';
import type { GeneratedResult } from '@/types';
import { Copy, Download, Mail, Link2, Save, Unplug } from 'lucide-react';

interface Props {
  result: string | GeneratedResult;
  color: string;
  toolId?: string;
}

export function ResultDisplay({ result, color, toolId }: Props) {
  const { t } = useLanguage();
  const displayText = typeof result === 'string' ? result : result.text;
  const complaintDraft = typeof result === 'string' ? null : (result.complaintDraft ?? null);
  const hasComplaintDraft = !!complaintDraft;

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(toolId === 'letter' && hasComplaintDraft);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState(complaintDraft?.recipientEmail ?? '');
  const [emailSubject, setEmailSubject] = useState(complaintDraft?.subject ?? '');
  const [savingDraft, setSavingDraft] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [gmailMessage, setGmailMessage] = useState<string | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);

  useEffect(() => {
    setRecipientEmail(complaintDraft?.recipientEmail ?? '');
    setEmailSubject(complaintDraft?.subject ?? '');
  }, [complaintDraft?.recipientEmail, complaintDraft?.subject]);

  useEffect(() => {
    if (toolId !== 'letter' || !hasComplaintDraft) {
      setGmailLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    setGmailLoading(true);

    fetch('/api/gmail/status', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(t.resultCard.errors.loadConnection);
        return response.json();
      })
      .then(data => {
        if (!active) return;
        setGmailConnected(!!data.connected);
        setGmailEmail(data.email ?? null);
      })
      .catch(() => {
        if (!active) return;
        setGmailConnected(false);
        setGmailEmail(null);
        setGmailError(prev => prev ?? t.resultCard.errors.verifyStatus);
      })
      .finally(() => {
        if (!active) return;
        window.clearTimeout(timeout);
        setGmailLoading(false);
      });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [toolId, hasComplaintDraft, t]);

  useEffect(() => {
    if (toolId !== 'letter' || !hasComplaintDraft) return;
    const params = new URLSearchParams(window.location.search);
    const rawError = params.get('gmail_error');
    if (!rawError) return;

    const friendlyMessage =
      rawError === 'gmail_connect_config'
        ? t.resultCard.errors.config
        : rawError === 'gmail_missing_refresh_token'
        ? t.resultCard.errors.missingRefresh
        : t.resultCard.errors.connectFailed;

    setGmailError(friendlyMessage);
  }, [toolId, hasComplaintDraft, t]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    const win = window.open('', '_blank');
    if (!win) {
      setDownloading(false);
      return;
    }

    const htmlLines = displayText
      .split('\n')
      .map(line => {
        if (!line.trim()) return '<div style="height:10px"></div>';
        const clean = line.replace(/\*\*/g, '');
        if (line.startsWith('**') || (line.toUpperCase() === line && line.length < 50 && line.trim())) {
          return `<p style="font-weight:700;margin:18px 0 6px;text-transform:uppercase;letter-spacing:0.06em;font-size:13px;color:#334155;">${clean}</p>`;
        }
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return `<p style="margin:0 0 8px;padding-left:16px;">• ${line.slice(2)}</p>`;
        }
        return `<p style="margin:0 0 10px;">${clean}</p>`;
      })
      .join('');

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>HandleIt Result</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 15px;
      line-height: 1.85;
      color: #0f172a;
      max-width: 700px;
      margin: 56px auto;
      padding: 0 36px 80px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: flex-end;
      padding-bottom: 16px;
      border-bottom: 2px solid #0f172a;
      margin-bottom: 28px;
    }
    .brand { color: #64748b; font-size: 12px; font-family: Arial, sans-serif; }
    .title { font-size: 20px; font-weight: 700; }
    .footer {
      margin-top: 48px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      font-size: 11px;
      color: #64748b;
      font-family: Arial, sans-serif;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${t.resultCard.pdfTitle}</div>
    <div class="brand">${t.resultCard.pdfGeneratedBy}</div>
  </div>
  <div>${htmlLines}</div>
  <div class="footer">handleit.help</div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 300);
    };
  </script>
</body>
</html>`);
    win.document.close();
    window.setTimeout(() => setDownloading(false), 1000);
  };

  const handleConnectGmail = () => {
    setGmailError(null);
    setGmailMessage(null);
    window.location.assign('/api/gmail/connect?next=/tools/complaint-letter');
  };

  const handleDisconnectGmail = async () => {
    setDisconnecting(true);
    setGmailError(null);
    setGmailMessage(null);

    try {
      const response = await fetch('/api/gmail/status', { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not disconnect Gmail.');
      setGmailConnected(false);
      setGmailEmail(null);
      setGmailMessage(t.resultCard.gmailDisconnected);
    } catch (error) {
      setGmailError(error instanceof Error ? error.message : t.resultCard.errors.disconnectFailed);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!complaintDraft) return;
    setSavingDraft(true);
    setGmailError(null);
    setGmailMessage(null);

    try {
      const response = await fetch('/api/gmail/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail.trim() || null,
          subject: emailSubject.trim(),
          body: complaintDraft.body,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.resultCard.errors.createDraftFailed);
      setGmailMessage(t.resultCard.draftSaved);
      window.open('https://mail.google.com/mail/u/0/#drafts', '_blank', 'noopener,noreferrer');
    } catch (error) {
      setGmailError(error instanceof Error ? error.message : t.resultCard.errors.createDraftFailed);
    } finally {
      setSavingDraft(false);
    }
  };

  const lines = displayText.split('\n').map((line, index) => {
    if (!line.trim()) return <div key={index} style={{ height: 10 }} />;
    const clean = line.replace(/\*\*/g, '');

    if (line.startsWith('**') || (line.toUpperCase() === line && line.length < 36 && line.trim())) {
      return (
        <div key={index} style={{ color: 'white', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 16, marginBottom: 8 }}>
          {clean}
        </div>
      );
    }

    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={index} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <span style={{ color, marginTop: 2, flexShrink: 0 }}>•</span>
          <span style={{ color: 'rgba(245,249,255,0.78)', fontSize: 14, lineHeight: 1.75 }}>{line.slice(2)}</span>
        </div>
      );
    }

    return (
      <div key={index} style={{ color: 'rgba(245,249,255,0.78)', fontSize: 14, lineHeight: 1.8, marginBottom: 6 }}>
        {clean}
      </div>
    );
  });

  return (
    <div className="surface-card fade-up" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div className="section-label" style={{ color, marginBottom: 8 }}>{t.resultCard.label}</div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 22 }}>{t.resultCard.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="secondary-btn" onClick={handleCopy}>
            <Copy size={15} />
            {copied ? t.resultCard.copied : t.resultCard.copy}
          </button>
          {toolId === 'letter' && (
            <button className="secondary-btn" onClick={handleDownloadPdf}>
              <Download size={15} />
              {downloading ? t.resultCard.opening : t.resultCard.downloadPdf}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {lines}
      </div>

      {toolId === 'letter' && complaintDraft && (
        <div style={{ marginTop: 20 }}>
          <div className="subtle-divider" style={{ marginBottom: 18 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Mail size={18} color={color} />
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{t.resultCard.emailDraftTools}</div>
          </div>

          <div className="auto-grid" style={{ marginBottom: 14 }}>
            <div style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="section-label" style={{ marginBottom: 8 }}>{t.resultCard.detectedCompany}</div>
              <div style={{ color: 'rgba(245,249,255,0.84)', fontSize: 14, lineHeight: 1.6 }}>
                {complaintDraft.companyName ?? t.resultCard.undetectedCompany}
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="section-label" style={{ marginBottom: 8 }}>{t.resultCard.suggestedRecipient}</div>
              <div style={{ color: 'rgba(245,249,255,0.84)', fontSize: 14, lineHeight: 1.6 }}>
                {complaintDraft.recipientName ?? t.resultCard.fallbackRecipient}
                {complaintDraft.recipientRole ? ` · ${complaintDraft.recipientRole}` : ''}
              </div>
            </div>
          </div>

          <div className="auto-grid" style={{ marginBottom: 14 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span className="section-label">{t.resultCard.recipientEmail}</span>
              <input
                className="text-input"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder={t.resultCard.recipientPlaceholder}
              />
            </label>
            <label style={{ display: 'grid', gap: 8 }}>
              <span className="section-label">{t.resultCard.subject}</span>
              <input
                className="text-input"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder={t.resultCard.subjectPlaceholder}
              />
            </label>
          </div>

          <div className="status-banner status-info" style={{ marginBottom: 14 }}>
            {gmailLoading
              ? t.resultCard.checkingGmail
              : gmailConnected
              ? formatCopy(t.resultCard.connectedGmail, { email: gmailEmail ?? t.resultCard.connectedFallback })
              : t.resultCard.connectPrompt}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!gmailConnected ? (
              <button className="primary-btn" onClick={handleConnectGmail}>
                <Link2 size={15} />
                {t.resultCard.connectGmail}
              </button>
            ) : (
              <>
                <button className="primary-btn" disabled={savingDraft || !emailSubject.trim()} onClick={handleSaveDraft}>
                  <Save size={15} />
                  {savingDraft ? t.resultCard.savingDraft : t.resultCard.saveToDrafts}
                </button>
                <button className="secondary-btn" disabled={disconnecting} onClick={handleDisconnectGmail}>
                  <Unplug size={15} />
                  {disconnecting ? t.resultCard.disconnecting : t.resultCard.disconnectGmail}
                </button>
              </>
            )}
          </div>

          {gmailMessage && <div className="status-banner status-success" style={{ marginTop: 14 }}>{gmailMessage}</div>}
          {gmailError && <div className="status-banner status-error" style={{ marginTop: 14 }}>{gmailError}</div>}
        </div>
      )}
    </div>
  );
}
