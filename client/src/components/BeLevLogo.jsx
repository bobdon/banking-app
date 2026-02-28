export default function BeLevLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { icon: 22, text: 'text-base' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded square background */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#belevGrad)" />

        {/* Paper airplane icon */}
        <path
          d="M14 34L16.5 25.5L24 22L14 34Z"
          fill="rgba(255,255,255,0.5)"
        />
        <path
          d="M14 34L36 13L24 22L14 34Z"
          fill="white"
        />
        <path
          d="M24 22L36 13L16.5 25.5L24 22Z"
          fill="rgba(255,255,255,0.85)"
        />
        <path
          d="M24 22L27 30L36 13L24 22Z"
          fill="rgba(255,255,255,0.65)"
        />

        <defs>
          <linearGradient id="belevGrad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`font-extrabold ${s.text}`}>
        <span className="text-violet-600">Be</span>
        <span className="text-pink-500">Lev</span>
      </span>
    </span>
  );
}
