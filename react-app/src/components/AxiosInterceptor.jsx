import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../Api";
import { AuthContext } from "./AuthContext";

/**
 * Registers a global axios response interceptor that clears auth state and
 * redirects to /login whenever the server returns 401 or 403 while the user
 * is considered authenticated (isAuth is truthy in AuthContext).
 *
 * Must be rendered inside both <AuthProvider> and <BrowserRouter>.
 * Renders nothing.
 */
function AxiosInterceptor() {
  const { isAuth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Keep refs in sync so the interceptor always sees the latest values
  // without needing to be re-registered on every render.
  const isAuthRef = useRef(isAuth);
  const setAuthRef = useRef(setAuth);
  const navigateRef = useRef(navigate);

  isAuthRef.current = isAuth;
  setAuthRef.current = setAuth;
  navigateRef.current = navigate;

  useEffect(() => {
    const interceptorId = client.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        if ((status === 401 || status === 403) && isAuthRef.current) {
          setAuthRef.current(false);
          navigateRef.current("/login");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      client.interceptors.response.eject(interceptorId);
    };
  }, []);

  return null;
}

export default AxiosInterceptor;
