import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setAuthToken, getAuthToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [personas, setPersonas] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getAuthToken());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modal controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // "login" or "register"
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openAuthModal = (mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  useEffect(() => {
    async function initAuth() {
      try {
        setLoading(true);
        // Load personas from backend
        let loadedPersonas = [];
        try {
          loadedPersonas = await api.getPersonas();
        } catch (err) {
          console.warn("Failed to load personas, using default fallback:", err);
        }

        const fallback = [
          {
            id: "student-1",
            name: "Aryan Sachan",
            role: "student",
            title: "B.Tech CSE (3rd Year)",
            rollNo: "2304920100148",
            email: "aryansachan630@gmail.com",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
            department: "Computer Science & Engineering",
            collegeName: "KCC Institute of Technology and Management",
            bio: "Computer Science student at KCC Institute of Technology and Management passionate about full-stack engineering, AI, and competitive programming.",
            skills: ["React", "Node.js", "Python", "DSA", "Tailwind CSS"],
            github: "https://github.com/aryansachan630",
            linkedin: "https://linkedin.com/in/aryan-sachan"
          },
          {
            id: "faculty-1",
            name: "Dr. Ramesh Gupta",
            role: "faculty",
            title: "Professor & HOD (CSE)",
            facultyId: "FAC-CSE-102",
            email: "r.gupta@kccitm.edu.in",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
            department: "Computer Science & Engineering",
            collegeName: "KCC Institute of Technology and Management",
            bio: "HOD Computer Science & Engineering department. Overseeing academic curriculum, attendance protocols, and research labs.",
            skills: ["Algorithms", "Machine Learning", "System Design"],
            github: "",
            linkedin: ""
          },
          {
            id: "mentor-1",
            name: "Priya Nair",
            role: "mentor",
            title: "Final Year CSE | Google Intern",
            rollNo: "21CSE015",
            email: "priya.nair@kccitm.edu.in",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
            department: "Computer Science & Engineering",
            collegeName: "KCC Institute of Technology and Management",
            bio: "Senior mentor guiding 2nd and 3rd-year juniors with FAANG interview prep, open-source, and project roadmaps.",
            skills: ["DSA", "System Design", "Cloud Architecture"],
            github: "",
            linkedin: ""
          }
        ];

        const allPersonas = loadedPersonas && loadedPersonas.length > 0 ? loadedPersonas : fallback;
        setPersonas(allPersonas);

        // Check if token exists
        const savedToken = getAuthToken();
        if (savedToken) {
          try {
            const me = await api.getMe();
            if (me && me.id) {
              setCurrentUser(me);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("Existing token validation failed, falling back to default:", err);
            setAuthToken(null);
            setToken(null);
          }
        }

        // Default active student persona
        setCurrentUser(allPersonas[0]);
        setIsAuthenticated(false);
      } catch (err) {
        console.error("Auth context error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (emailOrRollNo, password) => {
    const res = await api.login({ emailOrRollNo, password });
    if (res.token && res.user) {
      setAuthToken(res.token);
      setToken(res.token);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      closeAuthModal();
      return res.user;
    }
    throw new Error("Invalid credentials");
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.token && res.user) {
      setAuthToken(res.token);
      setToken(res.token);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setPersonas((prev) => {
        if (!prev.find((p) => p.id === res.user.id)) {
          return [res.user, ...prev];
        }
        return prev;
      });
      closeAuthModal();
      return res.user;
    }
    throw new Error("Registration failed");
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setIsAuthenticated(false);
    if (personas.length > 0) {
      setCurrentUser(personas[0]);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (token) {
        const res = await api.updateProfile(profileData);
        if (res && res.user) {
          setCurrentUser(res.user);
          setPersonas((prev) =>
            prev.map((p) => (p.id === res.user.id ? { ...p, ...res.user } : p))
          );
          closeProfileModal();
          return res.user;
        }
      }
      
      // Fallback update in state
      const updated = { ...currentUser, ...profileData };
      setCurrentUser(updated);
      setPersonas((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      closeProfileModal();
      return updated;
    } catch (err) {
      console.error("Failed to update profile:", err);
      throw err;
    }
  };

  const switchPersona = (personaId) => {
    const found = personas.find((p) => p.id === personaId);
    if (found) {
      setCurrentUser(found);
      // If switching to demo persona, clear token if not corresponding
      if (token && currentUser?.id !== found.id) {
        setAuthToken(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentPersona: currentUser, // backwards compatibility
        personas,
        loading,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        switchPersona,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        closeProfileModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
