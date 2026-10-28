// ============================================================================
// Consultas en Firestore — ejemplos comentados
//
// Los operadores de "where" son STRINGS, no operadores de JavaScript.
// Por eso es "==" y NO "===". La SDK los interpreta y arma el filtro en el
// backend.
//
//   "=="             igual a
//   "!="             distinto de
//   "<"              menor que
//   "<="             menor o igual que
//   ">"              mayor que
//   ">="             mayor o igual que
//   "in"             dentro de una lista
//   "not-in"         fuera de una lista
//   "array-contains" el array del documento contiene el valor
// ============================================================================

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Task } from "../types/types";

const TASKS_COLLECTION = "tasks";

// ----------------------------------------------------------------------------
// 1. IGUAL A — las tareas de un usuario
// ----------------------------------------------------------------------------
// El filtro por userId: cada persona ve solo lo suyo.
export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};

// ----------------------------------------------------------------------------
// 2. IGUAL A con orden — las tareas de un usuario, las mas recientes primero
// ----------------------------------------------------------------------------
// El "orderBy" va DESPUES del "where". Ademas, para ordenar por un campo que
// no sea el id, Firestore necesita un indice compuesto (lo crea solo la
// primera vez y lo avisa en la consola).
export const getTasksByUserOrdered = async (
  userId: string
): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};

// ----------------------------------------------------------------------------
// 3. VARIAS CONDICIONES — las tareas PENDIENTES de un usuario
// ----------------------------------------------------------------------------
// Se pueden encadenar varios "where". Cada uno agrega una condicion AND:
//   userId == X  AND  completed == false
export const getPendingTasks = async (userId: string): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
    where("completed", "==", false),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};

// ----------------------------------------------------------------------------
// 4. DISTINTO DE — las tareas COMPLETADAS de un usuario
// ----------------------------------------------------------------------------
// El "!=" es un string igual que el "==".
export const getCompletedTasks = async (userId: string): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
    where("completed", "!=", false),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};

// ----------------------------------------------------------------------------
// 5. COMPARACION DE RANGO — las tareas creadas despues de una fecha
// ----------------------------------------------------------------------------
// ">=" y "<" comparan strings. Por eso el createdAt se guarda como ISO
// (que ordena bien como texto) y no como un Date.
export const getTasksSince = async (
  userId: string,
  date: string
): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
    where("createdAt", ">=", date),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};

// ----------------------------------------------------------------------------
// 6. DENTRO DE UNA LISTA — las tareas de varios usuarios
// ----------------------------------------------------------------------------
// El "in" recibe un array de valores.
// OJO: maximo 30 valores por consulta en Firestore.
export const getTasksFromUsers = async (
  userIds: string[]
): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "in", userIds),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};

// ----------------------------------------------------------------------------
// 7. UN ARRAY QUE CONTIENE UN VALOR — las tareas con una etiqueta
// ----------------------------------------------------------------------------
// Si el documento tiene { tags: ["urgente", "clase"] }, el "array-contains"
// encuentra los que tienen esa etiqueta.
export const getTasksByTag = async (
  userId: string,
  tag: string
): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
    where("tags", "array-contains", tag),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};

// ----------------------------------------------------------------------------
// 8. LIMITAR LA CANTIDAD — las 10 tareas mas recientes
// ----------------------------------------------------------------------------
// El "limit" va al final. Se usa para paginar: se piden 10, y despues otros 10
// arrancando desde el ultimo id visto.
export const getRecentTasks = async (userId: string): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(10),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Task);
};
