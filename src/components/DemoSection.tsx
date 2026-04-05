'use client';

/**
 * DemoSection — premium animated product demo for the HandleIt landing page.
 *
 * Each tool has 4 rotating scenarios. The demo cycles:
 *   Form S1 → Form S2 → Form S3 → Form S4
 *   → Complaint S1 → S2 → S3 → S4
 *   → AI Reply S1 → S2 → S3 → S4  → (loops back)
 *
 * ─── HOW TO CUSTOMISE ────────────────────────────────────────────────────────
 *  1. Add/edit scenarios  → edit each tool's `scenarios` array below
 *  2. Change headlines    → edit SECTION_TEXT
 *  3. Change CTA link     → edit SECTION_TEXT.cta.href
 *  4. Change speed        → edit TIMING constants
 *  5. Place on page       → <DemoSection /> anywhere in your layout
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION TEXT — swap headlines / CTA here
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_TEXT = {
  eyebrow:     'Live Demo',
  headline:    'See HandleIt in action',
  subheadline: 'Watch how HandleIt turns stressful life admin into a 10-second task.',

  steps: [
    { n: '1', label: 'Paste it in',   sub: 'Drop your form, document, or stressful message' },
    { n: '2', label: 'AI handles it', sub: 'HandleIt processes it in seconds'                },
    { n: '3', label: 'Copy and go',   sub: 'Get a clean, usable result instantly'            },
  ],

  cta: {
    heading: 'Try HandleIt Free',
    sub:     '5 Free Uses — No Card Required',
    button:  'Start Free →',
    href:    '/login',
  },

  features: ['Save time', 'Reduce stress', 'Sound professional', 'Free to start'],
};

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────
type BulletItem  = { icon: string | null; text: string; bold?: boolean };
type ReplyOption = { tone: string; color: string; text: string };

interface ToolResult {
  type:     'bullets' | 'letter' | 'replies';
  title:    string;
  items?:   BulletItem[];
  replies?: ReplyOption[];
}

interface Scenario {
  input:  string;   // ← text that types into the demo input field
  result: ToolResult; // ← AI output shown after processing
}

interface Tool {
  id:          string;
  tab:         string;
  badge:       string;
  accent:      string;
  glow:        string;
  borderColor: string;
  badgeBg:     string;
  placeholder: string;
  scenarios:   Scenario[];  // ← 4 rotating examples per tool
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOOL + SCENARIO DATA
//  Each tool has 4 scenarios. Add more by pushing to the `scenarios` array.
// ─────────────────────────────────────────────────────────────────────────────
const TOOLS: Tool[] = [

  /* ══════════════════════════════════════════════════════════════════════════
     TOOL 1 — FORM EXPLAINER
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id:          'form',
    tab:         '📄  Form Explainer',
    badge:       'Form Explainer',
    accent:      '#60A5FA',
    glow:        'rgba(96,165,250,0.22)',
    borderColor: 'rgba(96,165,250,0.28)',
    badgeBg:     'rgba(96,165,250,0.10)',
    placeholder: 'Paste your form question or confusing clause here…',

    scenarios: [
      // ── Scenario 1 ────────────────────────────────────────────────────────
      {
        input: "What does Box 14 on my W-2 mean? It says 'CASDI' and I'm not sure if I need to do anything with it.",
        result: {
          type:  'bullets',
          title: '📄  Box 14 — CASDI Explained',
          items: [
            { icon: '📌', text: 'CASDI = California State Disability Insurance — a mandatory payroll deduction for California residents.' },
            { icon: '✅', text: "You don't need to report this separately on your federal return. It's informational only." },
            { icon: '💡', text: 'Tip: If filing California state taxes, this amount may be deductible on Schedule A.' },
          ],
        },
      },
      // ── Scenario 2 ────────────────────────────────────────────────────────
      {
        input: "My lease says the landlord has 'right of first refusal' if I want to sublease. What does that actually mean?",
        result: {
          type:  'bullets',
          title: '📄  Right of First Refusal — Explained',
          items: [
            { icon: '📌', text: "Your landlord gets to review any sublease offer you receive before you can accept it — they can approve, match, or block it." },
            { icon: '⚠️', text: 'This is standard, but check the clause for a response deadline (e.g. 10 days). Without one, they can leave you waiting indefinitely.' },
            { icon: '✅', text: 'You still have the right to sublease — this clause just gives the landlord a veto window, not a permanent block.' },
          ],
        },
      },
      // ── Scenario 3 ────────────────────────────────────────────────────────
      {
        input: "My mortgage statement says I have an 'escrow shortage' of $412. What does this mean and what should I do?",
        result: {
          type:  'bullets',
          title: '📄  Escrow Shortage — Explained',
          items: [
            { icon: '📌', text: 'Escrow shortage = your lender collected less than needed to cover your property taxes and/or homeowner\'s insurance this year.' },
            { icon: '💳', text: 'You have two options: pay the $412 as a lump sum now, or spread it over your next 12 monthly payments.' },
            { icon: '✅', text: "This is very common and not a penalty — costs just went up slightly. Paying it upfront saves a small amount of interest." },
          ],
        },
      },
      // ── Scenario 4 ────────────────────────────────────────────────────────
      {
        input: "My loan offer shows an interest rate of 6.5% but the APR is 7.2%. Which one is the real cost of borrowing?",
        result: {
          type:  'bullets',
          title: '📄  APR vs Interest Rate — Explained',
          items: [
            { icon: '📌', text: 'APR (7.2%) is the true total cost — it includes the interest rate plus lender fees, origination charges, and closing costs.' },
            { icon: '💡', text: 'The interest rate (6.5%) only covers what you pay on the loan balance — it ignores all the fees layered on top.' },
            { icon: '✅', text: 'Always compare APRs when shopping loans. A lower rate with high fees can cost more than a higher rate with no fees.' },
          ],
        },
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════════
     TOOL 2 — COMPLAINT LETTER
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id:          'letter',
    tab:         '✉️  Complaint Letter',
    badge:       'Complaint Letter',
    accent:      '#A78BFA',
    glow:        'rgba(167,139,250,0.22)',
    borderColor: 'rgba(167,139,250,0.28)',
    badgeBg:     'rgba(167,139,250,0.10)',
    placeholder: 'Describe what happened in plain English…',

    scenarios: [
      // ── Scenario 1 ────────────────────────────────────────────────────────
      {
        input: 'My airline delayed my flight by 6 hours and refused to give me a refund or any compensation.',
        result: {
          type:  'letter',
          title: '✉️  Complaint Letter — Ready to send',
          items: [
            { icon: null, text: 'Subject: Request for Compensation — 6-Hour Flight Delay',                                                                                                                                                           bold: true  },
            { icon: null, text: 'Dear Customer Relations Team,',                                                                                                                                                                                      bold: false },
            { icon: null, text: 'I am writing to formally request compensation for a 6-hour delay on flight [FLIGHT NO] on [DATE]. Under EC Regulation 261/2004 I am entitled to compensation of up to €600. I expect a written response within 14 days.', bold: false },
            { icon: null, text: 'Sincerely,  [Your Name]',                                                                                                                                                                                            bold: false },
          ],
        },
      },
      // ── Scenario 2 ────────────────────────────────────────────────────────
      {
        input: 'My landlord has ignored my heating repair request for 3 weeks. It is winter and the flat is freezing cold.',
        result: {
          type:  'letter',
          title: '✉️  Complaint Letter — Ready to send',
          items: [
            { icon: null, text: 'Subject: Urgent — Failure to Repair Heating: Legal Obligation to Act',                                                                                                                                             bold: true  },
            { icon: null, text: 'Dear [Landlord Name],',                                                                                                                                                                                             bold: false },
            { icon: null, text: 'I am writing to formally notify you that the central heating has been non-functional for 21 days, breaching your statutory duty to maintain a habitable property. I require repairs within 7 days or I will contact the local housing authority and seek a rent reduction.', bold: false },
            { icon: null, text: 'Regards,  [Your Name]',                                                                                                                                                                                             bold: false },
          ],
        },
      },
      // ── Scenario 3 ────────────────────────────────────────────────────────
      {
        input: 'A subscription service charged me twice this month and customer support keeps ignoring my emails.',
        result: {
          type:  'letter',
          title: '✉️  Complaint Letter — Ready to send',
          items: [
            { icon: null, text: 'Subject: Duplicate Charge — Immediate Refund Required',                                                                                                                                                             bold: true  },
            { icon: null, text: 'Dear Billing Team,',                                                                                                                                                                                                bold: false },
            { icon: null, text: 'My account was charged twice for [AMOUNT] on [DATE]. Despite multiple support requests I have received no response. I require a full refund of the duplicate charge within 5 business days, or I will initiate a chargeback through my bank and report the matter to the relevant consumer authority.', bold: false },
            { icon: null, text: 'Sincerely,  [Your Name]',                                                                                                                                                                                           bold: false },
          ],
        },
      },
      // ── Scenario 4 ────────────────────────────────────────────────────────
      {
        input: 'My new laptop arrived damaged from an online retailer and they are refusing to replace it.',
        result: {
          type:  'letter',
          title: '✉️  Complaint Letter — Ready to send',
          items: [
            { icon: null, text: 'Subject: Damaged Goods — Replacement or Refund Required Under Consumer Law',                                                                                                                                        bold: true  },
            { icon: null, text: 'Dear Customer Service,',                                                                                                                                                                                            bold: false },
            { icon: null, text: 'The laptop I ordered (Order #[ORDER]) arrived with visible damage, rendering it unfit for purpose. Under the Consumer Rights Act 2015 / applicable consumer law, I am entitled to a full replacement or refund. Please confirm your resolution within 7 days or I will escalate to my payment provider and the ombudsman.', bold: false },
            { icon: null, text: 'Sincerely,  [Your Name]',                                                                                                                                                                                           bold: false },
          ],
        },
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════════
     TOOL 3 — AI REPLY
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id:          'reply',
    tab:         '💬  AI Reply',
    badge:       'AI Reply',
    accent:      '#34D399',
    glow:        'rgba(52,211,153,0.22)',
    borderColor: 'rgba(52,211,153,0.28)',
    badgeBg:     'rgba(52,211,153,0.10)',
    placeholder: 'Paste the stressful message you need to reply to…',

    scenarios: [
      // ── Scenario 1 ────────────────────────────────────────────────────────
      {
        input: "Can you explain why this report still isn't done? The deadline was yesterday.",
        result: {
          type:    'replies',
          title:   '💬  Choose your tone',
          replies: [
            { tone: '🤝  Professional', color: '#60A5FA', text: 'Thank you for following up. I apologise for the delay — the completed report will be with you by end of day today.' },
            { tone: '😊  Friendly',     color: '#34D399', text: "Hey! So sorry about that — almost done! I'll have it over to you within the hour." },
            { tone: '💪  Firm',         color: '#FBBF24', text: 'Noted. The completed report will be delivered by 5 pm today.' },
          ],
        },
      },
      // ── Scenario 2 ────────────────────────────────────────────────────────
      {
        input: 'We need to have a serious conversation about your performance this quarter. Please come prepared.',
        result: {
          type:    'replies',
          title:   '💬  Choose your tone',
          replies: [
            { tone: '🤝  Professional', color: '#60A5FA', text: "Thank you for the heads-up. I'll review my recent work and come to the meeting with a clear plan for improvement." },
            { tone: '😊  Friendly',     color: '#34D399', text: "Of course — I appreciate you flagging this. I'll put some notes together beforehand so we can have a productive chat." },
            { tone: '💪  Firm',         color: '#FBBF24', text: "Understood. Please share the specific areas of concern ahead of time so I can prepare accurate responses." },
          ],
        },
      },
      // ── Scenario 3 ────────────────────────────────────────────────────────
      {
        input: 'Invoice #1042 is now 30 days overdue. Please arrange payment immediately or we will escalate this.',
        result: {
          type:    'replies',
          title:   '💬  Choose your tone',
          replies: [
            { tone: '🤝  Professional', color: '#60A5FA', text: "Apologies for the delay — I'm chasing this internally and expect payment to be processed within 48 hours. I will confirm once sent." },
            { tone: '😊  Friendly',     color: '#34D399', text: "So sorry about this! It got stuck in our finance team. I'm pushing it through today and you should see it land shortly." },
            { tone: '💪  Firm',         color: '#FBBF24', text: 'Payment will be processed by [DATE]. Please send confirmation details and I will ensure it is prioritised.' },
          ],
        },
      },
      // ── Scenario 4 ────────────────────────────────────────────────────────
      {
        input: "This presentation isn't what we discussed at all. You'll need to redo the whole thing before tomorrow.",
        result: {
          type:    'replies',
          title:   '💬  Choose your tone',
          replies: [
            { tone: '🤝  Professional', color: '#60A5FA', text: "Thank you for the feedback. I'll revise the presentation to align with what we discussed and send you an updated version by this evening." },
            { tone: '😊  Friendly',     color: '#34D399', text: "Oh no, I'm sorry it missed the mark! Let me jump on it now — I'll get a revised version to you tonight, I promise." },
            { tone: '💪  Firm',         color: '#FBBF24', text: 'Understood. Please confirm the key changes required and I will deliver a revised version by [TIME] tonight.' },
          ],
        },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  TIMING
// ─────────────────────────────────────────────────────────────────────────────
const TYPING_SPEED_MS  = 24;   // ms per character
const PROCESS_DELAY_MS = 1250; // ms for the AI "thinking" animation
const RESULT_HOLD_MS   = 3600; // ms to show result before next scenario
const SCENE_PAUSE_MS   = 320;  // ms pause after typing finishes

// ─────────────────────────────────────────────────────────────────────────────
//  FRAMER VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0  },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.11 } },
};

const bulletVariant = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0   },
};

const replyVariant = {
  hidden:  { opacity: 0, x: 14  },
  visible: { opacity: 1, x: 0   },
};

const itemTransition = { duration: 0.32, ease: 'easeOut' } as const;

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const ThinkingDots: React.FC = () => (
  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', marginRight: 8 }}>
    {[0, 1, 2].map(i => (
      <motion.span key={i}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.13, ease: 'easeInOut' }}
        style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#fff' }}
      />
    ))}
  </span>
);

const ProcessingSkeleton: React.FC = () => (
  <motion.div key="processing"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '20px 18px',
    }}>
    <div style={{
      fontSize: 11, color: 'rgba(255,255,255,0.28)',
      fontFamily: 'Inter, system-ui, sans-serif',
      marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>HandleIt is thinking…</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {([85, 68, 77] as number[]).map((w, i) => (
        <div key={i} className="hi-shimmer"
          style={{ width: `${w}%`, animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  </motion.div>
);

const BulletsResult: React.FC<{ items: BulletItem[] }> = ({ items }) => (
  <motion.div variants={staggerChildren} initial="hidden" animate="visible"
    style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
    {items.map((item, i) => (
      <motion.div key={i} variants={bulletVariant} transition={itemTransition}
        style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          fontSize: 13.5, lineHeight: 1.62,
          color: 'rgba(255,255,255,0.82)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
        {item.icon && <span style={{ flexShrink: 0, marginTop: 1 }}>{item.icon}</span>}
        <span style={{ fontWeight: item.bold ? 600 : 400 }}>{item.text}</span>
      </motion.div>
    ))}
  </motion.div>
);

const LetterResult: React.FC<{ items: BulletItem[] }> = ({ items }) => (
  <motion.div initial="hidden" animate="visible"
    variants={{ visible: { transition: { staggerChildren: 0.13 } } }}>
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: 8,
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 9,
    }}>
      {items.map((item, i) => (
        <motion.div key={i}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }}
          style={{
            fontSize:   i === 0 ? 12.5 : 13,
            fontWeight: item.bold ? 700 : 400,
            color:      item.bold ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.64)',
            fontFamily: item.bold ? 'Inter, system-ui, sans-serif' : 'Georgia, "Times New Roman", serif',
            lineHeight: 1.65,
            paddingBottom: i === 0 ? 10 : 0,
            borderBottom:  i === 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
          {item.text}
        </motion.div>
      ))}
    </div>
    <motion.button
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.3 }}
      style={{
        marginTop: 12,
        background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
        borderRadius: 8, padding: '8px 18px',
        fontSize: 12.5, fontWeight: 600, color: '#A78BFA',
        cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
        letterSpacing: '0.02em',
      }}>
      Copy Letter →
    </motion.button>
  </motion.div>
);

const RepliesResult: React.FC<{ replies: ReplyOption[] }> = ({ replies }) => (
  <motion.div variants={staggerChildren} initial="hidden" animate="visible"
    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {replies.map((r, i) => (
      <motion.div key={i} variants={replyVariant} transition={itemTransition}
        whileHover={{ scale: 1.015 }}
        style={{
          background: `${r.color}10`, border: `1px solid ${r.color}33`,
          borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
        }}>
        <div style={{
          fontSize: 12.5, fontWeight: 700, color: r.color,
          marginBottom: 5, fontFamily: 'Inter, system-ui, sans-serif',
        }}>{r.tone}</div>
        <div style={{
          fontSize: 13, lineHeight: 1.55,
          color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter, system-ui, sans-serif',
        }}>{r.text}</div>
      </motion.div>
    ))}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
type Phase = 'typing' | 'processing' | 'result';

export default function DemoSection() {
  const [toolIdx,     setToolIdx]     = useState(0);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase,       setPhase]       = useState<Phase>('typing');
  const [typed,       setTyped]       = useState(0);

  const tool     = TOOLS[toolIdx];
  const scenario = tool.scenarios[scenarioIdx];

  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearAll = () => { timerIds.current.forEach(id => clearTimeout(id)); timerIds.current = []; };
  const push     = (id: ReturnType<typeof setTimeout>) => { timerIds.current.push(id); return id; };

  /** Jump to a specific tool (tab click / progress dot click) */
  const goTo = useCallback((idx: number) => {
    clearAll();
    setToolIdx(idx);
    setScenarioIdx(0);
    setPhase('typing');
    setTyped(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Advance to the next scenario (or next tool if scenarios exhausted) */
  const goNext = useCallback(() => {
    clearAll();
    setToolIdx(prev => {
      const nextScenario = scenarioIdx + 1;
      if (nextScenario < TOOLS[prev].scenarios.length) {
        // More scenarios in this tool
        setScenarioIdx(nextScenario);
      } else {
        // Move to next tool, reset scenarios
        setScenarioIdx(0);
        return (prev + 1) % TOOLS.length;
      }
      return prev;
    });
    setPhase('typing');
    setTyped(0);
  }, [scenarioIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Run the typing → processing → result sequence */
  useEffect(() => {
    clearAll();
    const input = TOOLS[toolIdx].scenarios[scenarioIdx].input;
    let count = 0;

    push(setTimeout(() => {
      const iv = setInterval(() => {
        count++;
        setTyped(count);
        if (count >= input.length) {
          clearInterval(iv);
          push(setTimeout(() => {
            setPhase('processing');
            push(setTimeout(() => {
              setPhase('result');
              push(setTimeout(goNext, RESULT_HOLD_MS));
            }, PROCESS_DELAY_MS));
          }, SCENE_PAUSE_MS));
        }
      }, TYPING_SPEED_MS);
      timerIds.current.push(iv as unknown as ReturnType<typeof setTimeout>);
    }, 160));

    return clearAll;
  }, [toolIdx, scenarioIdx, goNext]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayText = scenario.input.slice(0, typed);
  const showCursor  = phase === 'typing' && typed < scenario.input.length;

  // Scenario dots: show which scenario is active within the current tool
  const totalScenarios = tool.scenarios.length;

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes hi-cursor-blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes hi-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes hi-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        .hi-cursor {
          display: inline-block; width: 2px; height: 1.1em;
          background: #60A5FA; margin-left: 2px;
          vertical-align: text-bottom;
          animation: hi-cursor-blink 1s step-end infinite;
        }
        .hi-shimmer {
          height: 10px; border-radius: 6px;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 0px,
            rgba(255,255,255,0.11) 80px,
            rgba(255,255,255,0.04) 160px
          );
          background-size: 400px 100%;
          animation: hi-shimmer 1.5s ease-in-out infinite;
        }
        .hi-float { animation: hi-float 5s ease-in-out infinite; }
        .hi-section * { box-sizing: border-box; }
        .hi-tab-full  { display: inline; }
        .hi-tab-short { display: none;   }
        @media (max-width: 560px) {
          .hi-tab-full  { display: none;   }
          .hi-tab-short { display: inline; }
        }
      `}</style>

      <section className="hi-section" style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(64px, 10vw, 112px) clamp(16px, 4vw, 40px)',
        background: 'linear-gradient(180deg, #020817 0%, #050A14 45%, #020817 100%)',
      }}>

        {/* Ambient glows */}
        <div aria-hidden style={{
          position: 'absolute', pointerEvents: 'none',
          top: '-15%', left: '15%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }} />
        <div aria-hidden style={{
          position: 'absolute', pointerEvents: 'none',
          bottom: '-20%', right: '10%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }} />

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* ── Section header ── */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#60A5FA', background: 'rgba(96,165,250,0.08)',
              border: '1px solid rgba(96,165,250,0.22)', borderRadius: 20,
              padding: '5px 16px', marginBottom: 20,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>{SECTION_TEXT.eyebrow}</span>
            <h2 style={{
              fontSize: 'clamp(26px, 5vw, 46px)', fontWeight: 800,
              color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.1,
              margin: '0 0 16px', fontFamily: 'Inter, system-ui, sans-serif',
            }}>{SECTION_TEXT.headline}</h2>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.50)',
              maxWidth: 520, margin: '0 auto', lineHeight: 1.65,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>{SECTION_TEXT.subheadline}</p>
          </motion.div>

          {/* ── App window ── */}
          <motion.div
            className="hi-float"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            style={{
              borderRadius: 20, overflow: 'hidden',
              border: `1px solid ${tool.borderColor}`,
              background: 'rgba(6, 12, 28, 0.97)',
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04),
                          0 28px 90px rgba(0,0,0,0.65),
                          0 0 70px ${tool.glow}`,
              transition: 'border-color 0.55s ease, box-shadow 0.55s ease',
            }}>

            {/* Window chrome */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.022)',
              borderBottom: '1px solid rgba(255,255,255,0.055)',
            }}>
              <div style={{ display: 'flex', gap: 7, marginRight: 14 }}>
                {(['#FF5F57', '#FEBC2E', '#28C840'] as string[]).map((c, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.65 }} />
                ))}
              </div>
              <div style={{
                flex: 1, textAlign: 'center', fontSize: 12,
                color: 'rgba(255,255,255,0.26)', fontFamily: 'Inter, system-ui, sans-serif',
              }}>handleit.help</div>
              <motion.div key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: tool.badgeBg, border: `1px solid ${tool.borderColor}`,
                  borderRadius: 12, padding: '3px 11px',
                  fontSize: 11, fontWeight: 600, color: tool.accent,
                  fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap',
                }}>{tool.badge}</motion.div>
            </div>

            {/* Tool tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.055)',
              background: 'rgba(255,255,255,0.012)',
            }}>
              {TOOLS.map((t, i) => (
                <button key={t.id} onClick={() => goTo(i)} style={{
                  flex: 1, padding: '13px 6px',
                  fontSize: 'clamp(11px, 2vw, 13.5px)',
                  fontWeight: toolIdx === i ? 600 : 400,
                  color: toolIdx === i ? t.accent : 'rgba(255,255,255,0.32)',
                  background: toolIdx === i ? `${t.accent}08` : 'none',
                  border: 'none',
                  borderBottom: toolIdx === i ? `2px solid ${t.accent}` : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  <span className="hi-tab-full">{t.tab}</span>
                  <span className="hi-tab-short">{t.tab.split('  ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Body */}
            <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>

              {/* Input area */}
              <div style={{
                background: 'rgba(255,255,255,0.032)',
                border: `1px solid ${phase === 'typing' ? tool.borderColor : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12, padding: '14px 16px',
                minHeight: 90, marginBottom: 14,
                transition: 'border-color 0.4s ease',
              }}>
                <div style={{
                  fontSize: 'clamp(12.5px, 1.8vw, 14px)', lineHeight: 1.65,
                  color: displayText ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.22)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {displayText || tool.placeholder}
                  {showCursor && <span className="hi-cursor" aria-hidden />}
                </div>
              </div>

              {/* Handle It button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                <motion.button
                  animate={phase === 'processing'
                    ? { scale: [1, 0.96, 1], transition: { duration: 0.18 } }
                    : { scale: 1 }}
                  style={{
                    background: phase === 'result'
                      ? `linear-gradient(135deg, ${tool.accent}22, ${tool.accent}11)`
                      : 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
                    border: phase === 'result'
                      ? `1px solid ${tool.borderColor}`
                      : '1px solid rgba(96,165,250,0.35)',
                    borderRadius: 10, padding: '11px 22px',
                    color: phase === 'result' ? tool.accent : '#FFFFFF',
                    fontSize: 'clamp(12px, 1.8vw, 13.5px)', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif',
                    transition: 'all 0.4s ease',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: phase !== 'typing' ? `0 0 22px ${tool.glow}` : 'none',
                    whiteSpace: 'nowrap',
                  }}>
                  {phase === 'processing' && <><ThinkingDots />Handling it…</>}
                  {phase === 'result'     && <>✓ Done — copy result</>}
                  {phase === 'typing'     && <>Handle It →</>}
                </motion.button>
              </div>

              {/* Result / processing */}
              <AnimatePresence mode="wait">
                {phase === 'processing' && <ProcessingSkeleton key="processing" />}

                {phase === 'result' && (
                  <motion.div
                    key={`result-${toolIdx}-${scenarioIdx}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{    opacity: 0, y: -8  }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background:  `linear-gradient(135deg, ${tool.badgeBg}, rgba(255,255,255,0.012))`,
                      border:      `1px solid ${tool.borderColor}`,
                      borderLeft:  `3px solid ${tool.accent}`,
                      borderRadius: 14,
                      padding:     'clamp(14px, 2.5vw, 20px)',
                    }}>
                    <div style={{
                      fontSize: 'clamp(12px, 1.8vw, 14px)', fontWeight: 700,
                      color: tool.accent, marginBottom: 14,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}>{scenario.result.title}</div>

                    {scenario.result.type === 'bullets' && scenario.result.items && (
                      <BulletsResult items={scenario.result.items} />
                    )}
                    {scenario.result.type === 'letter' && scenario.result.items && (
                      <LetterResult items={scenario.result.items} />
                    )}
                    {scenario.result.type === 'replies' && scenario.result.replies && (
                      <RepliesResult replies={scenario.result.replies} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Progress indicators ── */}
          {/* Tool dots (which tool is active) */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: 10, marginTop: 20,
          }}>
            {TOOLS.map((t, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 0',
                }}>
                {/* Tool pill */}
                <motion.div
                  animate={{ width: toolIdx === i ? 28 : 8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: 8, borderRadius: 4,
                    background: toolIdx === i ? t.accent : 'rgba(255,255,255,0.14)',
                  }}
                />
              </button>
            ))}

            {/* Divider */}
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

            {/* Scenario dots (which scenario within current tool) */}
            {Array.from({ length: totalScenarios }).map((_, i) => (
              <motion.div key={i}
                animate={{
                  background: i === scenarioIdx ? tool.accent : 'rgba(255,255,255,0.14)',
                  scale:      i === scenarioIdx ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{ width: 6, height: 6, borderRadius: '50%' }}
              />
            ))}
          </div>

          {/* Legend */}
          <div style={{
            textAlign: 'center', marginTop: 10, marginBottom: 52,
            fontSize: 11, color: 'rgba(255,255,255,0.25)',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.04em',
          }}>
            scenario {scenarioIdx + 1} of {totalScenarios} · {tool.badge.toLowerCase()}
          </div>

          {/* ── How it works ── */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{ visible: { transition: { staggerChildren: 0.14 } } }}
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
              flexWrap: 'wrap', gap: 0, marginBottom: 60,
            }}>
            {SECTION_TEXT.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ textAlign: 'center', padding: '0 clamp(12px, 3vw, 28px)' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff',
                    margin: '0 auto 10px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxShadow: '0 0 20px rgba(96,165,250,0.25)',
                  }}>{step.n}</div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: '#fff',
                    marginBottom: 5, fontFamily: 'Inter, system-ui, sans-serif',
                  }}>{step.label}</div>
                  <div style={{
                    fontSize: 12.5, color: 'rgba(255,255,255,0.4)',
                    maxWidth: 140, lineHeight: 1.45,
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}>{step.sub}</div>
                </motion.div>
                {i < SECTION_TEXT.steps.length - 1 && (
                  <div style={{
                    color: 'rgba(255,255,255,0.14)', fontSize: 20, fontWeight: 200, marginTop: -22,
                  }}>→</div>
                )}
              </div>
            ))}
          </motion.div>

          {/* ── CTA ── */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-block', width: '100%', maxWidth: 540,
              background: 'rgba(255,255,255,0.022)',
              border: '1px solid rgba(255,255,255,0.075)',
              borderRadius: 24,
              padding: 'clamp(28px, 5vw, 48px) clamp(24px, 6vw, 64px)',
            }}>
              <div style={{
                fontSize: 'clamp(22px, 4.5vw, 38px)', fontWeight: 800,
                color: '#fff', letterSpacing: '-0.025em', marginBottom: 8,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>{SECTION_TEXT.cta.heading}</div>
              <div style={{
                fontSize: 15, color: 'rgba(255,255,255,0.42)', marginBottom: 28,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>{SECTION_TEXT.cta.sub}</div>
              <motion.a
                href={SECTION_TEXT.cta.href}
                whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(96,165,250,0.45)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
                  borderRadius: 12, padding: '16px 48px',
                  fontSize: 16, fontWeight: 700, color: '#fff',
                  textDecoration: 'none',
                  boxShadow: '0 0 36px rgba(96,165,250,0.28)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.01em',
                }}>{SECTION_TEXT.cta.button}</motion.a>
              <div style={{
                display: 'flex', justifyContent: 'center',
                flexWrap: 'wrap', gap: '8px 20px', marginTop: 22,
              }}>
                {SECTION_TEXT.features.map(f => (
                  <span key={f} style={{
                    fontSize: 12.5, color: 'rgba(255,255,255,0.38)',
                    fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap',
                  }}>
                    <span style={{ color: '#34D399', marginRight: 5 }}>✓</span>{f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}
