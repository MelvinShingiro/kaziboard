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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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

   async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const token = localStorage.getItem("token");

        if(!token) {
                setMessage("You are not loggined in");
                return;
        }

        setMessage("Creating project...");

     try {
  const response = await fetch("http://localhost:4000/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });

  const data = await response.json();

                if (!response.ok) {
                setMessage(data.message || "Failed to create project");
                return;
                }

                setProjects([data.project, ...projects]);
                setName("");
                setDescription("");
                setMessage("Project created successfully");
                } catch (error) {
                console.log("CREATE PROJECT ERROR:", error);
                setMessage("Something went wrong while creating the project");
                }
    }


  return (
    <div className="space-y-8">
      <section className="kazi-card p-8">
        <p className="text-sm font-medium text-kazi-primary">Dashboard</p>

        <h1 className="mt-2 kazi-page-title">Your workspace</h1>

        <p className="mt-2 max-w-2xl kazi-muted">
          Manage your freelance projects, organize client work, and prepare your
          workflow for invoices and Kanban boards.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="kazi-card">
          <h2 className="text-xl font-semibold text-kazi-text">
            Create project
          </h2>

          <p className="mt-1 kazi-muted">
            Add a new client or freelance project.
          </p>

          <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
            <div>
              <label className="kazi-label">Project name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Brand website"
                className="kazi-input"
              />
            </div>

            <div>
              <label className="kazi-label">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short description of the project"
                rows={4}
                className="kazi-input resize-none"
              />
            </div>

            <button type="submit" className="kazi-button-primary w-full">
              Create Project
            </button>
          </form>

          {message && <p className="mt-4 kazi-muted">{message}</p>}
        </div>

        <div className="kazi-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-kazi-text">
                Your projects
              </h2>

              <p className="mt-1 kazi-muted">
                Projects connected to your account.
              </p>
            </div>

            <span className="rounded-full bg-kazi-primary-soft px-3 py-1 text-sm font-medium text-kazi-primary">
              {projects.length} total
            </span>
          </div>

          <div className="mt-6">
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-kazi-border bg-kazi-surface-soft p-8 text-center">
                <h3 className="text-sm font-semibold text-kazi-text">
                  No projects yet
                </h3>

                <p className="mt-2 kazi-muted">
                  Create your first project to start building your workspace.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-kazi-border bg-white p-5 transition hover:border-kazi-primary hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-kazi-text">
                          {project.name}
                        </h3>

                        {project.description && (
                          <p className="mt-2 kazi-muted">
                            {project.description}
                          </p>
                        )}
                      </div>

                      <span className="rounded-full bg-kazi-surface-soft px-3 py-1 text-xs font-medium text-kazi-muted">
                        #{project.id}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-kazi-muted">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}