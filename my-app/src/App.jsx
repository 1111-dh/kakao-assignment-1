import React, { useState, useEffect } from 'react';
import './App.css';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * [헬퍼 함수] 날짜를 YYYY-MM-DD 문자열로 변환
 */
const getStorageDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * [헬퍼 함수] 두 날짜가 같은 날인지 확인
 */
const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * [헬퍼 함수] 주어진 날짜가 포함된 주의 일요일 반환
 */
const getStartOfWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

function App() {
  // --- [상태 관리] ---
  
  // 1. Todos 리스트 (로컬스토리지 연동)
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  // 2. 주간/월간 뷰 모드 상태 (로컬스토리지 연동)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('viewMode') || 'week'; // 기본값 'week'
  });

  // 3. UI 및 입력 상태
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editInputText, setEditInputText] = useState('');
  const [filter, setFilter] = useState('all');

  // 4. 달력 기준 날짜 및 사용자가 선택한 날짜
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // 달력을 넘길 때 기준이 되는 날짜

  // --- [이펙트 훅] ---

  // Todos 변경 시 자동 저장
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 뷰 모드(주/월) 변경 시 자동 저장
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // --- [핸들러 로직] ---

  /**
   * 이전/다음 캘린더 이동 함수
   */
  const navigateCalendar = (offset) => {
    const newDate = new Date(viewDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + offset * 7); // 1주 단위 이동
    } else {
      newDate.setMonth(newDate.getMonth() + offset); // 1달 단위 이동
    }
    setViewDate(newDate);
  };

  /**
   * 날짜 클릭 처리 함수
   */
  const handleDayClick = (day) => {
    if (!day) return; // 월간 뷰의 빈 칸 방어 코드
    setSelectedDate(day);
    setViewDate(day); // 선택한 날짜로 달력 포커스 유지
  };

  /**
   * 특정 날짜의 진행 중/완료된 Todo 갯수 통계 반환
   */
  const getTodoStats = (dateStr) => {
    const dayTodos = todos.filter(t => t.date === dateStr);
    const activeCount = dayTodos.filter(t => !t.completed).length;
    const completedCount = dayTodos.filter(t => t.completed).length;
    return { activeCount, completedCount };
  };

  /**
   * Todo CRUD 함수들
   */
  const handleAddTodo = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return alert('할 일을 입력해주세요.');

    setTodos([
      ...todos,
      { id: Date.now(), text, completed: false, date: getStorageDateString(selectedDate) }
    ]);
    setInputText('');
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const saveEdit = (id) => {
    const text = editInputText.trim();
    if (!text) return alert('내용을 입력해주세요.');
    
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text } : todo
    ));
    setEditingId(null);
  };

  // --- [렌더링 로직] ---

  // 조건에 맞는 Todo 목록 필터링
  const filteredTodos = todos.filter(todo => {
    if (todo.date !== getStorageDateString(selectedDate)) return false;
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; 
  });

  const today = new Date();

  // 캘린더 날짜 배열 생성
  const generateCalendarDays = () => {
    const days = [];
    if (viewMode === 'week') {
      const start = getStartOfWeek(viewDate);
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
      }
    } else {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const firstDayIndex = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();

      // 첫 주 빈 칸 채우기
      for (let i = 0; i < firstDayIndex; i++) days.push(null);
      // 실제 날짜 채우기
      for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="todo-container">
      <header>
        <div className="header-top">
          <h1>Todo List</h1>
          {/* 주/월 뷰 토글 스위치 */}
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >주</button>
            <button 
              className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >월</button>
          </div>
        </div>
        
        {/* 달력 네비게이션 */}
        <div className="calendar-nav">
          <button className="nav-btn" onClick={() => navigateCalendar(-1)}>&lt;</button>
          <span className="current-date-display">
            {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
          </span>
          <button className="nav-btn" onClick={() => navigateCalendar(1)}>&gt;</button>
        </div>

        {/* 월간 뷰일 경우 요일 헤더 표시 */}
        {viewMode === 'month' && (
          <div className="month-header-days">
            {DAY_NAMES.map(day => <span key={day}>{day}</span>)}
          </div>
        )}

        {/* 캘린더 그리드 영역 */}
        <div className="calendar-grid">
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="day-block empty" />;

            const dateStr = getStorageDateString(day);
            const stats = getTodoStats(dateStr);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);

            return (
              <div 
                key={dateStr}
                className={`day-block ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                {/* 주간 뷰일 경우 날짜 위에 요일 표시 */}
                {viewMode === 'week' && <span className="day-name">{DAY_NAMES[day.getDay()]}</span>}
                <span className="day-number">{day.getDate()}</span>
                
                {/* 상태 인디케이터 렌더링 */}
                <div className="indicators-container">
                  {stats.activeCount > 0 && (
                    <span className="indicator active-badge">
                      {isSelected ? stats.activeCount : ''}
                    </span>
                  )}
                  {stats.completedCount > 0 && (
                    <span className="indicator completed-badge">
                      {isSelected ? stats.completedCount : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </header>
      
      {/* Todo 입력 폼 */}
      <form className="todo-form" onSubmit={handleAddTodo}>
        <input 
          type="text" 
          className="todo-input" 
          placeholder="할 일을 입력하세요..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)} 
        />
        <button type="submit" className="add-btn">추가</button>
      </form>

      {/* 상태별 필터 탭 */}
      <div className="filter-container">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>전체</button>
        <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>진행 중</button>
        <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>완료</button>
      </div>

      {/* Todo 목록 영역 */}
      <ul className="todo-list">
        {filteredTodos.length === 0 ? (
          <li className="empty-msg">이 날짜에 등록된 할 일이 없습니다.</li>
        ) : (
          filteredTodos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              {editingId === todo.id ? (
                <>
                  <input 
                    type="text" 
                    className="edit-input"
                    value={editInputText}
                    onChange={(e) => setEditInputText(e.target.value)}
                    autoFocus
                  />
                  <div className="btn-group">
                    <button className="action-btn save-btn" onClick={() => saveEdit(todo.id)}>저장</button>
                    <button className="action-btn cancel-btn" onClick={() => setEditingId(null)}>취소</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="todo-text">{todo.text}</span>
                  <div className="btn-group">
                    <button className="action-btn complete-btn" onClick={() => toggleComplete(todo.id)}>
                      {todo.completed ? '취소' : '완료'}
                    </button>
                    <button className="action-btn edit-btn" onClick={() => startEditing(todo.id, todo.text)} disabled={todo.completed}>수정</button>
                    <button className="action-btn delete-btn" onClick={() => deleteTodo(todo.id)}>삭제</button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;