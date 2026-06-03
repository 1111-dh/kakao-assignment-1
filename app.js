// 상태 관리
let todos = [];
let currentFilter = 'all'; 
let currentView = 'week'; 
let selectedDate = new Date(); 

// 주간/월간 렌더링 기준점
let currentWeekStart = getStartOfWeek(new Date()); 
let currentMonthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

// DOM 요소
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const viewBtns = document.querySelectorAll('.view-btn');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dateDisplay = document.getElementById('current-date-display');

const weekCalendar = document.getElementById('week-calendar');
const monthCalendar = document.getElementById('month-calendar');
const monthGrid = document.getElementById('month-grid');

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 앱 초기화
 */
function initializeApp() {
    loadFromLocalStorage();

    todoForm.addEventListener('submit', handleAddTodo);
    filterBtns.forEach(btn => btn.addEventListener('click', handleFilterChange));
    viewBtns.forEach(btn => btn.addEventListener('click', handleViewChange));

    prevBtn.addEventListener('click', () => navigateCalendar(-1));
    nextBtn.addEventListener('click', () => navigateCalendar(1));

    renderApp();
}

/**
 * 로컬스토리지 연동
 */
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('todos');
    todos = saved ? JSON.parse(saved) : [];
}

/**
 * 날짜 관련 유틸리티 함수
 */
function getStartOfWeek(date) {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
}

function getStorageDateString(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * [신규] 특정 날짜의 진행 중 / 완료된 Todo 개수를 각각 계산하여 객체로 반환
 */
function getTodoStatsForDate(dateStr) {
    const dateTodos = todos.filter(todo => todo.date === dateStr);
    const activeCount = dateTodos.filter(todo => !todo.completed).length;
    const completedCount = dateTodos.filter(todo => todo.completed).length;
    
    return { activeCount, completedCount };
}

/**
 * 주/월 뷰 토글 처리
 */
function handleViewChange(event) {
    currentView = event.target.getAttribute('data-view');
    
    viewBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (currentView === 'week') {
        weekCalendar.classList.remove('hidden');
        monthCalendar.classList.add('hidden');
        currentWeekStart = getStartOfWeek(selectedDate); 
    } else {
        weekCalendar.classList.add('hidden');
        monthCalendar.classList.remove('hidden');
        currentMonthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    
    renderApp();
}

/**
 * 이전/다음 네비게이션 처리
 */
function navigateCalendar(offset) {
    if (currentView === 'week') {
        currentWeekStart.setDate(currentWeekStart.getDate() + (offset * 7));
    } else {
        currentMonthStart.setMonth(currentMonthStart.getMonth() + offset);
    }
    renderApp();
}

/**
 * 전체 화면 렌더링 통합 (달력 + 목록)
 */
function renderApp() {
    if (currentView === 'week') {
        renderWeekCalendar();
    } else {
        renderMonthCalendar();
    }
    renderTodos();
}

/**
 * 주간 달력 렌더링
 */
function renderWeekCalendar() {
    weekCalendar.innerHTML = '';
    const year = currentWeekStart.getFullYear();
    const month = currentWeekStart.getMonth() + 1;
    dateDisplay.textContent = `${year}년 ${month}월`;

    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(currentWeekStart);
        currentDay.setDate(currentWeekStart.getDate() + i);
        
        const dateStr = getStorageDateString(currentDay);
        const stats = getTodoStatsForDate(dateStr); // 해당 날짜의 진행/완료 통계 산출
        const isSelected = isSameDay(currentDay, selectedDate);

        const dayBlock = document.createElement('div');
        dayBlock.className = 'day-block';
        
        if (isSameDay(currentDay, today)) dayBlock.classList.add('today');
        if (isSelected) dayBlock.classList.add('selected');

        // 상태값에 따른 인디케이터(점/뱃지) HTML 동적 구성
        let indicatorsHtml = '<div class="indicators-container">';
        if (stats.activeCount > 0) {
            indicatorsHtml += `<span class="indicator active-indicator">${isSelected ? stats.activeCount : ''}</span>`;
        }
        if (stats.completedCount > 0) {
            indicatorsHtml += `<span class="indicator completed-indicator">${isSelected ? stats.completedCount : ''}</span>`;
        }
        indicatorsHtml += '</div>';

        dayBlock.innerHTML = `
            <span class="day-name">${DAY_NAMES[i]}</span>
            <span class="day-number">${currentDay.getDate()}</span>
            ${indicatorsHtml}
        `;

        dayBlock.addEventListener('click', () => {
            selectedDate = new Date(currentDay);
            renderApp();
        });

        weekCalendar.appendChild(dayBlock);
    }
}

/**
 * 월간 달력 렌더링
 */
function renderMonthCalendar() {
    monthGrid.innerHTML = '';
    const year = currentMonthStart.getFullYear();
    const month = currentMonthStart.getMonth();
    dateDisplay.textContent = `${year}년 ${month + 1}월`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyBlock = document.createElement('div');
        emptyBlock.className = 'day-block empty';
        monthGrid.appendChild(emptyBlock);
    }

    for (let i = 1; i <= lastDate; i++) {
        const currentDay = new Date(year, month, i);
        const dateStr = getStorageDateString(currentDay);
        const stats = getTodoStatsForDate(dateStr); // 해당 날짜의 진행/완료 통계 산출
        const isSelected = isSameDay(currentDay, selectedDate);

        const dayBlock = document.createElement('div');
        dayBlock.className = 'day-block';

        if (isSameDay(currentDay, today)) dayBlock.classList.add('today');
        if (isSelected) dayBlock.classList.add('selected');

        // 상태값에 따른 인디케이터(점/뱃지) HTML 동적 구성
        let indicatorsHtml = '<div class="indicators-container">';
        if (stats.activeCount > 0) {
            indicatorsHtml += `<span class="indicator active-indicator">${isSelected ? stats.activeCount : ''}</span>`;
        }
        if (stats.completedCount > 0) {
            indicatorsHtml += `<span class="indicator completed-indicator">${isSelected ? stats.completedCount : ''}</span>`;
        }
        indicatorsHtml += '</div>';

        dayBlock.innerHTML = `
            <span class="day-number">${i}</span>
            ${indicatorsHtml}
        `;

        dayBlock.addEventListener('click', () => {
            selectedDate = new Date(currentDay);
            renderApp();
        });

        monthGrid.appendChild(dayBlock);
    }
}

