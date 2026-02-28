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
import Grid from '@mui/material/Grid';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(email, password, firstName, lastName);
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
            Create your account
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 4 }}>
          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="First name"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Last name"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </Grid>
            </Grid>

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
              inputProps={{ minLength: 6 }}
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
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </Stack>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
