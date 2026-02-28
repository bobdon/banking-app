import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TransferForm from '../components/TransferForm';

export default function TransferPage() {
  return (
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Transfer</Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <TransferForm />
      </Paper>
    </Box>
  );
}
