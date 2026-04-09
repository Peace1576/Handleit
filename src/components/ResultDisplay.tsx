'use client';

import { useEffect, useState } from 'react';
import type { GeneratedResult } from '@/types';

interface Props {
  result: string | GeneratedResult;
  color: string;
  toolId?: string; // 'letter' | 'form' | 'reply'
}

export function ResultDisplay({ result, color, toolId }: Props) {
  const displayText = typeof result === 'string' ? result : result.text;
  const complaintDraft = typeof result === 'string' ? null : (result.complaintDraft ?? null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(toolId === 'letter' && !!complaintDraft);
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
    if (toolId !== 'letter' || !complaintDraft) {
      setGmailLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    setGmailLoading(true);
    fetch('/api/gmail/status', { signal: controller.signal })
      .then(async res => {
        if (!res.ok) {
          throw new Error('Could not load Gmail connection.');
        }
        return res.json();
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
  }, [complaintDraft, toolId]);

  useEffect(() => {
    if (toolId !== 'letter' || !complaintDraft) return;
    const params = new URLSearchParams(window.location.search);
    const rawError = params.get('gmail_error');
    if (!rawError) return;

    const friendlyMessage =
      rawError === 'gmail_connect_config'
        ? 'Gmail connection is not fully configured on the server yet. Double-check the Google OAuth env vars in Vercel and redeploy.'
        : rawError === 'gmail_missing_refresh_token'
        ? 'Google connected, but no refresh token was returned. Remove the app from your Google account permissions, then try connecting again.'
        : 'Gmail connection failed. Double-check your Google OAuth redirect URI and try again.';

    setGmailError(friendlyMessage);
  }, [complaintDraft, toolId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    const win = window.open('', '_blank');
    if (!win) { setDownloading(false); return; }

    const htmlLines = displayText
      .split('\n')
      .map(line => {
        if (!line.trim()) return '<div style="height:10px"></div>';
        const clean = line.replace(/\*\*/g, '');
        if (line.startsWith('**') || (line.toUpperCase() === line && line.length < 50 && line.trim()))
          return `<p style="font-weight:700;margin:18px 0 6px;text-transform:uppercase;letter-spacing:0.06em;font-size:13px;color:#444;">${clean}</p>`;
        if (line.startsWith('• ') || line.startsWith('- '))
          return `<p style="margin:0 0 8px;padding-left:16px;">• ${line.slice(2)}</p>`;
        return `<p style="margin:0 0 10px;">${clean}</p>`;
      })
      .join('');

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>HandleIt — Complaint Letter</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 15px;
      line-height: 1.85;
      color: #111;
      max-width: 680px;
      margin: 60px auto;
      padding: 0 40px 80px;
    }
    .header {
      border-bottom: 2px solid #111;
      padding-bottom: 14px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-brand { font-size: 13px; color: #888; font-family: Arial, sans-serif; }
    .header-title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .footer { margin-top: 60px; border-top: 1px solid #ddd; padding-top: 14px; font-size: 11px; color: #aaa; font-family: Arial, sans-serif; text-align: center; }
    @media print {
      body { margin: 40px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">Complaint Letter</div>
    <div class="header-brand">Generated by HandleIt · handleit.help</div>
  </div>
  <div class="content">${htmlLines}</div>
  <div class="footer">Generated by HandleIt &mdash; handleit.help</div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`);
    win.document.close();
    setTimeout(() => setDownloading(false), 1000);
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
      const res = await fetch('/api/gmail/status', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Could not disconnect Gmail.');
      }
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
      const res = await fetch('/api/gmail/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail.trim() || null,
          subject: emailSubject.trim(),
          body: complaintDraft.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Could not create Gmail draft.');
      }
      setGmailMessage('Saved to Gmail drafts. You can review and send it from Gmail.');
      window.open('https://mail.google.com/mail/u/0/#drafts', '_blank', 'noopener,noreferrer');
    } catch (error) {
      setGmailError(error instanceof Error ? error.message : 'Could not create Gmail draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  const lines = displayText.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
    const clean = line.replace(/\*\*/g, '');
    if (line.startsWith('**') || (line.toUpperCase() === line && line.length < 30 && line.trim()))
      return <div key={i} style={{ fontWeight: 700, color: 'white', marginTop: 16, marginBottom: 6, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>{clean}</div>;
    if (line.startsWith('• ') || line.startsWith('- '))
      return <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}><span style={{ color, marginTop: 3, flexShrink: 0 }}>•</span><span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7 }}>{line.slice(2)}</span></div>;
    return <div key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>{clean}</div>;
  });

  return (
    <div className="glass-card fade-up relative overflow-hidden" style={{ borderRadius: 24, padding: 24 }}>
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: `1px solid ${color}50` }}>✓</div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Your Result</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="glass-btn"
            style={{ padding: '6px 14px', borderRadius: 14, fontSize: 12, fontWeight: 600, color: copied ? '#34D399' : 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.1)', transition: 'all 0.2s', fontFamily: 'inherit' }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>

          {/* PDF Download — only on complaint letters */}
          {toolId === 'letter' && (
            <button
              onClick={handleDownloadPdf}
              className="glass-btn"
              style={{ padding: '6px 14px', borderRadius: 14, fontSize: 12, fontWeight: 600, color: downloading ? '#93C5FD' : 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', background: downloading ? 'rgba(26,86,219,0.2)' : 'rgba(255,255,255,0.1)', transition: 'all 0.2s', fontFamily: 'inherit' }}
            >
              {downloading ? '⏳ Opening…' : '⬇ Download PDF'}
            </button>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
        {lines}
      </div>

      {toolId === 'letter' && complaintDraft && (
        <div style={{ marginTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Email Draft Tools</div>

          <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Detected Company</div>
              <div style={{ color: 'rgba(255,255,255,0.86)', fontSize: 14 }}>{complaintDraft.companyName ?? 'Could not confidently detect one'}</div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Suggested Recipient</div>
              <div style={{ color: 'rgba(255,255,255,0.86)', fontSize: 14 }}>
                {complaintDraft.recipientName ?? 'Customer Relations Team'}
                {complaintDraft.recipientRole ? ` · ${complaintDraft.recipientRole}` : ''}
              </div>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recipient Email</span>
              <input
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="support@company.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 14,
                  fontSize: 14,
                  color: 'white',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subject</span>
              <input
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Complaint regarding recent experience"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 14,
                  fontSize: 14,
                  color: 'white',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </label>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(26,86,219,0.12)', border: '1px solid rgba(96,165,250,0.22)', marginBottom: 14 }}>
            <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 1.6 }}>
              {gmailLoading
                ? 'Checking Gmail connection…'
                : gmailConnected
                ? `Connected Gmail: ${gmailEmail ?? 'Google account connected'}`
                : 'Connect Gmail to save this complaint as a draft. If the AI could not find the company email, you can type it above before saving.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!gmailConnected ? (
              <button
                onClick={handleConnectGmail}
                className="glass-btn-blue"
                style={{ padding: '10px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Connect Gmail
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft || !emailSubject.trim()}
                  className="glass-btn-blue"
                  style={{ padding: '10px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, color: 'white', border: 'none', cursor: savingDraft ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: savingDraft || !emailSubject.trim() ? 0.7 : 1 }}
                >
                  {savingDraft ? 'Saving Draft…' : 'Save to Gmail Drafts'}
                </button>
                <button
                  onClick={handleDisconnectGmail}
                  disabled={disconnecting}
                  className="glass-btn"
                  style={{ padding: '10px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)', border: 'none', cursor: disconnecting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                >
                  {disconnecting ? 'Disconnecting…' : 'Disconnect Gmail'}
                </button>
              </>
            )}
          </div>

          {gmailMessage && (
            <div style={{ marginTop: 12, color: '#86EFAC', fontSize: 13, lineHeight: 1.5 }}>{gmailMessage}</div>
          )}
          {gmailError && (
            <div style={{ marginTop: 12, color: '#FCA5A5', fontSize: 13, lineHeight: 1.5 }}>{gmailError}</div>
          )}
        </div>
      )}
    </div>
  );
}
