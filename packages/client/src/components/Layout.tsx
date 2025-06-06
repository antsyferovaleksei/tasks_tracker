import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,

  Assignment,
  Folder,
  Timer,
  Analytics,
  Settings,
  Notifications,
  AccountCircle,
  Logout,
  LightMode,
  DarkMode,
  PlayArrow,
  Pause,
  TaskAlt,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useTheme as useAppTheme, useActiveTimer } from '../hooks';
import { useAppSettingsStore, useNotificationsStore } from '../store';
import { formatDuration } from '../utils';
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();
  const { currentTheme, setTheme } = useAppTheme();
  const { activeTimer } = useActiveTimer();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppSettingsStore();
  const { unreadCount } = useNotificationsStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [timerDuration, setTimerDuration] = useState(0);

  // Update timer duration every second
  React.useEffect(() => {
    if (activeTimer && activeTimer.isRunning) {
      const interval = setInterval(() => {
        const start = new Date(activeTimer.startTime).getTime();
        const now = Date.now();
        setTimerDuration(Math.floor((now - start) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  const menuItems = [
    {
      text: 'Завдання',
      icon: Assignment,
      path: '/tasks',
      color: theme.palette.secondary.main,
    },
    {
      text: 'Проекти',
      icon: Folder,
      path: '/projects',
      color: theme.palette.success.main,
    },
    {
      text: 'Аналітика',
      icon: Analytics,
      path: '/analytics',
      color: theme.palette.warning.main,
    },
    {
      text: 'Налаштування',
      icon: Settings,
      path: '/settings',
      color: theme.palette.info.main,
    },
  ];

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      toggleSidebar();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TaskAlt sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold" color="primary.main">
          Tasks Tracker
        </Typography>
      </Box>

      <Divider />

      {/* Active Timer */}
      <AnimatePresence>
        {activeTimer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Box sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PlayArrow sx={{ fontSize: 16 }} />
                <Typography variant="body2" fontWeight="bold">
                  Активний таймер
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {activeTimer.task?.title || 'Без назви'}
              </Typography>
              <Chip
                label={formatDuration(timerDuration)}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                  fontWeight: 'bold',
                }}
              />
            </Box>
            <Divider />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? `${item.color}15` : 'transparent',
                  color: isActive ? item.color : 'text.primary',
                  '&:hover': {
                    backgroundColor: `${item.color}10`,
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Tasks Tracker'}
          </Typography>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Перемкнути тему">
              <IconButton onClick={toggleTheme}>
                {currentTheme === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Сповіщення">
              <IconButton>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Профіль">
              <IconButton onClick={handleProfileMenuOpen}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Профіль
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Вийти
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: sidebarOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  );
};

export default Layout; 