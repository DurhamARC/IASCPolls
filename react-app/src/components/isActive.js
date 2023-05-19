
import React, { useState } from 'react';

export default function Symbol(props) {
    const [isActive, setIsActive] = useState(props.isActive);
  
    const handleClick = () => {
      if (!isActive) {
        if (window.confirm("Are you sure you want to stop the survey?")) {
          setIsActive(!isActive);
        }
      } else {
        if (window.confirm("Are you sure you want to open the survey again?")) {
          setIsActive(!isActive);
        }
      }
      // post this to a database
    };

  
    const style = {
      color: isActive ? 'green' : 'red'
    };
  
    return (
      <span className="material-symbols-outlined" onClick={handleClick} style={style}>
        {isActive ? props.activeSymbol : props.inactiveSymbol}
      </span>
    );
  }