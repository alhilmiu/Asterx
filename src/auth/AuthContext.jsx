
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { pb, getCurrentUser } from "../lib/pocketbase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(getCurrentUser());
    });

    return unsubscribe;
  }, []);

  async function login(email, password) {
    const auth = await pb
      .collection("users")
      .authWithPassword(email, password);

    return auth.record;
  }

  function logout() {
    pb.authStore.clear();
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }

  return context;
}
