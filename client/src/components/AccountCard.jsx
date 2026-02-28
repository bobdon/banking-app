import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { formatCurrency } from '../lib/api';

export default function AccountCard({ account }) {
  const navigate = useNavigate();

  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => navigate(`/accounts/${account.id}`)}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <div>
              <Typography variant="subtitle1" fontWeight={600}>{account.name}</Typography>
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
          <Typography variant="h5" fontWeight={700}>{formatCurrency(account.balance)}</Typography>
          <Typography variant="caption" color="text.disabled">Available balance</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
