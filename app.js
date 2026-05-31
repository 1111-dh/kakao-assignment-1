// Todo 아이템을 관리할 애플리케이션 상태(State) 배열
let todos = [];

// DOM 요소 선택
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

/**
 * 애플리케이션의 이벤트 리스너를 초기화하는 함수
 */
function initializeApp() {
    todoForm.addEventListener('submit', handleAddTodo);
}

/**
 * Todo 추가를 처리하는 이벤트 핸들러 함수 (Create)
 */
function handleAddTodo(event) {
    event.preventDefault(); // 폼 제출 시 발생하는 페이지 새로고침 방지

    const todoText = todoInput.value.trim();

    // 입력값 검증: 비어있을 경우 예외 처리 후 경고 메시지 출력
    if (todoText === '') {
        alert('할 일을 내용을 입력해주세요.');
        return;
    }

    // 새 Todo 객체 모델 설계
    const newTodo = {
        id: Date.now(), // 고유 식별자로 현재 타임스탬프 활용
        text: todoText,
        completed: false
    };

    // 데이터 상태 업데이트 및 UI 렌더링
    todos.push(newTodo);
    clearInput();
    renderTodos();
}

/**
 * Todo의 완료 상태를 토글하는 함수 (Update - Status)
 */
function toggleTodoComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    renderTodos();
}

/**
 * Todo의 텍스트 내용을 수정하는 함수 (Update - Text)
 */
function editTodoText(id) {
    const targetTodo = todos.find(todo => todo.id === id);
    if (!targetTodo) return;

    // 미니멀한 처리를 위해 브라우저 prompt 창 활용
    const updatedText = prompt('할 일을 수정하세요:', targetTodo.text);
    
    // 사용자가 취소를 누르거나 공백만 입력했을 때의 예외 처리
    if (updatedText === null) return;
    if (updatedText.trim() === '') {
        alert('내용을 올바르게 입력해주세요.');
        return;
    }

    targetTodo.text = updatedText.trim();
    renderTodos();
}

/**
 * Todo를 삭제하는 함수 (Delete)
 */
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    renderTodos();
}

/**
 * 입력창을 비워주는 보조 함수
 */
function clearInput() {
    todoInput.value = '';
}

/**
 * 최신 데이터 상태에 맞춰 화면을 갱신하는 렌더링 함수 (Read)
 */
function renderTodos() {
    // 기존 동적 DOM 요소를 초기화
    todoList.innerHTML = '';

    // todos 배열 요소 순회하며 리스트 아이템 빌드
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        // 텍스트 노드 생성
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;
        li.appendChild(textSpan);

        // 기능 버튼들을 담을 컨테이너 생성
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        // 완료/취소 버튼 생성 및 이벤트 바인딩
        const completeBtn = document.createElement('button');
        completeBtn.className = 'action-btn complete-btn';
        completeBtn.textContent = todo.completed ? '취소' : '완료';
        completeBtn.addEventListener('click', () => toggleTodoComplete(todo.id));
        btnGroup.appendChild(completeBtn);

        // 수정 버튼 생성 및 이벤트 바인딩
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.textContent = '수정';
        editBtn.addEventListener('click', () => editTodoText(todo.id));
        btnGroup.appendChild(editBtn);

        // 삭제 버튼 생성 및 이벤트 바인딩
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        btnGroup.appendChild(deleteBtn);

        li.appendChild(btnGroup);
        todoList.appendChild(li);
    });
}

// 애플리케이션 시작 실행
initializeApp();