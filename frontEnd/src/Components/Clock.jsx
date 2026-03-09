import React, { useState, useEffect } from "react";

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Set up an interval to update the time every second
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(timerId);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <div className="text-right">
      <p className="text-lg font-semibold text-base-content">{time.toLocaleTimeString()}</p>
      <p className="text-sm text-base-content/60">{time.toLocaleDateString()}</p>
    </div>
  );
}

export default Clock;