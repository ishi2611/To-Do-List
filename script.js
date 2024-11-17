// Task Management Class
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.initializeEventListeners();
        this.render();
        this.updateStats();
    }

    initializeEventListeners() {
        // Add task
        document.getElementById('addTask').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Quick actions
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        document.getElementById('exportTasks').addEventListener('click', () => this.exportTasks());

        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleTheme());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        
        if (text) {
            const task = {
                id: Date.now(),
                text: text,
                completed: false,
                category: document.getElementById('categorySelect').value,
                priority: document.getElementById('prioritySelect').value,
                dueDate: document.getElementById('dueDate').value,
                createdAt: new Date().toISOString(),
                completedAt: null
            };

            this.tasks.unshift(task);
            this.saveTasks();
            input.value = '';
            this.showNotification('Task added successfully!');
            this.animateTaskAddition();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.showNotification(task.completed ? 'Task completed!' : 'Task reopened!');
        }
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        taskElement.style.transform = 'translateX(100px)';
        taskElement.style.opacity = '0';
        
        setTimeout(() => {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.showNotification('Task deleted!');
        }, 300);
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText && newText.trim()) {
                task.text = newText.trim();
                this.saveTasks();
                this.showNotification('Task updated!');
            }
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed tasks?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.showNotification('Completed tasks cleared!');
        }
    }

    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'tasks.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        this.showNotification('Tasks exported successfully!');
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.showNotification(`${isDarkMode ? 'Dark' : 'Light'} mode activated!`);
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const productivity = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('productivity').textContent = `${productivity}%`;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.updateStats();
        this.render();
    }

    filterTasks() {
        let filteredTasks = [...this.tasks];

        // Apply search filter
        if (this.searchQuery) {
            filteredTasks = filteredTasks.filter(task =>
                task.text.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply status filter
        switch (this.currentFilter) {
            case 'active':
                filteredTasks = filteredTasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
        }

        return filteredTasks;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    animateTaskAddition() {
        const taskList = document.getElementById('taskList');
        taskList.firstElementChild?.classList.add('task-added');
        setTimeout(() => {
            taskList.firstElementChild?.classList.remove('task-added');
        }, 500);
    }

    render() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.filterTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks found</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = filteredTasks.map((task, index) => `
            <div class="task-item ${task.completed ? 'completed' : ''}" 
                 data-task-id="${task.id}"
                 style="animation-delay: ${index * 0.1}s">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                     onclick="taskManager.toggleTask(${task.id})">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${task.text}</div>
                    <div class="task-meta">
                        <span class="task-category">
                            <i class="fas fa-tag"></i> ${task.category}
                        </span>
                        <span class="task-priority">
                            <i class="fas fa-flag"></i> ${task.priority}
                        </span>
                        ${task.dueDate ? `
                        <span class="task-due-date">
                            <i class="fas fa-calendar"></i> ${task.dueDate}
                        </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button onclick="taskManager.editTask(${task.id})" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="taskManager.deleteTask(${task.id})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Initialize TaskManager
const taskManager = new TaskManager();

// Load theme preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: -100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: bottom 0.3s ease-in-out;
        z-index: 1000;
    }

    .notification.show {
        bottom: 20px;
    }

    .task-added {
        animation: taskAdded 0.5s ease-out;
    }

    @keyframes taskAdded {
        0% {
            transform: translateX(-20px);
            opacity: 0;
        }
        100% {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
`;
document.head.appendChild(style);
