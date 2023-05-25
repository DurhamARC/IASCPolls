import React, { useCallback, useMemo, useState } from "react";
import Alert from "./Alert";

export const ErrorContext = React.createContext([]);

function ErrorHandler({ errors = [], removeError }) {
  if (errors.length === 0) return <> </>;

  return (
    <div className="alert--float">
      {errors.map((row) => (
        <div key={row.id}>
          <Alert
            id={row.id}
            title={row.title}
            severity={row.severity}
            callback={removeError}
          >
            {row.message}
          </Alert>
        </div>
      ))}
    </div>
  );
}

/** *
 * Error Provider allows state transfer using React Context
 * See: https://react.dev/learn/passing-data-deeply-with-context
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);

  /**
   * Add error to error array
   * @type {(function(*): void)|*}
   */
  const pushError = useCallback((e) => {
    const err = {
      title: "A problem occurred:",
      message: "",
      severity: "error",
      // Generate a random key with low conflict probability:
      id:
        new Date(Date.now()).valueOf() * 1000 +
        Math.floor(Math.random() * 1000),
    };

    // Handle various types of object which might be passed:
    if (
      typeof e === "object" &&
      "request" in e &&
      e.request instanceof XMLHttpRequest
    ) {
      if (typeof e.response.data === "object") {
        if ("message" in e.response.data) {
          err.message = e.response.data.message;
        } else {
          err.message = JSON.stringify(e.response.data);
        }
      }
    } else if (typeof e === "string") {
      err.message = e;
    }

    setErrors([...errors, err]);
  });

  /**
   * Remove error from error array by key
   * @type {(function(*): void)|*}
   */
  const removeError = useCallback((key) => {
    const index = ((find) => {
      for (let x = 0; x < errors.length; x += 1)
        if (errors[x].id === find) return x;
      return -1; // not found
    })(key);

    if (index > -1) {
      // .splice() returns the element removed and modifies the array
      // This is no good because React state is immutable: we have to
      // copy all the errors to a new array before resetting it:
      const newerrors = [...errors];
      newerrors.splice(index, 1);
      setErrors(newerrors);
    }
    // console.log(errors.length, index, errors);
  });

  /**
   * Use a React Memo to transfer context value
   * @type {{removeError: (function(*): void)|*, pushError: (function(*): void)|*}}
   */
  const contextValue = useMemo(
    () => ({
      pushError,
      removeError,
    }),
    [pushError, removeError]
  );

  /**
   * Return the element
   */
  return (
    <ErrorContext.Provider value={contextValue}>
      <ErrorHandler errors={errors} removeError={removeError} />
      {children}
    </ErrorContext.Provider>
  );
}

const ErrorConsumer = ErrorContext.Consumer;
export { ErrorProvider, ErrorConsumer };
