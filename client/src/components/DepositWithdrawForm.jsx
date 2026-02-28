import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { apiFetch } from '../lib/api';

export default function DepositWithdrawForm({ accountId, onSuccess }) {
  const [mode, setMode] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch(`/api/accounts/${accountId}/${mode}`, {
        body: {
          amount: parseFloat(amount),
          description: description || undefined,
        },
      });
      setAmount('');
      setDescription('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, val) => val && setMode(val)}
        fullWidth
        size="small"
      >
        <ToggleButton value="deposit" color="success">Deposit</ToggleButton>
        <ToggleButton value="withdraw" color="error">Withdraw</ToggleButton>
      </ToggleButtonGroup>

      {error && <Alert severity="error">{error}</Alert>}

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
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={submitting}
        color={mode === 'deposit' ? 'success' : 'error'}
      >
        {submitting ? 'Processing...' : mode === 'deposit' ? 'Deposit' : 'Withdraw'}
      </Button>
    </Stack>
  );
}
