const toggleMenu = document.getElementById('toggleMenu');
const settingsMenu = document.getElementById('settingsMenu');
const dayColumns = document.querySelectorAll('.grid > div');

toggleMenu.addEventListener('click', () => {
    settingsMenu.classList.toggle('menu-hidden');
    settingsMenu.classList.toggle('menu-visible');
    toggleMenu.classList.toggle('button-shifted');
});

// Debounce helper
function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Task storage
let tasks = [];
let tasksChanged = false;
let timerInterval = null;

// Request notification permission once
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

// Save tasks to localStorage
function saveTasks() {
    const taskData = tasks.map(task => ({
        dayIndex: task.dayIndex,
        desc: task.desc.value,
        hours: task.hours.value,
        minutes: task.minutes.value,
        remaining: task.remaining,
        running: task.running
    }));
    localStorage.setItem('tasks', JSON.stringify(taskData));
    tasksChanged = false;
}
const debouncedSave = debounce(saveTasks, 500);

// Load saved tasks
const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
savedTasks.forEach(task => createTask(task.dayIndex, task));

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

// Update timer display
function updateTimerDisplay(task) {
    const hrs = Math.floor(task.remaining / 3600);
    const mins = Math.floor((task.remaining % 3600) / 60);
    const secs = task.remaining % 60;
    task.timerDisplay.textContent = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}

// Style finished task
function styleFinishedTask(task) {
    task.taskEl.classList.remove('border-2','border-green-500');
    task.timerDisplay.classList.add('opacity-50');
}

// Move finished task to top of column
function moveFinishedTaskToTop(task) {
    const column = dayColumns[task.dayIndex].querySelector('.space-y-3');
    column.prepend(task.taskEl);
}

// Start global timer once
function startGlobalTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        let needSave = false;
        tasks.forEach(task => {
            if (!task.running) return;
            if (task.remaining <= 0) {
                task.remaining = 0;
                task.running = false;
                task.playBtn.textContent = 'Start';
                styleFinishedTask(task);
                moveFinishedTaskToTop(task);
                playBeep();
                notifyTaskFinished(task.desc.value);
            } else {
                task.remaining--;
            }
            updateTimerDisplay(task);
            needSave = true;
        });
        if (needSave || tasksChanged) saveTasks();
    }, 1000);
}

// Create task
function createTask(dayIndex, data = {}) {
    const column = dayColumns[dayIndex].querySelector('.space-y-3');

    const taskEl = document.createElement('div');
    taskEl.className = 'task-item p-4 bg-gray-800 rounded-xl flex flex-col gap-3 shadow-lg w-full';

    const desc = document.createElement('input');
    desc.type = 'text';
    desc.placeholder = 'Task description...';
    desc.value = data.desc || '';
    desc.className = 'w-full bg-gray-700 text-gray-200 text-sm p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400';
    desc.addEventListener('input', () => { tasksChanged = true; debouncedSave(); });

    const timeContainer = document.createElement('div');
    timeContainer.className = 'flex flex-col md:flex-row gap-2 md:gap-4 items-center';

    const hoursInput = document.createElement('input');
    hoursInput.type = 'number';
    hoursInput.min = 0;
    hoursInput.placeholder = 'Hours';
    hoursInput.value = data.hours || 0;
    hoursInput.className = 'hours-input w-full md:w-1/2 bg-gray-700 text-gray-200 text-sm p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400';
    hoursInput.addEventListener('input', () => { tasksChanged = true; debouncedSave(); });

    const minutesInput = document.createElement('input');
    minutesInput.type = 'number';
    minutesInput.min = 0;
    minutesInput.max = 59;
    minutesInput.placeholder = 'Minutes';
    minutesInput.value = data.minutes || 0;
    minutesInput.className = 'minutes-input w-full md:w-1/2 bg-gray-700 text-gray-200 text-sm p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400';
    minutesInput.addEventListener('input', () => { tasksChanged = true; debouncedSave(); });

    timeContainer.appendChild(hoursInput);
    timeContainer.appendChild(minutesInput);

    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'text-center text-lg font-mono text-green-400 bg-gray-900 p-1 rounded w-full';

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex flex-col md:flex-row gap-2 justify-end w-full';

    const playBtn = document.createElement('button');
    playBtn.className = 'bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded w-full md:w-auto';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded w-full md:w-auto';

    buttonsContainer.appendChild(playBtn);
    buttonsContainer.appendChild(deleteBtn);

    taskEl.appendChild(desc);
    taskEl.appendChild(timeContainer);
    taskEl.appendChild(timerDisplay);
    taskEl.appendChild(buttonsContainer);
    column.appendChild(taskEl);

    const taskObj = {
        dayIndex,
        taskEl,
        desc,
        hours: hoursInput,
        minutes: minutesInput,
        timerDisplay,
        playBtn,
        remaining: (data.remaining !== undefined) ? parseInt(data.remaining,10) : (parseInt(hoursInput.value,10)*3600 + parseInt(minutesInput.value,10)*60),
        running: data.running || false
    };
    tasks.push(taskObj);

    updateTimerDisplay(taskObj);

    if(taskObj.remaining > 0 && taskObj.running){
        taskEl.classList.add('border-2','border-green-500');
        playBtn.textContent = 'Pause';
    } else {
        playBtn.textContent = 'Start';
    }

    playBtn.addEventListener('click', () => {
        if(taskObj.running){
            taskObj.running = false;
            taskEl.classList.remove('border-2','border-green-500');
            playBtn.textContent = 'Resume';
        } else {
            if(taskObj.remaining <= 0){
                taskObj.remaining = parseInt(hoursInput.value,10)*3600 + parseInt(minutesInput.value,10)*60;
                if(taskObj.remaining <= 0) return;
            }
            taskObj.running = true;
            taskEl.classList.add('border-2','border-green-500');
            playBtn.textContent = 'Pause';
            startGlobalTimer();
        }
        tasksChanged = true;
        saveTasks();
    });

    deleteBtn.addEventListener('click', () => {
        taskObj.running = false;
        taskObj.taskEl.remove();
        tasks = tasks.filter(t => t !== taskObj);
        tasksChanged = true;
        saveTasks();
    });

    tasksChanged = true;
    saveTasks();
}

document.querySelectorAll('.add-task').forEach((btn, idx) => {
    btn.addEventListener('click', () => createTask(idx));
});

startGlobalTimer();
