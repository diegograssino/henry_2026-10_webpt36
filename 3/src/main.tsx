import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    {/* Esto es el equivalente a llamar la funcion App y que nos de lo que retorne, es SIMPLENTE OTRA FORMA DE ESCRIBIRLO (en JSX)

      App( 1, 2 )
      <App a={1} b={2}/>

    function App() {
      return {
        <h1>Esto es JSX</h1>
      }
    }

    */}
  </StrictMode>,
);
