import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Card } from "../../types/board";

type BoardCardProps = {
  card: Card;
  columnId: number;
  onDelete: (cardId: number, columnId: number) => void;
  onUpdate: (
    cardId: number,
    columnId: number,
    title: string,
    description: string,
    priority: Card["priority"],
    dueDate: string
  ) => Promise<boolean>;
};

export default function BoardCard({
  card,
  columnId,
  onDelete,
  onUpdate,
}: BoardCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [priority, setPriority] = useState<Card["priority"]>(card.priority);
  const [dueDate, setDueDate] = useState(
    card.dueDate ? card.dueDate.slice(0, 10) : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `card-${card.id}`,
    data: {
      cardId: card.id,
      columnId,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const dragProps = isEditing
    ? {}
    : {
        ...listeners,
        ...attributes,
      };

  function stopPointerEvent(event: React.PointerEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function stopMouseEvent(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function handleStartEdit() {
    setTitle(card.title);
    setDescription(card.description ?? "");
    setPriority(card.priority);
    setDueDate(card.dueDate ? card.dueDate.slice(0, 10) : "");
    setIsEditing(true);
  }

  function handleCancel() {
    setTitle(card.title);
    setDescription(card.description ?? "");
    setPriority(card.priority);
    setDueDate(card.dueDate ? card.dueDate.slice(0, 10) : "");
    setIsEditing(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsSaving(true);

    try {
      const didUpdate = await onUpdate(
        card.id,
        columnId,
        title,
        description,
        priority,
        dueDate
      );

      if (didUpdate) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function getPriorityClasses(value: Card["priority"]) {
    if (value === "HIGH") {
      return "bg-red-100 text-red-700";
    }

    if (value === "LOW") {
      return "bg-emerald-100 text-emerald-700";
    }

    return "bg-amber-100 text-amber-700";
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragProps}
      className={`rounded-xl border border-kazi-border bg-white p-4 ${
        isEditing ? "" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {isEditing ? (
        <form
          className="space-y-3"
          onSubmit={handleSubmit}
          onPointerDown={stopPointerEvent}
        >
          <input
            type="text"
            value={title}
            onPointerDown={stopPointerEvent}
            onClick={stopMouseEvent}
            onChange={(event) => setTitle(event.target.value)}
            className="kazi-input"
            placeholder="Card title"
          />

          <textarea
            value={description}
            onPointerDown={stopPointerEvent}
            onClick={stopMouseEvent}
            onChange={(event) => setDescription(event.target.value)}
            className="kazi-input resize-none"
            placeholder="Card description"
            rows={3}
          />

          <div>
            <label className="kazi-label">Priority</label>
            <select
              value={priority}
              onPointerDown={stopPointerEvent}
              onClick={stopMouseEvent}
              onChange={(event) =>
                setPriority(event.target.value as Card["priority"])
              }
              className="kazi-input"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div>
            <label className="kazi-label">Due date</label>
            <input
              type="date"
              value={dueDate}
              onPointerDown={stopPointerEvent}
              onClick={stopMouseEvent}
              onChange={(event) => setDueDate(event.target.value)}
              className="kazi-input"
            />
            <p className="mt-1 text-xs text-kazi-muted">Optional</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              onPointerDown={stopPointerEvent}
              onClick={stopMouseEvent}
              className="text-xs font-medium text-kazi-primary hover:underline disabled:cursor-not-allowed disabled:no-underline"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onPointerDown={stopPointerEvent}
              onClick={(event) => {
                stopMouseEvent(event);
                handleCancel();
              }}
              className="text-xs font-medium text-kazi-muted hover:underline disabled:cursor-not-allowed disabled:no-underline"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-kazi-text">
              {card.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${getPriorityClasses(
                  card.priority
                )}`}
              >
                {card.priority}
              </span>

              {card.dueDate && (
                <span className="text-xs text-kazi-muted">
                  Due {new Date(card.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {card.description && (
              <p className="mt-1 text-sm text-kazi-muted">
                {card.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onPointerDown={stopPointerEvent}
              onClick={(event) => {
                stopMouseEvent(event);
                handleStartEdit();
              }}
              className="text-xs font-medium text-kazi-primary hover:underline"
            >
              Edit
            </button>

            <button
              type="button"
              onPointerDown={stopPointerEvent}
              onClick={(event) => {
                stopMouseEvent(event);
                onDelete(card.id, columnId);
              }}
              className="text-xs font-medium text-kazi-danger hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}