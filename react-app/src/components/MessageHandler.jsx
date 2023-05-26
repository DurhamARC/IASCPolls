import React, { useCallback, useMemo, useState } from "react";
import Alert from "./Alert";

export const MessageContext = React.createContext([]);

function MessageHandler({ errors: messages = [], removeError }) {
  if (messages.length === 0) return <> </>;

  return (
    <div className="alert--float">
      {messages.map((row) => (
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
function MessageProvider({ children }) {
  const [messages, setMessages] = useState([]);

  /**
   * Add error to error array
   * @type {(function(*): void)|*}
   */
  const pushError = useCallback((e, title) => {
    let messageTitle = title;
    if (typeof title === "undefined") {
      messageTitle = "A problem occurred:";
    }
    const err = {
      messageTitle,
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

    setMessages([...messages, err]);
  });

  /**
   * Remove error from error array by key
   * @type {(function(*): void)|*}
   */
  const removeMessage = useCallback((key) => {
    const index = ((find) => {
      for (let x = 0; x < messages.length; x += 1)
        if (messages[x].id === find) return x;
      return -1; // not found
    })(key);

    if (index > -1) {
      // .splice() returns the element removed and modifies the array
      // This is no good because React state is immutable: we have to
      // copy all the messages to a new array before resetting it:
      const newerrors = [...messages];
      newerrors.splice(index, 1);
      setMessages(newerrors);
    }
    // console.log(messages.length, index, messages);
  });

  /**
   * Use a React Memo to transfer context value
   * @type {{removeError: (function(*): void)|*, pushError: (function(*): void)|*}}
   */
  const contextValue = useMemo(
    () => ({
      pushError,
      removeMessage,
    }),
    [pushError, removeMessage]
  );

  /**
   * Return the element
   */
  return (
    <MessageContext.Provider value={contextValue}>
      <MessageHandler errors={messages} removeMessage={removeMessage} />
      {children}
    </MessageContext.Provider>
  );
}

const MessageConsumer = MessageContext.Consumer;
export { MessageProvider, MessageConsumer };
