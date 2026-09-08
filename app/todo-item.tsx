"use client";

import { useTransition } from "react";
import { toggleTodo, deleteTodo } from "./actions";

type Todo = {
  id: string;
  title: string;
  is_complete: boolean;
};

export function TodoItem({ todo }: Readonly<{ todo: Todo }>) {
  const [isPending, startTransition] = useTransition();

  return (
    <li style={{ opacity: isPending ? 0.5 : 1 }}>
      <label>
        <input
          type="checkbox"
          checked={todo.is_complete}
          onChange={(e) =>
            startTransition(() => toggleTodo(todo.id, e.target.checked))
          }
        />
        <span
          style={{
            textDecoration: todo.is_complete ? "line-through" : "none",
            margin: "0 8px",
          }}
        >
          {todo.title}
        </span>
      </label>
      <button
        type="button"
        onClick={() => startTransition(() => deleteTodo(todo.id))}
      >
        Delete
      </button>
    </li>
  );
}
