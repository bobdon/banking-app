import { Link as RouterLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'BeLev', path: '/belev', icon: <SendIcon sx={{ fontSize: 16 }} /> },
    { label: 'Transfer', path: '/transfer' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <RouterLink to="/dashboard" style={{ textDecoration: 'none' }}>
                <Logo size="sm" />
              </RouterLink>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
                {navItems.map(item => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    size="small"
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                      fontWeight: location.pathname === item.path ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Button size="small" color="inherit" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                Log out
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
