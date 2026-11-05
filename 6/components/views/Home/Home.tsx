import { Link, useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/about");
  };

  return (
    <>
      <h1>Home</h1>
      {/* Esto es navegacion por eventos, o sea, hago click en algo y navego a cierto lugar */}
      {/* Esto hace que salga del V-DOM, que salga de React, no debo usarlo salvo casos puntuales */}
      <a href="/about">About</a>
      <br />
      {/* Este es el componente que siempre debo utilizar */}
      <Link to="/about">About (con Link)</Link>
      {/* Esto es navegacion programatica */}
      <br />
      <button onClick={handleNavigate}>About (con navigate)</button>
    </>
  );
};

export default Home;
