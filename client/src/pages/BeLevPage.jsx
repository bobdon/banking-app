import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import BeLevLogo from '../components/BeLevLogo';
import SendMoneyForm from '../components/SendMoneyForm';
import RequestMoneyForm from '../components/RequestMoneyForm';
import ActivityFeed from '../components/ActivityFeed';

export default function BeLevPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      {/* Hero */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <BeLevLogo size="lg" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Send money. BeLev it.
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="Send" />
          <Tab label="Request" />
          <Tab label="Activity" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        {tab === 0 && <SendMoneyForm />}
        {tab === 1 && <RequestMoneyForm />}
        {tab === 2 && <ActivityFeed />}
      </Paper>

      {/* Demo hint */}
      <Alert severity="info" variant="outlined" sx={{ mt: 3 }} icon={false}>
        <Typography variant="body2" fontWeight={600}>Demo accounts</Typography>
        <Typography variant="body2">jane@example.com &bull; bob@example.com</Typography>
        <Typography variant="caption" color="text.secondary">Password: password123</Typography>
      </Alert>
    </Box>
  );
}
