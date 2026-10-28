export interface RegisterFormValues {
  email: string;
  password: string;
}

export interface RegisterFormErrors {
  email: string | null;
  password: string | null;
}

export interface RegisterFormTouched {
  email: boolean;
  password: boolean;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email: string | null;
  password: string | null;
}

export interface LoginFormTouched {
  email: boolean;
  password: boolean;
}

// FASE 1 - A task. The userId ties it to the authenticated user.
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

// FASE 1 - The data we send to the service (without id: the storage generates it)
export type NewTask = Omit<Task, "id">;
