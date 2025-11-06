Task Management App

A comprehensive task management application built with React and Vite, designed to help users track tasks, calculate ROI, and manage productivity efficiently.

Features

Task CRUD Operations: Add, edit, view, and delete tasks with ease.
ROI Calculation: Automatically calculate Return on Investment based on revenue and time taken.
Search and Filter: Search tasks by title and filter by status, priority, category, tags, and date ranges.
Data Persistence: Tasks are stored in localStorage for persistence across sessions.
Export/Import CSV: Export tasks to CSV for backup or analysis, and import tasks from CSV files.
Analytics Dashboard: View total revenue, efficiency percentage, average ROI, and performance grade.
Advanced Analytics Charts: Visual charts for productivity trends, completion rates by category, and ROI trends.
Task Categories/Tags: Color-coded categories with filtering capabilities.
Due Dates & Notifications: Calendar picker, overdue alerts, and reminder notifications.
Task Templates: Pre-built templates for common task types (Development, Design, Marketing, Research).
Task Dependencies: Link tasks that depend on others before they can be started.
Time Tracking: Built-in timer for tasks with time logging functionality.
Advanced Search & Filters: Date ranges, multi-select filters, and saved filter presets.
Dark Mode Toggle: Professional dark theme option.
Responsive Design: Built with Material-UI for a modern, responsive user interface.
Undo Functionality: Accidentally deleted a task? No worries, undo the deletion with a single click.

Technologies Used

Frontend: React, Material-UI, Vite
Data Grid: MUI X DataGrid for efficient task display
Charts: Recharts for advanced analytics visualizations
Build Tool: Vite for fast development and optimized production builds
Deployment: GitHub Pages

Getting Started

Prerequisites

Node.js (version 14 or higher)
npm or yarn

Installation

1. Clone the repository:
   git clone https://github.com/bhavya022/task-management-app.git
   cd task-management-app

2. Install dependencies:
   npm install

3. Start the development server:
   npm run dev

4. Open http://localhost:5173 in your browser to view the app.

Building for Production

To build the app for production:

npm run build

The build artifacts will be stored in the dist/ directory.

Deployment

This app is deployed on GitHub Pages at https://bhavya022.github.io/task-management-app/.

To deploy your own version:

1. Fork this repository
2. Update the base in vite.config.js to match your repository name
3. Enable GitHub Pages in your repository settings
4. Push your changes to trigger deployment

Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

License

This project is open source and available under the MIT License.
