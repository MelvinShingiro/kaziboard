import { useEffect, useState } from "react";
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
    description: string
  ) => Promise<void>;
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description ?? "");
  }, [card.description, card.title]);

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

  function stopPointerEvent(event: React.PointerEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function stopMouseEvent(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsSaving(true);

    try {
      await onUpdate(card.id, columnId, title, description);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setTitle(card.title);
    setDescription(card.description ?? "");
    setIsEditing(false);
  }

  const dragProps = isEditing
    ? {}
    : {
        ...listeners,
        ...attributes,
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragProps}
      className="cursor-grab rounded-xl border border-kazi-border bg-white p-4 active:cursor-grabbing"
    >
      {isEditing ? (
        <form className="space-y-3" onSubmit={handleSubmit} onPointerDown={stopPointerEvent}>
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
            <h3 className="text-sm font-semibold text-kazi-text">{card.title}</h3>

            {card.description && (
              <p className="mt-1 text-sm text-kazi-muted">{card.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onPointerDown={stopPointerEvent}
              onClick={(event) => {
                stopMouseEvent(event);
                setIsEditing(true);
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