import React, { useState, useEffect } from "react";

function CountdownTimer({ initialTime }) {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const interval = setInterval(() => {
      if (time <= 0) {
        clearInterval(interval);
      } else {
        setTime(time - 1);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [time]);

  const minutes = Math.floor(time / 60).toString().padStart(2, "0");
  const seconds = (time % 60).toString().padStart(2, "0");

  return (
    <div>
      {minutes}:{seconds}
    </div>
  );
}

export default CountdownTimer;
