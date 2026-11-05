import { useState } from "react";
import Button from "../Button/Button";

const LikeExample = () => {
  const [like, setLike] = useState(false);

  const handleLike = () => {
    setLike((prev) => !prev);
  };

  return (
    <article>
      <h2>Card con Like</h2>
      <Button variant={like ? "default" : "ghost"} onClick={handleLike}>
        {like ? "👍" : "👎"}
      </Button>
    </article>
  );
};

export default LikeExample;
