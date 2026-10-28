import type { NewTask, Task } from "../types/types";

const STORAGE_KEY = "tasks";

// FASE 1 - Tiempo de espera antes de responder, para que se vea el estado de carga.
// Simula la latencia de red que tendrá Firestore.
const STORAGE_DELAY_MS = 2000;

/**
 * FASE 1 - Espera antes de leer o escribir en el storage.
 * Permite que se vea el estado de carga en la UI.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// FASE 1 - Leer todas las tareas
export const getTasks = async (): Promise<Task[]> => {
  await delay(STORAGE_DELAY_MS);

  const localTasks = localStorage.getItem(STORAGE_KEY);
  if (localTasks === null) return [];

  return JSON.parse(localTasks) as Task[];
};

// FASE 1 - Crear una tarea
export const addTask = async (task: NewTask): Promise<Task> => {
  await delay(STORAGE_DELAY_MS);

  const localTasks = localStorage.getItem(STORAGE_KEY);
  const tasks = localTasks === null ? [] : (JSON.parse(localTasks) as Task[]);

  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...tasks, newTask]));

  return newTask;
};

// FASE 1 - Actualizar una tarea
export const updateTask = async (task: Task): Promise<Task> => {
  await delay(STORAGE_DELAY_MS);

  const { id, ...changes } = task;

  const localTasks = localStorage.getItem(STORAGE_KEY);
  const tasks = localTasks === null ? [] : (JSON.parse(localTasks) as Task[]);

  const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, ...changes } : t));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));

  return task;
};

// FASE 1 - Eliminar una tarea
export const deleteTask = async (task: Task): Promise<Task> => {
  await delay(STORAGE_DELAY_MS);

  const { id } = task;

  const localTasks = localStorage.getItem(STORAGE_KEY);
  const tasks = localTasks === null ? [] : (JSON.parse(localTasks) as Task[]);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks.filter((t) => t.id !== id))
  );

  return task;
};
