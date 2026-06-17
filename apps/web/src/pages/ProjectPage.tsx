import { useParams } from "react-router-dom";

export default function ProjectPage() {
  const { id } = useParams();

  return (
    <div className="kazi-card p-8">
      <p className="text-sm font-medium text-kazi-primary">Project</p>

      <h1 className="mt-2 kazi-page-title">Project #{id}</h1>

      <p className="mt-2 kazi-muted">
        This page will show one project using the backend route.
      </p>
    </div>
  );
}