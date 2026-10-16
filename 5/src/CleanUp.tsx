import { useEffect, useState } from "react";

const CleanUp = () => {
  const [jumping, setJumping] = useState(false);
  const [freq, setFreq] = useState(1000);

  useEffect(() => {
    console.log("-----------");
    if (!jumping) return;
    const intervalId = setInterval(() => {
      console.log("interval id jumping: ", intervalId);
    }, freq);
    console.log("New interval id: ", intervalId);
    return () => {
      console.log("-----------");
      console.log("Killing interval id:", intervalId);
      clearInterval(intervalId);
    };
  }, [jumping, freq]);

  return (
    <>
      <button onClick={() => setJumping((r) => !r)}>
        {jumping ? "Parar" : "Empezar"}
      </button>
      <button
        onClick={() => setFreq((s) => (s === 1000 ? 500 : 1000))}
        disabled={!jumping}
      >
        Cambiar velocidad ({freq}ms)
      </button>
    </>
  );
};

export default CleanUp;
