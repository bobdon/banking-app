import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { apiFetch, formatCurrency } from '../lib/api';

export default function SendMoneyForm() {
  const [accounts, setAccounts] = useState([]);
  const [fromId, setFromId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/api/accounts').then(data => {
      setAccounts(data.accounts);
      if (data.accounts.length > 0) {
        setFromId(String(data.accounts[0].id));
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await apiFetch('/api/belev/send', {
        body: {
          recipientEmail,
          fromAccountId: parseInt(fromId),
          amount: parseFloat(amount),
          memo: memo || undefined,
        },
      });
      setSuccess(data.message);
      setRecipientEmail('');
      setAmount('');
      setMemo('');
      const updated = await apiFetch('/api/accounts');
      setAccounts(updated.accounts);
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
        label="Recipient email"
        type="email"
        required
        value={recipientEmail}
        onChange={e => setRecipientEmail(e.target.value)}
        placeholder="friend@example.com"
      />

      <TextField
        select
        label="From account"
        value={fromId}
        onChange={e => setFromId(e.target.value)}
      >
        {accounts.map(a => (
          <MenuItem key={a.id} value={String(a.id)}>
            {a.name} ({formatCurrency(a.balance)})
          </MenuItem>
        ))}
      </TextField>

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
        color="secondary"
        fullWidth
        disabled={submitting || !fromId}
        size="large"
      >
        {submitting ? 'Sending...' : 'Send Money'}
      </Button>
    </Stack>
  );
}
