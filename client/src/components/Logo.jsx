export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 44, text: 'text-3xl' },
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
        {/* Shield shape */}
        <path
          d="M24 4L6 12v12c0 11.1 7.68 21.48 18 24 10.32-2.52 18-12.9 18-24V12L24 4z"
          fill="#4f46e5"
        />
        {/* Inner shield highlight */}
        <path
          d="M24 8L10 14.4v9.6c0 8.88 5.98 17.18 14 19.2 8.02-2.02 14-10.32 14-19.2v-9.6L24 8z"
          fill="#6366f1"
        />
        {/* Currency symbol / M letterform */}
        <path
          d="M16 30V18l4 8 4-8 4 8 4-8v12"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className={`font-bold text-indigo-600 ${s.text}`}>
        MakBelev <span className="font-normal text-gray-500">Bank</span>
      </span>
    </span>
  );
}
