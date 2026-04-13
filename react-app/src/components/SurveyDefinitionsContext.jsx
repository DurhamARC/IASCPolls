import React, { createContext, useContext, useEffect, useState } from "react";
import { client } from "../Api";
import { AuthContext } from "./AuthContext";

const SurveyDefinitionsContext = createContext({});

/**
 * Fetches survey template definitions from /api/survey/templates/ when the
 * user is authenticated and provides them as a {slug: {label, questions}}
 * dict — the same shape as the former static surveyDefinitions.js import.
 *
 * Returns an empty dict when the user is not logged in or while loading;
 * consuming components should handle this gracefully (e.g. render null until
 * the dict is populated).
 */
export function SurveyDefinitionsProvider({ children }) {
  const { isAuth } = useContext(AuthContext);
  const [definitions, setDefinitions] = useState({});

  useEffect(() => {
    if (!isAuth) {
      setDefinitions({});
      return;
    }
    client
      .get("/api/survey/templates/")
      .then(({ data }) => {
        setDefinitions(
          Object.fromEntries(
            data.map((t) => [t.slug, { label: t.label, questions: t.slots }])
          )
        );
      })
      .catch(() => {
        setDefinitions({});
      });
  }, [isAuth]);

  return (
    <SurveyDefinitionsContext.Provider value={definitions}>
      {children}
    </SurveyDefinitionsContext.Provider>
  );
}

export function useSurveyDefinitions() {
  return useContext(SurveyDefinitionsContext);
}
