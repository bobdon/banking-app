import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 24, variant: 'body1' },
    md: { icon: 32, variant: 'h6' },
    lg: { icon: 44, variant: 'h5' },
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
        <path d="M24 4L6 12v12c0 11.1 7.68 21.48 18 24 10.32-2.52 18-12.9 18-24V12L24 4z" fill="#4f46e5" />
        <path d="M24 8L10 14.4v9.6c0 8.88 5.98 17.18 14 19.2 8.02-2.02 14-10.32 14-19.2v-9.6L24 8z" fill="#6366f1" />
        <path d="M16 30V18l4 8 4-8 4 8 4-8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <Typography variant={s.variant} sx={{ fontWeight: 700, color: 'primary.main' }}>
        MakBelev{' '}
        <Typography component="span" variant={s.variant} sx={{ fontWeight: 400, color: 'text.secondary' }}>
          Bank
        </Typography>
      </Typography>
    </Box>
  );
}