/**
 * 기능: 추가, 필터, 완료, 수정, 삭제 로직
 */
function handleFilterChange(event) {
    currentFilter = event.target.getAttribute('data-filter');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTodos();
}

function handleAddTodo(event) {
    event.preventDefault();
    const text = todoInput.value.trim();
    if (!text) { alert('할 일을 입력해주세요.'); return; }

    todos.push({ 
        id: Date.now(), 
        text, 
        completed: false,
        date: getStorageDateString(selectedDate)
    });
    
    todoInput.value = '';
    saveToLocalStorage();
    renderApp();
}

function toggleComplete(id) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveToLocalStorage();
    renderApp();
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const newText = prompt('할 일을 수정하세요:', todo.text);
    if (!newText || !newText.trim()) return;
    todo.text = newText.trim();
    saveToLocalStorage();
    renderApp();
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveToLocalStorage();
    renderApp();
}

function renderTodos() {
    todoList.innerHTML = '';
    const targetDate = getStorageDateString(selectedDate);
    
    const filtered = todos.filter(todo => {
        if (todo.date !== targetDate) return false;
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; 
    });

    if (filtered.length === 0) {
        todoList.innerHTML = `<li class="empty-msg">이 날짜에 등록된 할 일이 없습니다.</li>`;
        return;
    }

    filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;
        
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'action-btn complete-btn';
        completeBtn.textContent = todo.completed ? '취소' : '완료';
        completeBtn.addEventListener('click', () => toggleComplete(todo.id));

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.textContent = '수정';
        editBtn.addEventListener('click', () => editTodo(todo.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        btnGroup.append(completeBtn, editBtn, deleteBtn);
        li.append(textSpan, btnGroup);
        todoList.appendChild(li);
    });
}

// 실행
initializeApp();