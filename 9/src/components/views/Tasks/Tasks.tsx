import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  addTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../../../services/taskServices";
import type { Task } from "../../../types/types";
import Button from "../../ui/Button/Button";

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks(user?.uid);
        setTasks(data);
      } catch {
        setError("Error al cargar las tareas");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const newTask = await addTask({
        title: title,
        completed: false,
        userId: user?.uid ?? "unknown",
        createdAt: new Date().toISOString(),
      });
      setTasks([...tasks, newTask]);
      setTitle("");
    } catch {
      setError("Error al crear la tarea");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (task: Task) => {
    setIsLoading(true);

    try {
      const updatedTask = await updateTask({
        ...task,
        completed: !task.completed,
      });
      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
      setTitle("");
    } catch {
      setError("Error al actualizar la tarea");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (task: Task) => {
    setIsLoading(true);

    try {
      const deletedTask = await deleteTask(task);
      setTasks(tasks.filter((task) => task.id !== deletedTask.id));
      setTitle("");
    } catch {
      setError("Error al borrar la tarea");
    } finally {
      setIsLoading(false);
    }
  };

  // Early return
  if (isLoading) {
    return (
      <div>
        <p>Cargando tareas...</p>
      </div>
    );
  }

  // Early return
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Tareas</h1>
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
        {/* Esta validacion es simple, debe ser mejorada y mas exacta */}
        <Button type="submit" disabled={title.length < 2}>
          Agregar
        </Button>
      </form>
      {tasks.length !== 0 ? (
        tasks.map((task, i) => (
          // Se pueden agregar inline edition para otros campos, por ejemplo el title
          <div key={i}>
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
          </div>
        ))
      ) : (
        <h2>No hay tareas</h2>
      )}
    </div>
  );
};

export default Tasks;
