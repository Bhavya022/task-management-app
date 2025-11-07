import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Paper, Grid, Box, IconButton, Select, MenuItem, FormControl, InputLabel, Chip, ThemeProvider, createTheme, Tabs, Tab, Badge, Divider, List, ListItem, ListItemText, ListItemIcon, Accordion, AccordionSummary, AccordionDetails, Autocomplete } from '@mui/material';
import { Add, Edit, Delete, Undo, Search, FilterList, GetApp, Publish, Brightness4, Brightness7, PlayArrow, Stop, DateRange, Label, Category, Schedule, ExpandMore, Notifications, NotificationsActive, Save, BarChart, PieChart, TrendingUp, Link, LinkOff } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';

const getTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#64748b',
    },
    background: {
      default: darkMode ? '#121212' : '#f8fafc',
      paper: darkMode ? '#1e1e1e' : '#ffffff',
    },
    success: {
      main: '#059669',
    },
    warning: {
      main: '#d97706',
    },
    error: {
      main: '#dc2626',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: darkMode ? '#ffffff' : '#1e293b',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: darkMode
            ? '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)'
            : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [lastDeletedTask, setLastDeletedTask] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    revenue: '',
    timeTaken: '',
    notes: '',
    priority: 'Low',
    status: 'Pending',
    category: 'General',
    dueDate: '',
    tags: [],
    dependencies: [],
    estimatedTime: '',
    actualTime: '',
    template: ''
  });

  const [loaded, setLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeTracking, setTimeTracking] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [currentFilterPreset, setCurrentFilterPreset] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    productivityTrends: [],
    completionRates: [],
    roiData: []
  });

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedDarkMode = localStorage.getItem('darkMode');
    const storedTimeTracking = localStorage.getItem('timeTracking');
    const storedSavedFilters = localStorage.getItem('savedFilters');

    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      setTasks(parsedTasks);
      setFilteredTasks(parsedTasks);
      checkOverdueTasks(parsedTasks);
      generateAnalyticsData(parsedTasks);
    }

    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }

    if (storedTimeTracking) {
      setTimeTracking(JSON.parse(storedTimeTracking));
    }

    if (storedSavedFilters) {
      setSavedFilters(JSON.parse(storedSavedFilters));
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    checkOverdueTasks(tasks);
    generateAnalyticsData(tasks);
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('timeTracking', JSON.stringify(timeTracking));
  }, [timeTracking]);

  useEffect(() => {
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  useEffect(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || task.status === statusFilter;
      const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;
      const matchesCategory = !selectedTemplate || task.category === selectedTemplate;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags?.includes(tag));
      const matchesDateRange = (!dateRange.start || !dateRange.end) ||
        (new Date(task.createdAt) >= new Date(dateRange.start) && new Date(task.createdAt) <= new Date(dateRange.end));

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesTags && matchesDateRange;
    });
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter, selectedTemplate, selectedTags, dateRange]);



  const calculateROI = (revenue, timeTaken) => {
    const rev = parseFloat(revenue);
    const time = parseFloat(timeTaken);
    if (isNaN(rev) || isNaN(time) || rev === '' || time === '' || time === 0) return '—';
    return (rev / time).toFixed(2);
  };

  const sortedTasks = React.useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const roiA = parseFloat(calculateROI(a.revenue, a.timeTaken)) || 0;
      const roiB = parseFloat(calculateROI(b.revenue, b.timeTaken)) || 0;
      if (roiA !== roiB) return roiB - roiA;

      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const priA = priorityOrder[a.priority];
      const priB = priorityOrder[b.priority];
      if (priA !== priB) return priB - priA;

      const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
      if (dateDiff !== 0) return dateDiff;
      return a.title.localeCompare(b.title);
    });
  }, [filteredTasks]);

  const categoryColors = {
    'General': '#64748b',
    'Development': '#2563eb',
    'Design': '#7c3aed',
    'Marketing': '#dc2626',
    'Research': '#059669'
  };

  const tagColors = {
    'coding': '#2563eb',
    'feature': '#7c3aed',
    'design': '#dc2626',
    'ui': '#059669',
    'marketing': '#d97706',
    'campaign': '#dc2626',
    'research': '#059669',
    'analysis': '#64748b'
  };

  const taskTemplates = {
    'Development': {
      title: 'New Feature Development',
      category: 'Development',
      priority: 'High',
      tags: ['coding', 'feature'],
      estimatedTime: '8',
      notes: 'Implement new feature with proper testing'
    },
    'Design': {
      title: 'UI/UX Design Task',
      category: 'Design',
      priority: 'Medium',
      tags: ['design', 'ui'],
      estimatedTime: '4',
      notes: 'Create mockups and design specifications'
    },
    'Marketing': {
      title: 'Marketing Campaign',
      category: 'Marketing',
      priority: 'Medium',
      tags: ['marketing', 'campaign'],
      estimatedTime: '6',
      notes: 'Plan and execute marketing campaign'
    },
    'Research': {
      title: 'Market Research',
      category: 'Research',
      priority: 'Low',
      tags: ['research', 'analysis'],
      estimatedTime: '3',
      notes: 'Conduct market research and analysis'
    }
  };

  const checkOverdueTasks = (taskList) => {
    const now = new Date();
    const overdue = taskList.filter(task =>
      task.dueDate &&
      new Date(task.dueDate) < now &&
      task.status !== 'Completed'
    );
    setOverdueTasks(overdue);
  };

  const generateAnalyticsData = (taskList) => {
    // Productivity trends (tasks completed over time)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const productivityTrends = last30Days.map(date => {
      const completedOnDate = taskList.filter(task =>
        task.status === 'Completed' &&
        task.updatedAt &&
        task.updatedAt.split('T')[0] === date
      ).length;
      return { date: date.split('-')[2], completed: completedOnDate };
    });

    // Completion rates by category
    const categoryStats = {};
    taskList.forEach(task => {
      const category = task.category || 'General';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0 };
      }
      categoryStats[category].total++;
      if (task.status === 'Completed') {
        categoryStats[category].completed++;
      }
    });

    const completionRates = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      completed: stats.completed,
      total: stats.total,
      rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));

    // ROI data over time
    const roiData = last30Days.map(date => {
      const tasksOnDate = taskList.filter(task =>
        task.createdAt &&
        task.createdAt.split('T')[0] === date
      );
      const totalRevenue = tasksOnDate.reduce((sum, task) => sum + (task.revenue || 0), 0);
      const totalTime = tasksOnDate.reduce((sum, task) => sum + (task.timeTaken || 0), 0);
      const roi = totalTime > 0 ? (totalRevenue / totalTime).toFixed(2) : 0;
      return { date: date.split('-')[2], roi: parseFloat(roi) };
    });

    setAnalyticsData({
      productivityTrends,
      completionRates,
      roiData
    });
  };

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      ...formData,
      revenue: parseFloat(formData.revenue) || 0,
      timeTaken: parseFloat(formData.timeTaken) || 0,
      roi: calculateROI(parseFloat(formData.revenue) || 0, parseFloat(formData.timeTaken) || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: categoryColors[formData.category] || categoryColors['General']
    };
    setTasks([...tasks, newTask]);
    setOpenAdd(false);
    resetForm();
  };

  const handleEditTask = () => {
    const updatedTasks = tasks.map(task =>
      task.id === currentTask.id ? {
        ...task,
        ...formData,
        revenue: parseFloat(formData.revenue) || 0,
        timeTaken: parseFloat(formData.timeTaken) || 0,
        roi: calculateROI(parseFloat(formData.revenue) || 0, parseFloat(formData.timeTaken) || 0),
        updatedAt: new Date().toISOString(),
        color: categoryColors[formData.category] || categoryColors['General']
      } : task
    );
    setTasks(updatedTasks);
    setOpenEdit(false);
    resetForm();
  };

  const handleDeleteTask = () => {
    setLastDeletedTask(currentTask);
    setTasks(tasks.filter(task => task.id !== currentTask.id));
    setIsDeleted(true);
    setSnackbarOpen(true);
    setOpenDelete(false);
  };

  const handleUndoDelete = () => {
    if (lastDeletedTask) {
      setTasks([...tasks, lastDeletedTask]);
      setLastDeletedTask(null);
      setIsDeleted(false);
      setSnackbarOpen(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setLastDeletedTask(null);
    setIsDeleted(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      revenue: '',
      timeTaken: '',
      notes: '',
      priority: 'Low',
      status: 'Pending',
      category: 'General',
      dueDate: '',
      tags: [],
      dependencies: [],
      estimatedTime: '',
      actualTime: '',
      template: ''
    });
  };

  const handleTemplateSelect = (templateName) => {
    if (templateName && taskTemplates[templateName]) {
      const template = taskTemplates[templateName];
      setFormData({
        ...formData,
        ...template,
        title: template.title,
        category: template.category,
        priority: template.priority,
        tags: template.tags,
        estimatedTime: template.estimatedTime,
        notes: template.notes
      });
    }
  };

  const saveFilterPreset = () => {
    const presetName = prompt('Enter a name for this filter preset:');
    if (presetName) {
      const newPreset = {
        id: Date.now(),
        name: presetName,
        filters: {
          searchTerm,
          statusFilter,
          priorityFilter,
          selectedTemplate,
          selectedTags,
          dateRange
        }
      };
      setSavedFilters([...savedFilters, newPreset]);
    }
  };

  const loadFilterPreset = (preset) => {
    setSearchTerm(preset.filters.searchTerm || '');
    setStatusFilter(preset.filters.statusFilter || '');
    setPriorityFilter(preset.filters.priorityFilter || '');
    setSelectedTemplate(preset.filters.selectedTemplate || '');
    setSelectedTags(preset.filters.selectedTags || []);
    setDateRange(preset.filters.dateRange || { start: '', end: '' });
    setCurrentFilterPreset(preset.name);
  };

  const deleteFilterPreset = (presetId) => {
    setSavedFilters(savedFilters.filter(preset => preset.id !== presetId));
  };

  const canStartTask = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status === 'Completed';
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const startTimeTracking = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!canStartTask(task)) {
      alert('Cannot start this task. Please complete dependent tasks first.');
      return;
    }
    setTimeTracking(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        isRunning: true,
        startTime: new Date().toISOString(),
        lastStart: new Date().toISOString()
      }
    }));
  };

  const stopTimeTracking = (taskId) => {
    setTimeTracking(prev => {
      const taskTracking = prev[taskId];
      if (taskTracking && taskTracking.isRunning) {
        const endTime = new Date();
        const startTime = new Date(taskTracking.lastStart);
        const sessionTime = (endTime - startTime) / (1000 * 60 * 60); // hours
        const totalTime = (taskTracking.totalTime || 0) + sessionTime;

        return {
          ...prev,
          [taskId]: {
            ...taskTracking,
            isRunning: false,
            totalTime: totalTime,
            lastEnd: endTime.toISOString()
          }
        };
      }
      return prev;
    });
  };

  const handleOpenEdit = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      revenue: task.revenue,
      timeTaken: task.timeTaken,
      notes: task.notes,
      priority: task.priority,
      status: task.status,
      category: task.category || 'General',
      dueDate: task.dueDate || '',
      tags: task.tags || [],
      dependencies: task.dependencies || [],
      estimatedTime: task.estimatedTime || '',
      actualTime: task.actualTime || '',
      template: task.template || ''
    });
    setOpenEdit(true);
  };

  const handleOpenView = (task) => {
    setCurrentTask(task);
    setOpenView(true);
  };

  const handleOpenDelete = (task) => {
    setCurrentTask(task);
    setOpenDelete(true);
  };

  const exportToCSV = () => {
    const csv = [
      ['Title', 'Revenue', 'Time Taken', 'ROI', 'Priority', 'Status', 'Category', 'Due Date', 'Tags', 'Notes', 'Created At', 'Updated At'],
      ...tasks.map(task => [
        task.title,
        task.revenue,
        task.timeTaken,
        task.roi,
        task.priority,
        task.status,
        task.category || 'General',
        task.dueDate || '',
        (task.tags || []).join(';'),
        task.notes,
        task.createdAt,
        task.updatedAt
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
  };

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const newTasks = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            id: Date.now() + Math.random(),
            title: values[0] || '',
            revenue: parseFloat(values[1]) || 0,
            timeTaken: parseFloat(values[2]) || 0,
            roi: calculateROI(parseFloat(values[1]) || 0, parseFloat(values[2]) || 0),
            priority: values[4] || 'Low',
            status: values[5] || 'Pending',
            category: values[6] || 'General',
            dueDate: values[7] || '',
            tags: values[8] ? values[8].split(';').filter(tag => tag.trim()) : [],
            notes: values[9] || '',
            createdAt: values[10] || new Date().toISOString(),
            updatedAt: values[11] || new Date().toISOString()
          };
        });
        setTasks([...tasks, ...newTasks]);
      };
      reader.readAsText(file);
    }
  };

  const totalRevenue = tasks.reduce((sum, task) => sum + task.revenue, 0);
  const totalTime = tasks.reduce((sum, task) => sum + task.timeTaken, 0);
  const avg = totalTime > 0 ? parseFloat((totalRevenue / totalTime).toFixed(2)) : null;
  const averageROI = avg !== null ? avg.toFixed(2) : '—';
  const efficiency = avg !== null ? (avg * 100).toFixed(2) : '—';
  const performanceGrade = avg !== null ? (avg > 10 ? 'Excellent' : avg > 5 ? 'Good' : 'Needs Improvement') : 'No Data';

  const columns = [
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'category', headerName: 'Category', width: 120, renderCell: (params) => <Chip label={params.value || 'General'} variant="outlined" size="small" sx={{ backgroundColor: categoryColors[params.value] || categoryColors['General'], color: 'white' }} /> },
    { field: 'revenue', headerName: 'Revenue', width: 120, type: 'number' },
    { field: 'timeTaken', headerName: 'Time Taken', width: 120, type: 'number' },
    { field: 'roi', headerName: 'ROI', width: 100 },
    { field: 'priority', headerName: 'Priority', width: 100, renderCell: (params) => <Chip label={params.value} color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'success'} size="small" /> },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => <Chip label={params.value} color={params.value === 'Completed' ? 'success' : params.value === 'In Progress' ? 'warning' : 'default'} size="small" /> },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleOpenEdit(params.row); }}
            title="Edit Task"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleOpenDelete(params.row); }}
            title="Delete Task"
          >
            <Delete fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); e.preventDefault();
              timeTracking[params.row.id]?.isRunning ? stopTimeTracking(params.row.id) : startTimeTracking(params.row.id);
            }}
            title={timeTracking[params.row.id]?.isRunning ? "Stop Timer" : "Start Timer"}
            color={timeTracking[params.row.id]?.isRunning ? "error" : "success"}
            disabled={!canStartTask(params.row)}
          >
            {timeTracking[params.row.id]?.isRunning ? <Stop fontSize="small" /> : <PlayArrow fontSize="small" />}
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <ThemeProvider theme={getTheme(darkMode)}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          {/* Notifications Banner */}
          {overdueTasks.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <NotificationsActive sx={{ mr: 1, verticalAlign: 'middle' }} />
                Overdue Tasks ({overdueTasks.length})
              </Typography>
              <Typography variant="body2">
                You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}. Please review and update their status.
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {overdueTasks.slice(0, 3).map(task => (
                  <Chip
                    key={task.id}
                    label={task.title}
                    size="small"
                    color="warning"
                    onClick={() => handleOpenView(task)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
                {overdueTasks.length > 3 && (
                  <Chip label={`+${overdueTasks.length - 3} more`} size="small" variant="outlined" />
                )}
              </Box>
            </Alert>
          )}

          <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            Task Management App
          </Typography>

          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="task management tabs">
              <Tab label="Tasks" />
              <Tab label="Analytics" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {tabValue === 0 && (
            <>
              {/* Summary Insights */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Total Revenue</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>${totalRevenue.toFixed(2)}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Efficiency</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{efficiency}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Average ROI</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{averageROI}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Performance Grade</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{performanceGrade}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Search and Filters */}
              <Paper sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                label="Search Tasks"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ color: 'action.active' }} /> }}
                sx={{ minWidth: 250 }}
              />
              <FormControl variant="outlined" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="outlined" sx={{ minWidth: 140 }}>
                <InputLabel>Priority</InputLabel>
                <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
                  <MenuItem value="">All Priority</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="outlined" sx={{ minWidth: 140 }}>
                <InputLabel>Category</InputLabel>
                <Select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} label="Category">
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Development">Development</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Research">Research</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                size="large"
              >
                Advanced Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={saveFilterPreset}
                size="large"
              >
                Save Filter Preset
              </Button>
              {savedFilters.length > 0 && (
                <FormControl variant="outlined" sx={{ minWidth: 180 }}>
                  <InputLabel>Load Preset</InputLabel>
                  <Select
                    value={currentFilterPreset}
                    onChange={(e) => {
                      const preset = savedFilters.find(p => p.name === e.target.value);
                      if (preset) loadFilterPreset(preset);
                    }}
                    label="Load Preset"
                  >
                    <MenuItem value="">Select Preset</MenuItem>
                    {savedFilters.map(preset => (
                      <MenuItem key={preset.id} value={preset.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          {preset.name}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFilterPreset(preset.id);
                            }}
                            sx={{ ml: 1 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <IconButton onClick={toggleDarkMode} sx={{ ml: 'auto' }}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAdd(true)} size="large">
                Add Task
              </Button>
              <Button variant="outlined" startIcon={<GetApp />} onClick={exportToCSV} size="large">
                Export CSV
              </Button>
              <Button variant="outlined" startIcon={<Publish />} component="label" size="large">
                Import CSV
                <input type="file" accept=".csv" hidden onChange={importFromCSV} />
              </Button>
            </Box>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="Tags (comma separated)"
                  value={selectedTags.join(', ')}
                  onChange={(e) => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="text"
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setSelectedTags([]);
                    setSelectedTemplate('');
                  }}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </Paper>

          {/* Tasks Table */}
          <Paper sx={{ height: 500, width: '100%', backgroundColor: 'background.paper' }}>
            <DataGrid
              rows={sortedTasks}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              onRowClick={(params) => handleOpenView(params.row)}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f1f5f9',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f8fafc',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid #e2e8f0',
                },
              }}
            />
          </Paper>

          {/* Add Task Dialog */}
          <Dialog
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Add New Task
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Use Template</InputLabel>
                <Select value={formData.template} onChange={(e) => {
                  setFormData({ ...formData, template: e.target.value });
                  handleTemplateSelect(e.target.value);
                }} label="Use Template">
                  <MenuItem value="">No Template</MenuItem>
                  <MenuItem value="Development">Development Task</MenuItem>
                  <MenuItem value="Design">Design Task</MenuItem>
                  <MenuItem value="Marketing">Marketing Campaign</MenuItem>
                  <MenuItem value="Research">Market Research</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Revenue ($)"
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Time Taken (hours)"
                  type="number"
                  value={formData.timeTaken}
                  onChange={(e) => setFormData({ ...formData, timeTaken: e.target.value })}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Estimated Time (hours)"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                fullWidth
                margin="normal"
                label="Tags (comma separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Development">Development</MenuItem>
                    <MenuItem value="Design">Design</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Research">Research</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={() => setOpenAdd(false)} variant="outlined" size="large">
                Cancel
              </Button>
              <Button onClick={handleAddTask} variant="contained" size="large">
                Add Task
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Task Dialog */}
          <Dialog
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Edit Task
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Use Template</InputLabel>
                <Select value={formData.template} onChange={(e) => {
                  setFormData({ ...formData, template: e.target.value });
                  handleTemplateSelect(e.target.value);
                }} label="Use Template">
                  <MenuItem value="">No Template</MenuItem>
                  <MenuItem value="Development">Development Task</MenuItem>
                  <MenuItem value="Design">Design Task</MenuItem>
                  <MenuItem value="Marketing">Marketing Campaign</MenuItem>
                  <MenuItem value="Research">Market Research</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Revenue ($)"
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Time Taken (hours)"
                  type="number"
                  value={formData.timeTaken}
                  onChange={(e) => setFormData({ ...formData, timeTaken: e.target.value })}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Estimated Time (hours)"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                fullWidth
                margin="normal"
                label="Tags (comma separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Development">Development</MenuItem>
                    <MenuItem value="Design">Design</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Research">Research</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={() => setOpenEdit(false)} variant="outlined" size="large">
                Cancel
              </Button>
              <Button onClick={handleEditTask} variant="contained" size="large">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Task Dialog */}
          <Dialog
            open={openView}
            onClose={() => setOpenView(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Task Details
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Title</Typography>
                  <Typography variant="body1">{currentTask?.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Revenue</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>${currentTask?.revenue}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Time Taken</Typography>
                  <Typography variant="body1">{currentTask?.timeTaken} hours</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>ROI</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>{currentTask?.roi}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Priority</Typography>
                  <Chip
                    label={currentTask?.priority}
                    color={currentTask?.priority === 'High' ? 'error' : currentTask?.priority === 'Medium' ? 'warning' : 'success'}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Status</Typography>
                  <Chip
                    label={currentTask?.status}
                    color={currentTask?.status === 'Completed' ? 'success' : currentTask?.status === 'In Progress' ? 'warning' : 'default'}
                    size="small"
                  />
                </Box>
                {currentTask?.category && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Category</Typography>
                    <Chip label={currentTask.category} variant="outlined" size="small" />
                  </Box>
                )}
                {currentTask?.dueDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Due Date</Typography>
                    <Typography variant="body1">{new Date(currentTask.dueDate).toLocaleDateString()}</Typography>
                  </Box>
                )}
                {currentTask?.tags && currentTask.tags.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Tags</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {currentTask.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                {currentTask?.estimatedTime && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Estimated Time</Typography>
                    <Typography variant="body1">{currentTask.estimatedTime} hours</Typography>
                  </Box>
                )}
                {currentTask?.createdAt && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Created</Typography>
                    <Typography variant="body1">{new Date(currentTask.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                )}
                {currentTask?.updatedAt && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Updated</Typography>
                    <Typography variant="body1">{new Date(currentTask.updatedAt).toLocaleDateString()}</Typography>
                  </Box>
                )}
                {currentTask?.notes && (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Notes</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{currentTask.notes}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={() => setOpenView(false)} variant="contained" size="large">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDelete}
            onClose={() => setOpenDelete(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'error.main' }}>
                Delete Task
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete this task?
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Task: {currentTask?.title}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                This action cannot be undone. The task will be permanently removed from your list.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={() => setOpenDelete(false)} variant="outlined" size="large">
                Cancel
              </Button>
              <Button onClick={handleDeleteTask} variant="contained" color="error" size="large">
                Delete Task
              </Button>
            </DialogActions>
          </Dialog>

          {/* Undo Snackbar */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="success"
              sx={{
                width: '100%',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
                '& .MuiAlert-icon': {
                  color: 'success.main'
                }
              }}
              action={
                <Button
                  color="success"
                  size="small"
                  onClick={handleUndoDelete}
                  sx={{
                    color: 'success.main',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'success.light',
                      color: 'white'
                    }
                  }}
                >
                  <Undo sx={{ mr: 0.5 }} />
                  Undo
                </Button>
              }
            >
              Task deleted successfully!
            </Alert>
          </Snackbar>
            </>
          )}

          {/* Analytics Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                <BarChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                Analytics Dashboard
              </Typography>

              {/* Analytics Charts */}
              <Grid container spacing={3}>
                {/* Productivity Trends */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Productivity Trends (Last 30 Days)
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <LineChart data={analyticsData.productivityTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="completed" stroke="#2563eb" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Completion Rates by Category */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      <PieChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Completion Rates by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.completionRates}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, rate }) => `${category}: ${rate}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="rate"
                        >
                          {analyticsData.completionRates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || categoryColors['General']} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* ROI Trends */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, height: 400 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      <BarChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                      ROI Trends (Last 30 Days)
                    </Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={analyticsData.roiData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="roi" fill="#059669" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
