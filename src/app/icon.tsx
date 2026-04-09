import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="40" y1="28" x2="216" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1A56DB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>

          <path
            d="M60 72C60 49.9 77.9 32 100 32H156C178.1 32 196 49.9 196 72V132C196 154.1 178.1 172 156 172H116L82 202V172H100C77.9 172 60 154.1 60 132V72Z"
            fill="url(#g)"
          />

          <line x1="128" y1="26" x2="128" y2="44" stroke="#1A56DB" strokeWidth="10" strokeLinecap="round" />
          <circle cx="128" cy="18" r="10" fill="#7C3AED" />

          <rect x="82" y="68" width="92" height="64" rx="22" fill="white" fillOpacity="0.16" />
          <circle cx="106" cy="100" r="10" fill="white" />
          <circle cx="150" cy="100" r="10" fill="white" />

          <path
            d="M104 122C110 130 120 134 128 134C136 134 146 130 152 122"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <rect x="68" y="88" width="10" height="24" rx="5" fill="white" fillOpacity="0.9" />
          <rect x="178" y="88" width="10" height="24" rx="5" fill="white" fillOpacity="0.9" />

          <path
            d="M188 46L192.5 59.5L206 64L192.5 68.5L188 82L183.5 68.5L170 64L183.5 59.5L188 46Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
