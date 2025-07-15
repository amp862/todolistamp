document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const activeTaskList = document.getElementById('activeTaskList');
    const completedTaskList = document.getElementById('completedTaskList');

    let tasks = loadTasks(); //load tasks on start

    //render tasks
    renderTasks();

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value; //YYYY-MM-DD format

        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now().toString(), //unique ID for each task
            text: taskText,
            dueDate: dueDate,
            completed: false
        };

        tasks.push(newTask);
        saveTasks(); // Save tasks to local storage
        renderTaskItem(newTask, activeTaskList); //add to DOM
        taskInput.value = ''; //Clear input
        dueDateInput.value = ''; //Clear date input
    }

    function renderTasks() {
        activeTaskList.innerHTML = ''; //Clear existing lists
        completedTaskList.innerHTML = '';

        tasks.forEach(task => {
            if (task.completed) {
                renderTaskItem(task, completedTaskList);
            } else {
                renderTaskItem(task, activeTaskList);
            }
        });
    }

    function renderTaskItem(task, parentList) {
        const listItem = document.createElement('li');
        listItem.dataset.id = task.id; //Store ID on the DOM element

        if (task.completed) {
            listItem.classList.add('completed');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        const taskTextSpan = document.createElement('span');
        taskTextSpan.classList.add('task-text');
        taskTextSpan.textContent = task.text;

        const taskDateSpan = document.createElement('span');
        taskDateSpan.classList.add('task-date');
        if (task.dueDate) {
            //format date for display (optional, can be YYYY-MM-DD)
            const dateObj = new Date(task.dueDate + 'T00:00:00'); //Add T00:00:00 to avoid timezone issues
            taskDateSpan.textContent = `Due: ${dateObj.toLocaleDateString()}`;
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task.id, taskTextSpan));

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        listItem.appendChild(checkbox);
        listItem.appendChild(taskTextSpan);
        if (task.dueDate) {
            listItem.appendChild(taskDateSpan);
        }
        listItem.appendChild(actionsDiv);

        parentList.appendChild(listItem);
    }

    function toggleComplete(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks(); //re-render all tasks to move them
        }
    }

    function editTask(id, taskTextSpanElement) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return;

        const currentTask = tasks[taskIndex];
        const listItem = taskTextSpanElement.closest('li');
        const originalText = currentTask.text;

        //create an input field for editing
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = originalText;
        editInput.classList.add('edit-input-field'); //optional: add a class for styling

        //replace the task text span with the input field
        listItem.replaceChild(editInput, taskTextSpanElement);

        editInput.focus(); //focus

        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText === '') {
                alert('Task cannot be empty!');
                //revert to original text if empty
                currentTask.text = originalText;
            } else {
                currentTask.text = newText;
            }
            saveTasks();
            renderTasks(); //re-render to update the display
        };

        //save on 'Enter' key press
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });

        //save when focus leaves the input field (blur)
        editInput.addEventListener('blur', saveEdit);

        //remove the edit/delete buttons while editing to prevent accidental clicks
        const editBtn = listItem.querySelector('.edit-btn');
        const deleteBtn = listItem.querySelector('.delete-btn');
        if (editBtn) editBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
    }

    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks(); //re-render to remove the item from the DOM
        }
    }

    //local storage functions
    function saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem('todoTasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
    }
});
