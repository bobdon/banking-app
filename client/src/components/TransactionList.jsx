import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { apiFetch, formatCurrency, formatDate } from '../lib/api';

export default function TransactionList({ accountId, refreshKey }) {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    apiFetch(`/api/accounts/${accountId}/transactions?page=${page}&limit=${limit}`)
      .then(data => {
        setTransactions(data.transactions);
        setTotal(data.total);
      });
  }, [accountId, page, refreshKey]);

  if (transactions.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
        No transactions yet.
      </Typography>
    );
  }

  const isCredit = type => type === 'deposit' || type === 'transfer_in';

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(txn => (
              <TableRow key={txn.id} hover>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{formatDate(txn.created_at)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{txn.description}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={txn.type.replace('_', ' ')}
                    size="small"
                    color={isCredit(txn.type) ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={isCredit(txn.type) ? 'success.main' : 'error.main'}
                  >
                    {isCredit(txn.type) ? '+ ' : '- '}{formatCurrency(txn.amount)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(txn.balance_after)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {total > limit && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            size="small"
            variant="outlined"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Typography variant="caption" color="text.secondary">
            Page {page} of {Math.ceil(total / limit)}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={page * limit >= total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </Stack>
      )}
    </Box>
  );
}
