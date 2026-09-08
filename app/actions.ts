"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/lib/supabase/server";

export async function addTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = createSupabaseClient();
  const { error } = await supabase.from("todos").insert({ title });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function toggleTodo(id: string, isComplete: boolean) {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("todos")
    .update({ is_complete: isComplete })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function deleteTodo(id: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
