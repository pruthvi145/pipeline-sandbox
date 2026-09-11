import { createSupabaseClient } from "@/lib/supabase/server";
import { addTodo } from "./actions";
import { TodoItem } from "./todo-item";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createSupabaseClient();
  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, title, is_complete")
    .order("created_at", { ascending: false });

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Pipeline Sandbox Todos</h1>
      <p style={{ color: "#666", fontSize: 14 }}>
        Throwaway CI/CD test app - not a real product.
      </p>

      <form action={addTodo} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input name="title" placeholder="New todo" required style={{ flex: 1 }} />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {(todos ?? []).map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </main>
  );
}
// hotfix test 1
// hotfix test 2
