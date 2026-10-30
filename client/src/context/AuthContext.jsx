import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [personas, setPersonas] = useState([]);
  const [currentPersona, setCurrentPersona] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPersonas() {
      try {
        const data = await api.getPersonas();
        setPersonas(data);
        if (data.length > 0) {
          // Default to student persona
          setCurrentPersona(data[0]);
        }
      } catch (err) {
        console.warn("Failed to load personas from backend, using fallback:", err);
        // Fallback default
        const fallback = [
          {
            id: "student-1",
            name: "Aryan Sachan",
            role: "student",
            title: "B.Tech CSE (3rd Year)",
            rollNo: "2304920100148",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
            department: "Computer Science & Engineering",
            collegeName: "KCC Institute of Technology and Management"
          },
          {
            id: "faculty-1",
            name: "Dr. Ramesh Gupta",
            role: "faculty",
            title: "Professor & HOD (CSE)",
            facultyId: "FAC-CSE-102",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
            department: "Computer Science & Engineering"
          },
          {
            id: "mentor-1",
            name: "Priya Nair",
            role: "mentor",
            title: "Final Year CSE | Google Intern",
            rollNo: "21CSE015",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
            department: "Computer Science & Engineering"
          }
        ];
        setPersonas(fallback);
        setCurrentPersona(fallback[0]);
      } finally {
        setLoading(false);
      }
    }

    loadPersonas();
  }, []);

  const switchPersona = (personaId) => {
    const found = personas.find(p => p.id === personaId);
    if (found) {
      setCurrentPersona(found);
    }
  };

  return (
    <AuthContext.Provider value={{ personas, currentPersona, switchPersona, loading }}>
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
