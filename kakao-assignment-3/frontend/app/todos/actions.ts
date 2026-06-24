"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) throw new Error("BACKEND_URL is not defined");

export type ActionState = {
  error?: string;
};

// 새 Todo 생성 — NewTodoForm에서 호출
export async function createTodo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const text = (formData.get("text") as string)?.trim();
  const date = formData.get("date") as string;

  if (!text) {
    return { error: "할 일 내용을 입력해주세요." };
  }

  const res = await fetch(`${BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, date, completed: false }),
  });

  if (!res.ok) {
    return { error: "할 일 생성 중 오류가 발생했습니다." };
  }

  revalidatePath("/todos");
  redirect("/todos");
}

// Todo 수정 — EditTodoForm에서 호출 (id는 bind로 주입)
export async function updateTodo(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const text = (formData.get("text") as string)?.trim();
  const date = formData.get("date") as string;
  const completed = formData.get("completed") === "true";

  if (!text) {
    return { error: "할 일 내용을 입력해주세요." };
  }

  const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, date, completed }),
  });

  if (!res.ok) {
    return { error: "할 일 수정 중 오류가 발생했습니다." };
  }

  revalidatePath("/todos");
  redirect("/todos");
}
