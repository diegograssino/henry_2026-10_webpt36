import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { NewTask, Task } from "../types/types";

const TASKS_COLLECTION = "tasks";

// FASE 6 - Leer las tareas del usuario, ordenadas por fecha de creación
export const getTasks = async (userId: string): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  // Cada documento trae el id aparte y los campos en doc.data().
  // El spread los deja planos, igual que el modelo Task.
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Task,
  );
};

// FASE 6 - Crear una tarea en la nube
export const addTask = async (task: NewTask): Promise<Task> => {
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);

  return {
    id: docRef.id,
    ...task,
  };
};

// FASE 6 - Actualizar una tarea
export const updateTask = async (task: Task): Promise<Task> => {
  const { id, ...changes } = task;

  await updateDoc(doc(db, TASKS_COLLECTION, id), changes);

  return task;
};

// FASE 6 - Eliminar una tarea
export const deleteTask = async (task: Task): Promise<Task> => {
  const { id } = task;

  await deleteDoc(doc(db, TASKS_COLLECTION, id));

  return task;
};
