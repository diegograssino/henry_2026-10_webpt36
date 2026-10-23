import { useParams } from "react-router";

const Params = () => {
  const { id } = useParams();
  // fetc("http:/www.backend.com/user/${id}")
  return <h1>Params: {id || "Sin params"}</h1>;
};

export default Params;
