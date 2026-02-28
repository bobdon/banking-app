import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { apiFetch, formatCurrency, formatDate } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ActivityFeed() {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [processing, setProcessing] = useState(false);

  async function loadActivity() {
    try {
      const [actData, accData] = await Promise.all([
        apiFetch('/api/belev/activity'),
        apiFetch('/api/accounts'),
      ]);
      setActivity(actData.activity);
      setAccounts(accData.accounts);
      if (accData.accounts.length > 0) {
        setSelectedAccountId(String(accData.accounts[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadActivity(); }, []);

  async function handleAccept(transferId) {
    setProcessing(true);
    setActionMsg('');
    try {
      const data = await apiFetch(`/api/belev/${transferId}/accept`, {
        body: { fromAccountId: parseInt(selectedAccountId) },
      });
      setActionMsg(data.message);
      setAcceptingId(null);
      await loadActivity();
    } catch (err) {
      setActionMsg(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleDecline(transferId) {
    setProcessing(true);
    setActionMsg('');
    try {
      const data = await apiFetch(`/api/belev/${transferId}/decline`, { body: {} });
      setActionMsg(data.message);
      await loadActivity();
    } catch (err) {
      setActionMsg(err.message);
    } finally {
      setProcessing(false);
    }
  }

  const statusColors = {
    completed: 'success',
    pending: 'warning',
    declined: 'error',
    cancelled: 'default',
  };

  function getDescription(item) {
    const isSender = item.sender_id === user.id;
    if (item.type === 'send') {
      return isSender
        ? `Sent to ${item.recipient_first_name} ${item.recipient_last_name}`
        : `Received from ${item.sender_first_name} ${item.sender_last_name}`;
    }
    return isSender
      ? `Requested from ${item.recipient_first_name} ${item.recipient_last_name}`
      : `${item.sender_first_name} ${item.sender_last_name} requested`;
  }

  function getAmountColor(item) {
    const isSender = item.sender_id === user.id;
    if (item.type === 'send') return isSender ? 'error.main' : 'success.main';
    if (item.status === 'completed') return isSender ? 'success.main' : 'error.main';
    return 'text.secondary';
  }

  function getAmountPrefix(item) {
    const isSender = item.sender_id === user.id;
    if (item.type === 'send') return isSender ? '- ' : '+ ';
    if (item.status === 'completed') return isSender ? '+ ' : '- ';
    return '';
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {actionMsg && <Alert severity="info">{actionMsg}</Alert>}

      {activity.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
          No BeLev activity yet. Send or request money to get started!
        </Typography>
      ) : (
        activity.map(item => (
          <Card variant="outlined" key={item.id}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {getDescription(item)}
                    </Typography>
                    <Chip label={item.status} size="small" color={statusColors[item.status] || 'default'} />
                  </Stack>
                  {item.memo && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      "{item.memo}"
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                    {formatDate(item.created_at)}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={700} sx={{ color: getAmountColor(item), ml: 2 }}>
                  {getAmountPrefix(item)}{formatCurrency(item.amount)}
                </Typography>
              </Stack>

              {/* Accept/Decline for incoming pending requests */}
              {item.type === 'request' && item.status === 'pending' && item.recipient_id === user.id && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  {acceptingId === item.id ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        select
                        size="small"
                        value={selectedAccountId}
                        onChange={e => setSelectedAccountId(e.target.value)}
                        sx={{ flex: 1 }}
                      >
                        {accounts.map(a => (
                          <MenuItem key={a.id} value={String(a.id)}>
                            {a.name} ({formatCurrency(a.balance)})
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleAccept(item.id)}
                        disabled={processing}
                      >
                        Pay
                      </Button>
                      <Button size="small" onClick={() => setAcceptingId(null)}>Cancel</Button>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={() => setAcceptingId(item.id)}
                      >
                        Accept & Pay
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => handleDecline(item.id)}
                        disabled={processing}
                      >
                        Decline
                      </Button>
                    </Stack>
                  )}
                </>
              )}

              {/* Pending outgoing */}
              {item.type === 'request' && item.status === 'pending' && item.sender_id === user.id && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="warning.main" fontWeight={600}>
                    Waiting for response...
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}
