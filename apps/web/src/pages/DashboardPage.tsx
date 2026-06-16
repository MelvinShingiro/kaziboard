import { useEffect, useState } from "react";

type Project = {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setMessage("You are not logged in");
          return;
        }

        const response = await fetch("http://localhost:4000/api/projects", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load projects");
          return;
        }

        setProjects(data.projects);
      } catch (error) {
        console.log("FETCH PROJECTS ERROR:", error);
        setMessage("Something went wrong while loading projects");
      }
    }

    fetchProjects();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      {message && <p>{message}</p>}

      <h2>Your Projects</h2>

      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong>
              {project.description && <p>{project.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}