const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');
const APP_NAME = process.env.APP_NAME || 'Todo Manager';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ENABLE_FILE_PERSISTENCE = process.env.ENABLE_FILE_PERSISTENCE === 'true';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readTasks() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
}

function writeTasks(tasks) {
  if (!ENABLE_FILE_PERSISTENCE) {
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: APP_NAME,
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    appName: APP_NAME,
    environment: NODE_ENV,
    persistenceEnabled: ENABLE_FILE_PERSISTENCE
  });
});

app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const tasks = readTasks();

  const newTask = {
    id: tasks.length ? Math.max(...tasks.map(task => task.id)) + 1 : 1,
    title: title.trim(),
    description: description ? description.trim() : '',
    status: 'pending',
    priority: priority || 'medium',
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const { title, description, status, priority } = req.body;

  const tasks = readTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title !== undefined ? title.trim() : tasks[taskIndex].title,
    description: description !== undefined ? description.trim() : tasks[taskIndex].description,
    status: status !== undefined ? status : tasks[taskIndex].status,
    priority: priority !== undefined ? priority : tasks[taskIndex].priority
  };

  writeTasks(tasks);
  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const tasks = readTasks();
  const filteredTasks = tasks.filter(task => task.id !== taskId);

  if (filteredTasks.length === tasks.length) {
    return res.status(404).json({ message: 'Task not found' });
  }

  writeTasks(filteredTasks);
  res.json({ message: 'Task deleted successfully' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`${APP_NAME} is running on port ${PORT}`);
});
