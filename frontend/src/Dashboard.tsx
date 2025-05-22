import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  IconButton,
  Drawer,
  List,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Button,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Opacity as OpacityIcon,
  Settings as SettingsIcon,
  ShowChart as ShowChartIcon,
  Refresh as RefreshIcon,
  WaterDrop as WaterDropIcon,
  LocalFlorist as LocalFloristIcon
} from '@mui/icons-material';

// Define TypeScript interfaces
interface SensorReading {
  plantId: number;
  moisture: number;
  timestamp: string;
  formattedTime?: string;
  formattedDate?: string;
}

// Dashboard component
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Fetch data function
  const fetchReadings = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('api/readings');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: SensorReading[] = await response.json();

      // Sort data by plantId for consistent display
      const sortedData = [...data].sort((a, b) => a.plantId - b.plantId);

      // Format timestamps for display
      const formattedData = sortedData.map(reading => ({
        ...reading,
        formattedTime: new Date(reading.timestamp).toLocaleTimeString(),
        formattedDate: new Date(reading.timestamp).toLocaleDateString(),
      }));

      setReadings(formattedData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching readings:', error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchReadings();

    // Set up polling - every 5 minutes (adjust as needed)
    const intervalId = setInterval(fetchReadings, 1 * 60 * 1000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Get moisture status based on reading
  const getMoistureStatus = (moisture: number): { text: string; color: string; severity: 'success' | 'warning' | 'error' } => {
    if (moisture < 30) {
      return { text: 'Needs water!', color: '#d32f2f', severity: 'error' };
    } else if (moisture < 60) {
      return { text: 'Moderate', color: '#ed6c02', severity: 'warning' };
    } else {
      return { text: 'Well watered', color: '#2e7d32', severity: 'success' };
    }
  };

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    if (readings.length === 0) return { average: 0, needsWater: 0, healthy: 0 };

    const totalMoisture = readings.reduce((sum, reading) => sum + reading.moisture, 0);
    const averageMoisture = totalMoisture / readings.length;
    const needsWater = readings.filter(r => r.moisture < 30).length;
    const healthy = readings.filter(r => r.moisture >= 60).length;

    return { average: averageMoisture, needsWater, healthy };
  };

  const metrics = calculateMetrics();
  const drawerWidth = 240;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {/* App Bar */}
        <AppBar
          position="absolute"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ...(drawerOpen && {
              marginLeft: drawerWidth,
              width: `calc(100% - ${drawerWidth}px)`,
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }),
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(drawerOpen && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Plant Moisture Dashboard
            </Typography>
            {lastUpdated && (
              <Typography variant="body2" color="inherit">
                Updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <IconButton color="inherit" onClick={fetchReadings}>
              <RefreshIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={drawerOpen}
          onClose={isMobile ? toggleDrawer : undefined}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              position: 'relative',
              whiteSpace: 'nowrap',
              width: drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: 'border-box',
              ...(!drawerOpen && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                  width: theme.spacing(9),
                },
              }),
            },
          }}
        >
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListItemButton selected>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <OpacityIcon />
              </ListItemIcon>
              <ListItemText primary="Moisture Levels" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <ShowChartIcon />
              </ListItemIcon>
              <ListItemText primary="Trends" />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </List>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            backgroundColor: theme.palette.grey[100],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar /> {/* Spacer for AppBar */}
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {loading && readings.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
              </Box>
            ) : readings.length === 0 ? (
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 200,
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No plant data available yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={fetchReadings}
                  sx={{ mt: 2 }}
                >
                  Refresh Data
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {/* Metrics Summary */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: theme.palette.primary.main,
                      color: 'white'
                    }}
                  >
                    <Typography component="h2" variant="h6" gutterBottom>
                      Average Moisture
                    </Typography>
                    <Typography component="p" variant="h3">
                      {metrics.average.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <OpacityIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Across {readings.length} plants
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: '#d32f2f',
                      color: 'white'
                    }}
                  >
                    <Typography component="h2" variant="h6" gutterBottom>
                      Needs Water
                    </Typography>
                    <Typography component="p" variant="h3">
                      {metrics.needsWater}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <WaterDropIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Plants that need attention
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: '#2e7d32',
                      color: 'white'
                    }}
                  >
                    <Typography component="h2" variant="h6" gutterBottom>
                      Healthy
                    </Typography>
                    <Typography component="p" variant="h3">
                      {metrics.healthy}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <LocalFloristIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Plants with good moisture
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Plant Cards */}
                {readings.map(reading => {
                  const status = getMoistureStatus(reading.moisture);
                  return (
                    <Grid size={{ xs: 12, md: 6, sm: 4 }} key={reading.plantId}>
                      <Card>
                        <CardHeader
                          title={`Plant ${reading.plantId}`}
                          titleTypographyProps={{ variant: 'h6' }}
                          sx={{
                            backgroundColor: status.color,
                            color: 'white',
                          }}
                        />
                        <CardContent>
                          <Typography variant="h4" component="div" sx={{ mb: 2 }}>
                            {reading.moisture.toFixed(1)}%
                          </Typography>

                          <Box sx={{ width: '100%', mb: 2 }}>
                            <Box sx={{ width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 1, height: 8 }}>
                              <Box
                                sx={{
                                  width: `${Math.min(100, reading.moisture)}%`,
                                  backgroundColor: status.color,
                                  height: 8,
                                  borderRadius: 1,
                                }}
                              />
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: status.color,
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Status: {status.text}
                            </Typography>
                          </Box>

                          <Typography variant="body2" color="text.secondary">
                            Last updated: {reading.formattedTime} on {reading.formattedDate}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
