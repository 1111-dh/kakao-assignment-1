from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional

import os
from dotenv import load_dotenv

load_dotenv(".env.local")

# DB 설정
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# DB 모델 (테이블 구조 정의)
class Todo(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    date = Column(String, nullable=False)  # "YYYY-MM-DD" 형식

# Pydantic 스키마 (요청/응답 데이터 구조 정의)
class TodoCreate(BaseModel):
    text: str
    completed: bool = False
    date: str  # "YYYY-MM-DD" 형식

class TodoUpdate(BaseModel):
    text: Optional[str] = None
    completed: Optional[bool] = None
    date: Optional[str] = None

class TodoResponse(BaseModel):
    id: int
    text: str
    completed: bool
    date: str

    class Config:
        from_attributes = True

# 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI 앱 생성
app = FastAPI(title="Todo API")

# FastAPI 앱 미들웨어 및 CORS 설정
FRONTEND_URL = os.getenv("FRONTEND_URL")
if not FRONTEND_URL:
    raise ValueError("FRONTEND_URL environment variable is not set")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 엔드포인트 구현

# GET /todos - 전체 Todo 목록 조회
@app.get("/todos", response_model=list[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    return db.query(Todo).all()

# POST /todos - 새 Todo 생성
@app.post("/todos", response_model=TodoResponse, status_code=201)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    new_todo = Todo(
        text=todo.text,
        completed=todo.completed,
        date=todo.date,
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

# GET /todos/{id} - 단건 Todo 조회
@app.get("/todos/{id}", response_model=TodoResponse)
def get_todo(id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다.")
    return db_todo

# PUT /todos/{id} - Todo 수정
@app.put("/todos/{id}", response_model=TodoResponse)
def update_todo(id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다.")
    if todo.text is not None:
        db_todo.text = todo.text
    if todo.completed is not None:
        db_todo.completed = todo.completed
    if todo.date is not None:
        db_todo.date = todo.date
    db.commit()
    db.refresh(db_todo)
    return db_todo

# DELETE /todos/{id} - Todo 삭제
@app.delete("/todos/{id}", status_code=204)
def delete_todo(id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다.")
    db.delete(db_todo)
    db.commit()