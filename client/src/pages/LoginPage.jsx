import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2 }}>
      <Box sx={{ maxWidth: 420, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Logo size="lg" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email address"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              size="large"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" underline="hover">
            Sign up
          </Link>
        </Typography>

        <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', display: 'block', mt: 2 }}>
          Demo: jane@example.com / bob@example.com &bull; password123
        </Typography>
      </Box>
    </Box>
  );
}
