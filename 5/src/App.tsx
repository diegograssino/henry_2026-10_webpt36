import { useEffect, useState } from "react";
import CleanUp from "./CleanUp";
import Persistence from "./assets/Persistence";

function App() {
  const [counter, setCounter] = useState(0);
  const [counter2, setCounter2] = useState(0);
  const [posts, setPosts] = useState([]);

  // const [firstRender, setFirstRender] = useState(true);

  // Sintaxis (es un IIFE)
  // useEffect(() => {
  //   first

  //   return () => {
  //     second
  //   }
  // }, [third])

  useEffect(() => {
    console.log("----------------");
    console.log("useEffect sin deps, se ejecuta en cada render");
    console.log("Nuevo render");
  });

  useEffect(() => {
    console.log("----------------");
    console.log("useEffect con [] deps vacias");
    console.log("Primer render");
  }, []);

  useEffect(() => {
    console.log("----------------");
    console.log("useEffect con [counter] deps");
    console.log("Counter cambió");
  }, [counter]);

  useEffect(() => {
    console.log("----------------");
    console.log("useEffect con [counter2] deps");
    console.log("Counter2 cambió");
  }, [counter2]);

  // Caso de fetching de datos
  useEffect(() => {
    async function apiFetch() {
      await fetch("https://jsonplaceholder.typicode.com/posts")
        .then((res) => res.json())
        .then((json) => setPosts(json));
    }
    apiFetch();
  }, []);

  return (
    <>
      <h1>useEffect</h1>
      <p>1: {counter}</p>
      <button onClick={() => setCounter((prev) => prev + 1)}>Increment</button>
      <p>2: {counter2}</p>
      <button onClick={() => setCounter2((prev) => prev + 1)}>Increment</button>
      {/* {posts.map((post, i) => (
        <div key={i}>{post.title}</div>
      ))} */}
      <br />
      <br />
      <CleanUp />
      <br />
      <br />
      <Persistence />
    </>
  );
}

export default App;
