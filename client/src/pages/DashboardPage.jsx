import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, formatCurrency } from '../lib/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import AccountCard from '../components/AccountCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('checking');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiFetch('/api/accounts')
      .then(data => setAccounts(data.accounts))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const data = await apiFetch('/api/accounts', { body: { name: newName, type: newType } });
      setAccounts(prev => [...prev, data.account]);
      setNewName('');
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Welcome back, {user?.firstName}</Typography>
        <Typography variant="body1" color="text.secondary">
          Total balance: <strong>{formatCurrency(totalBalance)}</strong>
        </Typography>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Your Accounts</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(!showCreate)}
        >
          New Account
        </Button>
      </Stack>

      {showCreate && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Stack component="form" onSubmit={handleCreate} direction="row" spacing={2} alignItems="flex-end">
            <TextField
              label="Account name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              select
              label="Type"
              value={newType}
              onChange={e => setNewType(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="checking">Checking</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </Stack>
        </Paper>
      )}

      {accounts.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 8 }}>
          No accounts yet. Create one to get started!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {accounts.map(account => (
            <Grid size={{ xs: 12, md: 6 }} key={account.id}>
              <AccountCard account={account} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
