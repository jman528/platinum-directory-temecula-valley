interface RollingHillsProps {
  className?: string;
}

export default function RollingHills({ className = "" }: RollingHillsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 360"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Warm sunset sky glow at the horizon */}
        <radialGradient
          id="pd-sky-glow"
          cx="50%"
          cy="0%"
          r="65%"
          fx="50%"
          fy="0%"
        >
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.22" />
          <stop offset="35%" stopColor="#9B4DCA" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0A0F1A" stopOpacity="0" />
        </radialGradient>

        {/* Gradient for back hills — dark blue with slight transparency */}
        <linearGradient
          id="pd-back-hills-grad"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#0f1b3d" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0f1b3d" stopOpacity="1" />
        </linearGradient>

        {/* Gradient for mid hills */}
        <linearGradient
          id="pd-mid-hills-grad"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#1e1642" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1e1642" stopOpacity="1" />
        </linearGradient>

        {/* Clip paths for vineyard rows */}
        <clipPath id="pd-vineyard-clip-1">
          <path d="M280,205 C420,175 620,195 820,182 C1020,170 1200,188 1380,178 L1440,175 L1440,360 L280,360 Z" />
        </clipPath>
        <clipPath id="pd-vineyard-clip-2">
          <path d="M0,230 C160,200 360,218 560,206 C760,195 960,212 1160,202 C1300,195 1400,208 1440,205 L1440,360 L0,360 Z" />
        </clipPath>
      </defs>

      {/* ── Sky glow band ── */}
      <rect x="0" y="0" width="1440" height="240" fill="url(#pd-sky-glow)" />

      {/* ── Layer 1: Far back hills — dark blue, transparent ── */}
      <path
        d="M-20,250
           C80,215 200,235 340,222
           C480,210 600,230 750,218
           C900,207 1050,228 1200,215
           C1340,204 1410,220 1460,216
           L1460,360 L-20,360 Z"
        fill="url(#pd-back-hills-grad)"
        opacity="0.7"
      />

      {/* ── Layer 2: Mid-back hills with vineyard rows — blue-purple ── */}
      <path
        id="pd-mid-back"
        d="M-20,232
           C60,200 180,218 320,207
           C460,196 600,215 760,203
           C920,192 1080,210 1240,200
           C1360,192 1420,205 1460,202
           L1460,360 L-20,360 Z"
        fill="url(#pd-mid-hills-grad)"
        opacity="0.88"
      />

      {/* Vineyard rows on mid-back hills */}
      <g clipPath="url(#pd-vineyard-clip-1)" opacity="0.35">
        {Array.from({ length: 22 }, (_, i) => (
          <line
            key={`vr1-${i}`}
            x1={290 + i * 53}
            y1={175}
            x2={245 + i * 53}
            y2={360}
            stroke="#7C3AED"
            strokeWidth="0.9"
          />
        ))}
      </g>

      {/* ── Layer 3: Mid hills — purple-mid ── */}
      <path
        d="M-20,255
           C100,222 250,242 420,230
           C590,218 740,238 900,226
           C1060,214 1220,234 1380,223
           C1430,219 1450,225 1460,222
           L1460,360 L-20,360 Z"
        fill="#2d1b4e"
        opacity="0.92"
      />

      {/* Vineyard rows on mid hills — subtle gold tint */}
      <g clipPath="url(#pd-vineyard-clip-2)" opacity="0.28">
        {Array.from({ length: 28 }, (_, i) => (
          <line
            key={`vr2-${i}`}
            x1={10 + i * 52}
            y1={200}
            x2={-28 + i * 52}
            y2={360}
            stroke="#D4AF37"
            strokeWidth="0.7"
          />
        ))}
      </g>

      {/* ── Layer 4: Front hills — deep purple, solid ── */}
      <path
        d="M-20,285
           C60,258 180,275 320,264
           C460,253 580,272 740,260
           C900,248 1060,268 1220,257
           C1360,247 1430,262 1460,258
           L1460,360 L-20,360 Z"
        fill="#1a0533"
      />

      {/* ── Hot air balloon silhouette ── */}
      <g transform="translate(1130, 70)" opacity="0.82">
        {/* Balloon envelope */}
        <ellipse cx="0" cy="0" rx="20" ry="26" fill="#5B21B6" />
        {/* Envelope highlight */}
        <ellipse cx="-5" cy="-8" rx="6" ry="9" fill="#7C3AED" opacity="0.5" />
        {/* Gold outline */}
        <ellipse
          cx="0"
          cy="0"
          rx="20"
          ry="26"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.9"
          opacity="0.55"
        />
        {/* Vertical stripe */}
        <path
          d="M0,-26 C0,-26 0,26 0,26"
          stroke="#D4AF37"
          strokeWidth="0.6"
          opacity="0.35"
        />
        {/* Horizontal band */}
        <path
          d="M-20,0 C-20,0 20,0 20,0"
          stroke="#D4AF37"
          strokeWidth="0.6"
          opacity="0.35"
        />
        {/* Rigging lines to basket */}
        <line
          x1="-12"
          y1="24"
          x2="-7"
          y2="40"
          stroke="#D4AF37"
          strokeWidth="0.7"
          opacity="0.6"
        />
        <line
          x1="12"
          y1="24"
          x2="7"
          y2="40"
          stroke="#D4AF37"
          strokeWidth="0.7"
          opacity="0.6"
        />
        <line
          x1="0"
          y1="26"
          x2="0"
          y2="40"
          stroke="#D4AF37"
          strokeWidth="0.6"
          opacity="0.4"
        />
        {/* Basket */}
        <rect
          x="-8"
          y="40"
          width="16"
          height="10"
          rx="2"
          fill="#2d1b4e"
          stroke="#D4AF37"
          strokeWidth="0.8"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}
