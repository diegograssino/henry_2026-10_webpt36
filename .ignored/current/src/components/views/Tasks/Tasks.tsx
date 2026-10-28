import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext.tsx";
import {
  addTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../../../services/taskService";
import type { Task } from "../../../types/types";
import Button from "../../ui/Button/Button";

const Tasks = () => {
  // FASE 2 - El userId sale del Context (ya existe de la clase 8)
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  // Un solo loading: cubre la carga inicial y todas las operaciones (crear, completar, eliminar)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");

  // FASE 2 - Al montar, pedir las tareas al service
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch {
        setError("No se pudieron cargar las tareas.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // FASE 2 - Crear una tarea y agregarla al estado, sin recargar la página
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (title.length < 2) return;

    setLoading(true);

    try {
      const newTask = await addTask({
        title: title,
        completed: false,
        userId: user?.uid ?? "",
        createdAt: new Date().toISOString(),
      });

      setTasks([...tasks, newTask]);
      setTitle("");
    } catch {
      setError("No se pudo crear la tarea.");
    } finally {
      setLoading(false);
    }
  };

  // FASE 2 - Marcar una tarea como completada o pendiente
  const handleToggle = async (task: Task) => {
    setLoading(true);

    try {
      const updated = await updateTask({ ...task, completed: !task.completed });

      setTasks(
        tasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
      );
    } catch {
      setError("No se pudo actualizar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  // FASE 2 - Eliminar una tarea
  const handleDelete = async (task: Task) => {
    setLoading(true);

    try {
      const deleted = await deleteTask(task);
      setTasks(tasks.filter((t) => t.id !== deleted.id));
    } catch {
      setError("No se pudo eliminar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  // FASE 2 - Early returns: si está cargando, muestra cargando.
  // Si hay error, muestra el error. Si no, muestra los datos.
  if (loading) {
    return <p>Cargando tareas...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Mis tareas</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">Nueva tarea:</label>
        <br />
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Escribí una tarea"
        />
        <br />
        <Button type="submit" disabled={title.length < 2}>
          Agregar
        </Button>
      </form>

      {tasks.length === 0 ? (
        <p>No hay tareas todavía.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <p>{task.title}</p>
              <p>
                {task.completed ? "Completada" : "Pendiente"} ·{" "}
                {new Date(task.createdAt).toLocaleString("es")}
              </p>
              <Button onClick={() => void handleToggle(task)}>
                {task.completed ? "Marcar pendiente" : "Completar"}
              </Button>
              <Button variant="danger" onClick={() => void handleDelete(task)}>
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tasks;
