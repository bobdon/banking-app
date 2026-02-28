import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function BeLevLogo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 22, variant: 'body1' },
    md: { icon: 32, variant: 'h6' },
    lg: { icon: 48, variant: 'h4' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#belevGrad)" />
        <path d="M14 34L16.5 25.5L24 22L14 34Z" fill="rgba(255,255,255,0.5)" />
        <path d="M14 34L36 13L24 22L14 34Z" fill="white" />
        <path d="M24 22L36 13L16.5 25.5L24 22Z" fill="rgba(255,255,255,0.85)" />
        <path d="M24 22L27 30L36 13L24 22Z" fill="rgba(255,255,255,0.65)" />
        <defs>
          <linearGradient id="belevGrad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <Typography variant={s.variant} sx={{ fontWeight: 800 }}>
        <Box component="span" sx={{ color: '#7c3aed' }}>Be</Box>
        <Box component="span" sx={{ color: '#ec4899' }}>Lev</Box>
      </Typography>
    </Box>
  );
}
