import { useDraggable } from "@dnd-kit/core";
import type { Card } from "../../types/board";

type BoardCardProps = {
  card: Card;
  columnId: number;
  onDelete: (cardId: number, columnId: number) => void;
};

export default function BoardCard({
  card,
  columnId,
  onDelete,
}: BoardCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-xl border border-kazi-border bg-white p-4 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-kazi-text">{card.title}</h3>

          {card.description && (
            <p className="mt-1 text-sm text-kazi-muted">{card.description}</p>
          )}
        </div>

        <button
          type="button"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(card.id, columnId);
          }}
          className="text-xs font-medium text-kazi-danger hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}