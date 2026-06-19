import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  type DragEndEvent,
} from "@dnd-kit/core";
import BoardCard from "../components/board/BoardCard";
import BoardColumn from "../components/board/BoardColumn";

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

  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);

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

        const response = await fetch(
          `http://localhost:4000/api/projects/${id}/board`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  async function handleCreateCard(
    event: React.FormEvent<HTMLFormElement>,
    columnId: number
  ) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/columns/${columnId}/cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: cardTitle,
            description: cardDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create card");
        return;
      }

      setProject((currentProject) => {
        if (!currentProject) return currentProject;

        return {
          ...currentProject,
          columns: currentProject.columns.map((column) => {
            if (column.id !== columnId) return column;

            return {
              ...column,
              cards: [...column.cards, data.card],
            };
          }),
        };
      });

      setCardTitle("");
      setCardDescription("");
      setSelectedColumnId(null);
      setMessage("");
    } catch (error) {
      console.log("CREATE CARD ERROR:", error);
      setMessage("Something went wrong while creating the card");
    }
  }

  async function handleDeleteCard(cardId: number, columnId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/columns/cards/${cardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete card");
        return;
      }

      setProject((currentProject) => {
        if (!currentProject) return currentProject;

        return {
          ...currentProject,
          columns: currentProject.columns.map((column) => {
            if (column.id !== columnId) return column;

            return {
              ...column,
              cards: column.cards.filter((card) => card.id !== cardId),
            };
          }),
        };
      });

      setMessage("");
    } catch (error) {
      console.log("DELETE CARD ERROR:", error);
      setMessage("Something went wrong while deleting the card");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const cardId = active.data.current?.cardId;
    const sourceColumnId = active.data.current?.columnId;
    const targetColumnId = over.data.current?.columnId;

    if (!cardId || !sourceColumnId || !targetColumnId) return;

    if (sourceColumnId === targetColumnId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/columns/cards/${cardId}/move`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetColumnId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to move card");
        return;
      }

      setProject((currentProject) => {
        if (!currentProject) return currentProject;

        const movedCard = data.card as Card;

        return {
          ...currentProject,
          columns: currentProject.columns.map((column) => {
            if (column.id === sourceColumnId) {
              return {
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              };
            }

            if (column.id === targetColumnId) {
              return {
                ...column,
                cards: [...column.cards, movedCard],
              };
            }

            return column;
          }),
        };
      });

      setMessage("");
    } catch (error) {
      console.log("MOVE CARD ERROR:", error);
      setMessage("Something went wrong while moving the card");
    }
  }

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

            <DndContext onDragEnd={handleDragEnd}>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {project.columns.map((column) => (
                  <BoardColumn key={column.id} column={column}>
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-kazi-text">
                        {column.name}
                      </h2>

                      <span className="rounded-full bg-white px-2 py-1 text-xs text-kazi-muted">
                        {column.cards.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedColumnId(column.id)}
                      className="mt-4 w-full rounded-xl border border-kazi-border bg-white px-4 py-2 text-sm font-medium text-kazi-text transition hover:border-kazi-primary"
                    >
                      Add card
                    </button>

                    {selectedColumnId === column.id && (
                      <form
                        onSubmit={(event) =>
                          handleCreateCard(event, column.id)
                        }
                        className="mt-4 space-y-3"
                      >
                        <input
                          type="text"
                          value={cardTitle}
                          onChange={(event) =>
                            setCardTitle(event.target.value)
                          }
                          placeholder="Card title"
                          className="kazi-input"
                        />

                        <textarea
                          value={cardDescription}
                          onChange={(event) =>
                            setCardDescription(event.target.value)
                          }
                          placeholder="Card description"
                          rows={3}
                          className="kazi-input resize-none"
                        />

                        <button
                          type="submit"
                          className="kazi-button-primary w-full"
                        >
                          Save card
                        </button>
                      </form>
                    )}

                    <div className="mt-4 space-y-3">
                      {column.cards.length === 0 ? (
                        <p className="text-sm text-kazi-muted">No cards yet</p>
                      ) : (
                        column.cards.map((card) => (
                          <BoardCard
                            key={card.id}
                            card={card}
                            columnId={column.id}
                            onDelete={handleDeleteCard}
                          />
                        ))
                      )}
                    </div>
                  </BoardColumn>
                ))}
              </div>
            </DndContext>
          </>
        ) : (
          !message && <p className="mt-2 kazi-muted">Loading project...</p>
        )}
      </div>
    </div>
  );
}