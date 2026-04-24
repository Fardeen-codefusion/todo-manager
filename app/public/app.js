const taskList = document.getElementById('taskList');
const taskForm = document.getElementById('taskForm');
const refreshBtn = document.getElementById('refreshBtn');
const messageBox = document.getElementById('messageBox');
const envBadge = document.getElementById('envBadge');

function showMessage(text, type = 'success') {
  messageBox.innerHTML = `<div class="message ${type}">${text}</div>`;
  setTimeout(() => {
    messageBox.innerHTML = '';
  }, 3000);
}

async function loadAppInfo() {
  try {
    const response = await fetch('/api/info');
    const info = await response.json();
    envBadge.textContent = `${info.appName} | ${info.environment}`;
  } catch (error) {
    envBadge.textContent = 'Environment info unavailable';
  }
}

async function loadTasks() {
  try {
    const response = await fetch('/api/tasks');
    const tasks = await response.json();

    if (!tasks.length) {
      taskList.innerHTML = '<p>No tasks found. Create your first task.</p>';
      return;
    }

    taskList.innerHTML = tasks.map(task => `
      <div class="task-item">
        <h3>${task.title}</h3>
        <p>${task.description || 'No description provided'}</p>
        <div class="task-meta">
          <span class="badge priority-${task.priority}">Priority: ${task.priority}</span>
          <span class="badge status-${task.status}">Status: ${task.status}</span>
        </div>
        <div class="task-actions">
          <button onclick="updateTaskStatus(${task.id}, 'pending')">Pending</button>
          <button onclick="updateTaskStatus(${task.id}, 'in-progress')">In Progress</button>
          <button onclick="updateTaskStatus(${task.id}, 'done')">Done</button>
          <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showMessage('Failed to load tasks', 'error');
  }
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const priority = document.getElementById('priority').value;

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, priority })
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    taskForm.reset();
    showMessage('Task created successfully');
    loadTasks();
  } catch (error) {
    showMessage('Failed to create task', 'error');
  }
});

async function updateTaskStatus(taskId, status) {
  try {
    const tasksResponse = await fetch('/api/tasks');
    const tasks = await tasksResponse.json();
    const task = tasks.find(item => item.id === taskId);

    if (!task) {
      showMessage('Task not found', 'error');
      return;
    }

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: status
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    showMessage('Task updated successfully');
    loadTasks();
  } catch (error) {
    showMessage('Failed to update task', 'error');
  }
}

async function deleteTask(taskId) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    showMessage('Task deleted successfully');
    loadTasks();
  } catch (error) {
    showMessage('Failed to delete task', 'error');
  }
}

refreshBtn.addEventListener('click', loadTasks);

loadAppInfo();
loadTasks();
