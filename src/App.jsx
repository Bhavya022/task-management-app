import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Paper, Grid, Box, IconButton, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { Add, Edit, Delete, Undo, Search, FilterList, GetApp, Publish } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

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
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Task Management App</Typography>

      {/* Summary Insights */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Revenue</Typography>
            <Typography variant="h4">${totalRevenue.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Efficiency</Typography>
            <Typography variant="h4">{efficiency}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Average ROI</Typography>
            <Typography variant="h4">{averageROI}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Performance Grade</Typography>
            <Typography variant="h4">{performanceGrade}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <Search /> }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAdd(true)}>Add Task</Button>
        <Button variant="outlined" startIcon={<GetApp />} onClick={exportToCSV}>Export CSV</Button>
        <Button variant="outlined" startIcon={<Publish />} component="label">
          Import CSV
          <input type="file" accept=".csv" hidden onChange={importFromCSV} />
        </Button>
      </Box>

      {/* Tasks Table */}
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={sortedTasks}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          onRowClick={(params) => handleOpenView(params.row)}
        />
      </Paper>

      {/* Add Task Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <TextField fullWidth margin="dense" label="Revenue" type="number" value={formData.revenue} onChange={(e) => setFormData({ ...formData, revenue: e.target.value })} />
          <TextField fullWidth margin="dense" label="Time Taken" type="number" value={formData.timeTaken} onChange={(e) => setFormData({ ...formData, timeTaken: e.target.value })} />
          <TextField fullWidth margin="dense" label="Notes" multiline rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddTask}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <TextField fullWidth margin="dense" label="Revenue" type="number" value={formData.revenue} onChange={(e) => setFormData({ ...formData, revenue: e.target.value })} />
          <TextField fullWidth margin="dense" label="Time Taken" type="number" value={formData.timeTaken} onChange={(e) => setFormData({ ...formData, timeTaken: e.target.value })} />
          <TextField fullWidth margin="dense" label="Notes" multiline rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditTask}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)}>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          <Typography><strong>Title:</strong> {currentTask?.title}</Typography>
          <Typography><strong>Revenue:</strong> ${currentTask?.revenue}</Typography>
          <Typography><strong>Time Taken:</strong> {currentTask?.timeTaken} hours</Typography>
          <Typography><strong>ROI:</strong> {currentTask?.roi}</Typography>
          <Typography><strong>Priority:</strong> {currentTask?.priority}</Typography>
          <Typography><strong>Status:</strong> {currentTask?.status}</Typography>
          <Typography><strong>Notes:</strong> {currentTask?.notes}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{currentTask?.title}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Undo Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        action={
          <Button color="secondary" size="small" onClick={handleUndoDelete}>
            <Undo /> Undo
          </Button>
        }
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Task deleted successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
