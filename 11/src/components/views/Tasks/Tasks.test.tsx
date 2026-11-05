import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Task } from "../../../types/types";
import Tasks from "./Tasks";

// Debo mockear los servicios que hacen referencia a Firebase y que voy a utilizar en mis test
const { mockGetTasks, mockAddTask } = vi.hoisted(() => ({
  mockGetTasks: vi.fn(),
  mockAddTask: vi.fn(),
}));

// Mock del hook useAuth (context de autenticación)
vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      uid: "mockedUserId",
      email: "test@test.com",
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock de los servicios de tareas
vi.mock("../../../services/taskServices", () => ({
  getTasks: mockGetTasks,
  addTask: mockAddTask,
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

// La tarea que devuelve el mock cuando le piden la lista.
const tasksMock: Task[] = [
  {
    id: "1",
    title: "Tarea mock",
    completed: false,
    userId: "usuario-de-prueba",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

// La tarea que se usa al crear una nueva
const taskNewMock: Task = {
  id: "nueva",
  title: "Comprar pan",
  completed: false,
  userId: "usuario-de-prueba",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("Tasks view", () => {
  it("renders the Tasks view and show the heading", async () => {
    //   1. Asegurarme que tenga todos los servicios y funciones mockeados
    mockGetTasks.mockResolvedValue(tasksMock);
    //   2. Renderizar el componente con una Wrapper que tenga el AuthContext
    render(<Tasks />);
    //   3. Verificar que suceda lo que espero
    expect(await screen.findByTestId("tasks-title")).toBeInTheDocument();
  });

  it("renders empty Tasks view when no tasks are available", async () => {
    //   1. Asegurarme que tenga todos los servicios y funciones mockeados
    mockGetTasks.mockResolvedValue([]);
    //   2. Renderizar el componente con una Wrapper que tenga el AuthContext
    render(<Tasks />);
    //   3. Verificar que suceda lo que espero
    expect(await screen.findByText("No hay tareas")).toBeInTheDocument();
    expect(await screen.findByTestId("tasks-empty")).toBeInTheDocument();
  });

  it("renders the task when a task is available", async () => {
    //   1. Asegurarme que tenga todos los servicios y funciones mockeados
    mockGetTasks.mockResolvedValue(tasksMock);
    //   2. Renderizar el componente con una Wrapper que tenga el AuthContext
    render(<Tasks />);
    //   3. Verificar que suceda lo que espero
    expect(await screen.findByText(tasksMock[0].title)).toBeInTheDocument();
  });

  it("renders add button when a task is available", async () => {
    //   1. Antes seteo el manejador de eventos para poder escribir o clickear, o generar cualquier evento
    const user = userEvent.setup();
    //   2. Asegurarme que tenga todos los servicios y funciones mockeados
    mockGetTasks.mockResolvedValue([]);
    mockAddTask.mockResolvedValue(taskNewMock);
    //   3. Renderizar el componente con una Wrapper que tenga el AuthContext
    render(<Tasks />);
    // 4. Debo esperar a que aparezcan las tareas
    expect(await screen.findByTestId("tasks-title")).toBeInTheDocument();
    //   4. Interctuar para generar los eventos
    await user.type(screen.getByTestId("task-title-input"), taskNewMock.title);
    // Se deja como ejemplo pero ojo que puede romperse facilmente
    await user.click(screen.getByRole("button", { name: "Agregar" }));
    //   5. Verificar que suceda lo que espero
    expect(await screen.findByText(taskNewMock.title)).toBeInTheDocument();
  });
});
