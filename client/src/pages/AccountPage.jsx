import { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { apiFetch, formatCurrency } from '../lib/api';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TransactionList from '../components/TransactionList';
import DepositWithdrawForm from '../components/DepositWithdrawForm';

export default function AccountPage() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAccount = useCallback(() => {
    apiFetch(`/api/accounts/${id}`)
      .then(data => setAccount(data.account))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadAccount(); }, [loadAccount]);

  function handleActionSuccess() {
    loadAccount();
    setRefreshKey(k => k + 1);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!account) {
    return <Typography color="error">Account not found.</Typography>;
  }

  return (
    <Box>
      <Button
        component={RouterLink}
        to="/dashboard"
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <div>
            <Typography variant="h5" fontWeight={700}>{account.name}</Typography>
            <Typography variant="caption" color="text.disabled">
              ****{account.account_number.slice(-4)}
            </Typography>
          </div>
          <Chip
            label={account.type}
            size="small"
            color={account.type === 'checking' ? 'primary' : 'success'}
            variant="outlined"
          />
        </Stack>
        <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
          {formatCurrency(account.balance)}
        </Typography>
        <Typography variant="caption" color="text.disabled">Available balance</Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Transaction History</Typography>
            <TransactionList accountId={id} refreshKey={refreshKey} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
            <DepositWithdrawForm accountId={id} onSuccess={handleActionSuccess} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
