import { useAuth } from "../../../contexts/AuthContext.tsx";

const Protected = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Protegido</h1>
      <p>Sesión activa: {user?.email}</p>
    </div>
  );
};

export default Protected;
