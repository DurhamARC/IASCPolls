import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { client } from "../Api";
import { AuthContext } from "./AuthContext";

const SurveyDefinitionsContext = createContext({});
const SurveyDefinitionsRefreshContext = createContext(() => {});

/**
 * Fetches survey template definitions from /api/survey/templates/ when the
 * user is authenticated and provides them as a {slug: {label, questions}}
 * dict — the same shape as the former static surveyDefinitions.js import.
 *
 * Returns an empty dict when the user is not logged in or while loading;
 * consuming components should handle this gracefully (e.g. render null until
 * the dict is populated).
 *
 * Also provides a refresh() function via useRefreshSurveyDefinitions() that
 * forces a re-fetch (e.g. after a template is created or deleted).
 */
export function SurveyDefinitionsProvider({ children }) {
  const { isAuth } = useContext(AuthContext);
  const [definitions, setDefinitions] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

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
  }, [isAuth, refreshKey]);

  return (
    <SurveyDefinitionsRefreshContext.Provider value={refresh}>
      <SurveyDefinitionsContext.Provider value={definitions}>
        {children}
      </SurveyDefinitionsContext.Provider>
    </SurveyDefinitionsRefreshContext.Provider>
  );
}

export function useSurveyDefinitions() {
  return useContext(SurveyDefinitionsContext);
}

export function useRefreshSurveyDefinitions() {
  return useContext(SurveyDefinitionsRefreshContext);
}
