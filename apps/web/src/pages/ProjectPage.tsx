import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

    type Card = {
      id: number;
      title: string;
      description: string | null;
      position: number;
      columnId: number;
      createdAt: string;
    };

    type Column = {
      id: number;
      name: string;
      position: number;
      projectId: number;
      createdAt: string;
      cards: Card[];
    };

    type Project = {
      id: number;
      name: string;
      description: string | null;
      ownerId: number;
      createdAt: string;
      columns: Column[];
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

        const response = await fetch(`http://localhost:4000/api/projects/${id}/board`, {
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

  <div className="mt-8 grid gap-4 md:grid-cols-3">
    {project.columns.map((column) => (
      <div
        key={column.id}
        className="rounded-2xl border border-kazi-border bg-kazi-surface-soft p-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-kazi-text">{column.name}</h2>

          <span className="rounded-full bg-white px-2 py-1 text-xs text-kazi-muted">
            {column.cards.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {column.cards.length === 0 ? (
            <p className="text-sm text-kazi-muted">No cards yet</p>
          ) : (
            column.cards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-kazi-border bg-white p-4"
              >
                <h3 className="text-sm font-semibold text-kazi-text">
                  {card.title}
                </h3>

                {card.description && (
                  <p className="mt-1 text-sm text-kazi-muted">
                    {card.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    ))}
  </div>
</>
        ) : (
          !message && <p className="mt-2 kazi-muted">Loading project...</p>
        )}
      </div>
    </div>
  );
}