import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { apiFetch, formatCurrency } from '../lib/api';

export default function TransferForm() {
  const [accounts, setAccounts] = useState([]);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/api/accounts').then(data => {
      setAccounts(data.accounts);
      if (data.accounts.length >= 2) {
        setFromId(String(data.accounts[0].id));
        setToId(String(data.accounts[1].id));
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await apiFetch('/api/accounts/transfer', {
        body: {
          fromAccountId: parseInt(fromId),
          toAccountId: parseInt(toId),
          amount: parseFloat(amount),
          description: description || undefined,
        },
      });
      setSuccess(`Transferred ${formatCurrency(Math.round(parseFloat(amount) * 100))} successfully!`);
      setAmount('');
      setDescription('');
      const updated = await apiFetch('/api/accounts');
      setAccounts(updated.accounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (accounts.length < 2) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
        You need at least two accounts to make transfers.
      </Typography>
    );
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        select
        label="From account"
        value={fromId}
        onChange={e => setFromId(e.target.value)}
      >
        {accounts.map(a => (
          <MenuItem key={a.id} value={String(a.id)} disabled={String(a.id) === toId}>
            {a.name} ({formatCurrency(a.balance)})
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="To account"
        value={toId}
        onChange={e => setToId(e.target.value)}
      >
        {accounts.map(a => (
          <MenuItem key={a.id} value={String(a.id)} disabled={String(a.id) === fromId}>
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
        label="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="What's this transfer for?"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={submitting || fromId === toId}
        size="large"
      >
        {submitting ? 'Transferring...' : 'Transfer'}
      </Button>
    </Stack>
  );
}
