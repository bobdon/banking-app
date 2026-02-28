import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { apiFetch } from '../lib/api';

export default function RequestMoneyForm() {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await apiFetch('/api/belev/request', {
        body: {
          recipientEmail,
          amount: parseFloat(amount),
          memo: memo || undefined,
        },
      });
      setSuccess(data.message);
      setRecipientEmail('');
      setAmount('');
      setMemo('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        label="Request from (email)"
        type="email"
        required
        value={recipientEmail}
        onChange={e => setRecipientEmail(e.target.value)}
        placeholder="friend@example.com"
      />

      <TextField
        label="Amount ($)"
        type="number"
        inputProps={{ step: '0.01', min: '0.01' }}
        required
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <TextField
        label="Memo (optional)"
        value={memo}
        onChange={e => setMemo(e.target.value)}
        placeholder="What's this for?"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={submitting}
        size="large"
        sx={{ bgcolor: '#ec4899', '&:hover': { bgcolor: '#db2777' } }}
      >
        {submitting ? 'Requesting...' : 'Request Money'}
      </Button>
    </Stack>
  );
}
