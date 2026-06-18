import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Project = {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
};

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        if (!id) {
          setMessage("Project id is missing");
          return;
        }

        const response = await fetch(`http://localhost:4000/api/projects/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load project");
          return;
        }

        setProject(data.project);
      } catch (error) {
        console.log("FETCH PROJECT ERROR:", error);
        setMessage("Something went wrong while loading this project");
      }
    }

    fetchProject();
  }, [id, navigate]);

  return (
    <div className="space-y-6">
      <div className="kazi-card p-8">
        <p className="text-sm font-medium text-kazi-primary">Project</p>

        {message && <p className="mt-2 kazi-muted">{message}</p>}

        {project ? (
          <>
            <h1 className="mt-2 kazi-page-title">{project.name}</h1>

            {project.description && (
              <p className="mt-2 kazi-muted">{project.description}</p>
            )}

            <p className="mt-4 text-xs text-kazi-muted">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </>
        ) : (
          !message && <p className="mt-2 kazi-muted">Loading project...</p>
        )}
      </div>
    </div>
  );
}