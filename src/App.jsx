import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Paper, Grid, Box, IconButton, Select, MenuItem, FormControl, InputLabel, Chip, ThemeProvider, createTheme } from '@mui/material';
import { Add, Edit, Delete, Undo, Search, FilterList, GetApp, Publish } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Professional blue
    },
    secondary: {
      main: '#64748b', // Slate gray
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff',
    },
    success: {
      main: '#059669', // Emerald green
    },
    warning: {
      main: '#d97706', // Amber
    },
    error: {
      main: '#dc2626', // Red
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#1e293b',
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
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
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
    status: 'Pending'
  });

  const [loaded, setLoaded] = useState(false);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      setTasks(parsedTasks);
      setFilteredTasks(parsedTasks);
    }
    setLoaded(true);
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filter and search tasks
  useEffect(() => {
    let filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === '' || task.status === statusFilter) &&
      (priorityFilter === '' || task.priority === priorityFilter)
    );
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);



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

      // Stable tie-breaker: createdAt descending (newest first)
      const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
      if (dateDiff !== 0) return dateDiff;
      return a.title.localeCompare(b.title);
    });
  }, [filteredTasks]);

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      ...formData,
      revenue: parseFloat(formData.revenue) || 0,
      timeTaken: parseFloat(formData.timeTaken) || 0,
      roi: calculateROI(parseFloat(formData.revenue) || 0, parseFloat(formData.timeTaken) || 0),
      createdAt: new Date().toISOString()
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
        roi: calculateROI(parseFloat(formData.revenue) || 0, parseFloat(formData.timeTaken) || 0)
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
      status: 'Pending'
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
      status: task.status
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
      ['Title', 'Revenue', 'Time Taken', 'ROI', 'Priority', 'Status', 'Notes'],
      ...tasks.map(task => [task.title, task.revenue, task.timeTaken, task.roi, task.priority, task.status, task.notes])
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
            title: values[0],
            revenue: parseFloat(values[1]) || 0,
            timeTaken: parseFloat(values[2]) || 0,
            roi: calculateROI(parseFloat(values[1]) || 0, parseFloat(values[2]) || 0),
            priority: values[4],
            status: values[5],
            notes: values[6],
            createdAt: new Date().toISOString()
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
    { field: 'revenue', headerName: 'Revenue', width: 120, type: 'number' },
    { field: 'timeTaken', headerName: 'Time Taken', width: 120, type: 'number' },
    { field: 'roi', headerName: 'ROI', width: 100 },
    { field: 'priority', headerName: 'Priority', width: 100, renderCell: (params) => <Chip label={params.value} color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'success'} /> },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (params) => <Chip label={params.value} color={params.value === 'Completed' ? 'success' : params.value === 'In Progress' ? 'warning' : 'default'} /> },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <>
          <IconButton onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleOpenEdit(params.row); }}><Edit /></IconButton>
          <IconButton onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleOpenDelete(params.row); }}><Delete /></IconButton>
        </>
      )
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            Task Management App
          </Typography>

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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
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
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
