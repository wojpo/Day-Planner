const dayColumns = document.querySelectorAll('.grid > div');

// Debounce helper
function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Beep sound
function playBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}

// Notification
function notifyTaskFinished(taskDesc) {
    if (Notification.permission === "granted") {
        new Notification("Task Finished ✅", { body: taskDesc });
    }
}

// Request notification permission once
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

// Task storage
let tasks = [];
let tasksChanged = false;

// Save tasks
function saveTasks() {
    const taskData = tasks.map(task => task.serialize());
    localStorage.setItem('tasks', JSON.stringify(taskData));
    tasksChanged = false;
}
const debouncedSave = debounce(saveTasks, 500);

// Global timer
let timerInterval = null;
function startGlobalTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        const runningTasks = tasks.filter(t => t.running);
        if (!runningTasks.length) return;
        runningTasks.forEach(task => task.tick());
        if (tasksChanged) debouncedSave();
    }, 1000);
}

// Task class
class Task {
    constructor(dayIndex, data = {}) {
        this.dayIndex = dayIndex;
        this.descValue = data.desc || '';
        this.hoursValue = parseInt(data.hours, 10) || 0;
        this.minutesValue = parseInt(data.minutes, 10) || 0;
        this.remaining = data.remaining !== undefined ? parseInt(data.remaining, 10) : this.hoursValue * 3600 + this.minutesValue * 60;
        this.running = data.running || false;

        this.column = dayColumns[dayIndex].querySelector('.day');
        this.createDOM();
        this.updateDisplay();

        if (this.running) startGlobalTimer();

        tasks.push(this);
        tasksChanged = true;
        debouncedSave();
    }

    createDOM() {
        // Task container
        this.taskEl = document.createElement('div');
        this.taskEl.className = 'task-item p-4 bg-[var(--bg-task)] rounded-xl flex flex-col gap-3 shadow-lg w-full';
        this.column.appendChild(this.taskEl);

        // Description
        this.desc = document.createElement('input');
        this.desc.type = 'text';
        this.desc.placeholder = 'Task description...';
        this.desc.value = this.descValue;
        this.desc.className = 'w-full bg-[var(--bg-input)] text-[var(--text-input)] text-sm p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)]';
        this.desc.addEventListener('input', () => {
            this.descValue = this.desc.value;
            tasksChanged = true;
            debouncedSave();
        });

        // Time inputs
        const timeContainer = document.createElement('div');
        timeContainer.className = 'flex flex-col md:flex-row gap-2 md:gap-4 items-center';

        this.hoursInput = document.createElement('input');
        this.hoursInput.type = 'number';
        this.hoursInput.min = 0;
        this.hoursInput.placeholder = 'Hours';
        this.hoursInput.className = 'hours-input w-full md:w-1/2 bg-[var(--bg-input)] text-[var(--text-input)] text-sm p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)]';
        this.hoursInput.addEventListener('input', () => {
            this.hoursValue = parseInt(this.hoursInput.value,10) || 0;
            if (!this.running) this.remaining = this.hoursValue * 3600 + this.minutesValue * 60;
            tasksChanged = true;
            debouncedSave();
            this.updateDisplay();
        });

        this.minutesInput = document.createElement('input');
        this.minutesInput.type = 'number';
        this.minutesInput.min = 0;
        this.minutesInput.max = 59;
        this.minutesInput.placeholder = 'Minutes';
        this.minutesInput.className = 'minutes-input w-full md:w-1/2 bg-[var(--bg-input)] text-[var(--text-input)] text-sm p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)]';
        this.minutesInput.addEventListener('input', () => {
            this.minutesValue = parseInt(this.minutesInput.value,10) || 0;
            if (!this.running) this.remaining = this.hoursValue * 3600 + this.minutesValue * 60;
            tasksChanged = true;
            debouncedSave();
            this.updateDisplay();
        });

        timeContainer.appendChild(this.hoursInput);
        timeContainer.appendChild(this.minutesInput);

        // Timer display
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.className = 'text-center text-lg font-mono text-[var(--text-timer)] bg-[var(--bg-timer)] p-1 rounded w-full';

        // Buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex flex-wrap gap-2 justify-end w-full';

        this.playBtn = document.createElement('button');
        this.playBtn.className = 'w-full sm:w-auto bg-[var(--bg-play)] hover:bg-[var(--bg-play-hover)] text-[var(--text-button)] px-3 py-1 rounded';
        this.playBtn.addEventListener('click', () => this.toggle());

        this.deleteBtn = document.createElement('button');
        this.deleteBtn.textContent = 'Delete';
        this.deleteBtn.className = 'w-full sm:w-auto bg-[var(--bg-delete)] hover:bg-[var(--bg-delete-hover)] text-[var(--text-button)] px-3 py-1 rounded';
        this.deleteBtn.addEventListener('click', () => this.delete());

        buttonsContainer.appendChild(this.playBtn);
        buttonsContainer.appendChild(this.deleteBtn);

        this.taskEl.appendChild(this.desc);
        this.taskEl.appendChild(timeContainer);
        this.taskEl.appendChild(this.timerDisplay);
        this.taskEl.appendChild(buttonsContainer);
    }

    updateDisplay() {
        const hrs = Math.floor(this.remaining / 3600);
        const mins = Math.floor((this.remaining % 3600) / 60);
        const secs = this.remaining % 60;
        this.timerDisplay.textContent = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;

        this.taskEl.classList.toggle('border-2', this.running);
        this.taskEl.classList.toggle('border-[var(--border-running)]', this.running);

        this.playBtn.textContent = this.running ? 'Pause' : 'Resume'
    }

    tick() {
        if (!this.running) return;
        if (this.remaining <= 0) {
            this.finish();
        } else {
            this.remaining--;
            this.updateDisplay();
            tasksChanged = true;
        }
    }

    toggle() {
        if (this.running) {
            this.running = false;
        } else {
            if (this.remaining <= 0) {
                this.remaining = this.hoursValue * 3600 + this.minutesValue * 60;
                if (this.remaining <= 0) return;
            }
            this.running = true;
            startGlobalTimer();
        }
        this.updateDisplay();
        tasksChanged = true;
        debouncedSave();
    }

    finish() {
        this.running = false;
        this.remaining = 0;
        this.updateDisplay();
        this.column.prepend(this.taskEl);
        playBeep();
        notifyTaskFinished(this.descValue);
    }

    delete() {
        this.running = false;
        this.taskEl.remove();
        tasks = tasks.filter(t => t !== this);
        tasksChanged = true;
        debouncedSave();
    }

    serialize() {
        return {
            dayIndex: this.dayIndex,
            desc: this.descValue,
            hours: this.hoursValue,
            minutes: this.minutesValue,
            remaining: this.remaining,
            running: this.running
        };
    }
}

// Load saved tasks
try {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => new Task(task.dayIndex, task));
} catch(e) {
    console.warn('Failed to load tasks from localStorage', e);
}

// Add-task buttons
document.querySelectorAll('.add-task').forEach((btn, idx) => {
    btn.addEventListener('click', () => new Task(idx));
});

// Start timer
startGlobalTimer();