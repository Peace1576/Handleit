'use client';

import { useEffect, useState } from 'react';
import type { GeneratedResult } from '@/types';
import { Copy, Download, Mail, Link2, Save, Unplug } from 'lucide-react';

interface Props {
  result: string | GeneratedResult;
  color: string;
  toolId?: string;
}

export function ResultDisplay({ result, color, toolId }: Props) {
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
        if (!response.ok) throw new Error('Could not load Gmail connection.');
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
        setGmailError(prev => prev ?? 'Could not verify Gmail status right now. You can still try connecting.');
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
  }, [toolId, hasComplaintDraft]);

  useEffect(() => {
    if (toolId !== 'letter' || !hasComplaintDraft) return;
    const params = new URLSearchParams(window.location.search);
    const rawError = params.get('gmail_error');
    if (!rawError) return;

    const friendlyMessage =
      rawError === 'gmail_connect_config'
        ? 'Gmail connection is not fully configured on the server yet.'
        : rawError === 'gmail_missing_refresh_token'
        ? 'Google connected, but no refresh token was returned. Remove the app from Google permissions, then connect again.'
        : 'Gmail connection failed. Double-check the Google OAuth setup and try again.';

    setGmailError(friendlyMessage);
  }, [toolId, hasComplaintDraft]);

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
    <div class="title">HandleIt Result</div>
    <div class="brand">Generated by HandleIt</div>
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
      setGmailMessage('Gmail disconnected.');
    } catch (error) {
      setGmailError(error instanceof Error ? error.message : 'Could not disconnect Gmail.');
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
      if (!response.ok) throw new Error(data.error ?? 'Could not create Gmail draft.');
      setGmailMessage('Saved to Gmail drafts. Review it in Gmail before sending.');
      window.open('https://mail.google.com/mail/u/0/#drafts', '_blank', 'noopener,noreferrer');
    } catch (error) {
      setGmailError(error instanceof Error ? error.message : 'Could not create Gmail draft.');
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
          <div className="section-label" style={{ color, marginBottom: 8 }}>Result</div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 22 }}>Your output is ready.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="secondary-btn" onClick={handleCopy}>
            <Copy size={15} />
            {copied ? 'Copied' : 'Copy'}
          </button>
          {toolId === 'letter' && (
            <button className="secondary-btn" onClick={handleDownloadPdf}>
              <Download size={15} />
              {downloading ? 'Opening...' : 'Download PDF'}
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
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Email draft tools</div>
          </div>

          <div className="auto-grid" style={{ marginBottom: 14 }}>
            <div style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Detected company</div>
              <div style={{ color: 'rgba(245,249,255,0.84)', fontSize: 14, lineHeight: 1.6 }}>
                {complaintDraft.companyName ?? 'Could not confidently detect one'}
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Suggested recipient</div>
              <div style={{ color: 'rgba(245,249,255,0.84)', fontSize: 14, lineHeight: 1.6 }}>
                {complaintDraft.recipientName ?? 'Customer Relations Team'}
                {complaintDraft.recipientRole ? ` · ${complaintDraft.recipientRole}` : ''}
              </div>
            </div>
          </div>

          <div className="auto-grid" style={{ marginBottom: 14 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span className="section-label">Recipient email</span>
              <input
                className="text-input"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="support@company.com"
              />
            </label>
            <label style={{ display: 'grid', gap: 8 }}>
              <span className="section-label">Subject</span>
              <input
                className="text-input"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Complaint regarding recent experience"
              />
            </label>
          </div>

          <div className="status-banner status-info" style={{ marginBottom: 14 }}>
            {gmailLoading
              ? 'Checking Gmail connection...'
              : gmailConnected
              ? `Connected Gmail: ${gmailEmail ?? 'Google account connected'}`
              : 'Connect Gmail to save this complaint as a draft. If the AI could not find the right email, type it above first.'}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!gmailConnected ? (
              <button className="primary-btn" onClick={handleConnectGmail}>
                <Link2 size={15} />
                Connect Gmail
              </button>
            ) : (
              <>
                <button className="primary-btn" disabled={savingDraft || !emailSubject.trim()} onClick={handleSaveDraft}>
                  <Save size={15} />
                  {savingDraft ? 'Saving draft...' : 'Save to Gmail drafts'}
                </button>
                <button className="secondary-btn" disabled={disconnecting} onClick={handleDisconnectGmail}>
                  <Unplug size={15} />
                  {disconnecting ? 'Disconnecting...' : 'Disconnect Gmail'}
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
