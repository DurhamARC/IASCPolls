import React, { useCallback, useMemo, useState } from "react";
import Alert from "./Alert";

export const MessageContext = React.createContext([]);

/**
 * MessageHandler controls display of messages to the visitor
 * @param messages - an array of messages
 * @param removeMessage
 * @returns {JSX.Element}
 * @constructor
 */
function MessageHandler({ messages = [], removeMessage }) {
  if (messages.length === 0) return <> </>;

  return (
    <div className="alert--float">
      {messages.map((row) => (
        <div key={row.id}>
          <Alert
            id={row.id}
            title={row.title}
            severity={row.severity}
            callback={removeMessage}
          >
            {row.message}
          </Alert>
        </div>
      ))}
    </div>
  );
}

/**
 * Extract an error message from a server XHR response
 * @param e
 * @returns {string|*}
 */
function getErrorMessage(e) {
  // Handle various types of object which might be used as err.message:
  if (
    typeof e === "object" &&
    "request" in e &&
    e.request instanceof XMLHttpRequest
  ) {
    // If we got an XHR response
    if (typeof e.response.data === "object") {
      // Which contained a JSON object from the Django server...
      if ("message" in e.response.data) {
        // And it had a message inside the data field!
        return e.response.data.message;
      }
      if ("detail" in e.response.data) {
        // Or maybe that field was called "detail".
        return e.response.data.detail;
      }
      // Otherwise, we didn't find it. All else failed, so return a string representation
      return JSON.stringify(e.response.data);
    }
    if (typeof e.response.data === "string") {
      // Or XHR response contained just a string
      return e.response.data;
    }
  }

  // Or if it was just a string by itself, or we didn't find anything valid:
  return e;
}

/** *
 * MessageProvider allows state transfer using React Context,
 * to allow messages to be passed from anywhere in the React
 * Component tree under the provider (which we put in App.jsx).
 *
 * See: https://react.dev/learn/passing-data-deeply-with-context
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
function MessageProvider({ children }) {
  const [messages, setMessages] = useState([]);

  /**
   * The structure used for the message object
   * @type {{severity: string, id: null, title: string, message: string}}
   */
  const message = {
    title: "",
    message: "",
    severity: "error",
    id: null,
  };

  /**
   * Possible levels of severity for a message
   */
  const levels = ["error", "warning", "info"];

  /**
   * Generate a random key to identify a message, with low conflict probability
   * @returns {number}
   */
  function getRandomID() {
    return (
      new Date(Date.now()).valueOf() * 1000 + Math.floor(Math.random() * 1000)
    );
  }

  /**
   * Put a message on the messages stack
   * @type {(function(*, *))|*}
   */
  const pushMessage = useCallback((body, title, severity) => {
    const err = { ...message };

    err.title = title;
    err.message = body;
    err.id = getRandomID();

    if (typeof title === "undefined") err.title = "A problem occurred:";
    if (levels.includes(severity)) err.severity = severity;

    setMessages([...messages, err]);
  });

  /**
   * Add an error to the messages stack
   * Intelligently handle objects passed: an error with a request in it
   * will use the value of that message. We also support messages returned
   * from the server in the JSON {message: ""} field.
   * @type {(function(*): void)|*}
   */
  const pushError = useCallback((e, title) => {
    const err = { ...message };
    err.title = title;
    if (typeof title === "undefined") err.title = "A problem occurred:";

    err.severity = "error";
    err.id = getRandomID();
    err.message = getErrorMessage(e);

    // Add the message for display:
    setMessages([...messages, err]);
  });

  /**
   * Remove message from messages array by key
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
  });

  /**
   * Use a React Memo to transfer context value
   * @type {{removeError: (function(*): void)|*, pushError: (function(*): void)|*}}
   */
  const contextValue = useMemo(
    () => ({
      pushMessage,
      pushError,
      removeMessage,
    }),
    [pushMessage, pushError, removeMessage]
  );

  /**
   * Return the MessageProvider as React component
   */
  return (
    <MessageContext.Provider value={contextValue}>
      <MessageHandler messages={messages} removeMessage={removeMessage} />
      {children}
    </MessageContext.Provider>
  );
}

const MessageConsumer = MessageContext.Consumer;
export { MessageProvider, MessageConsumer, getErrorMessage };
