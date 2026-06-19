import { useDroppable } from "@dnd-kit/core";

type Column = {
  id: number;
  name: string;
  position: number;
  projectId: number;
  createdAt: string;
  cards: unknown[];
};

type BoardColumnProps = {
  column: Column;
  children: React.ReactNode;
};

export default function BoardColumn({ column, children }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      columnId: column.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-4 transition ${
        isOver
          ? "border-kazi-primary bg-kazi-primary-soft"
          : "border-kazi-border bg-kazi-surface-soft"
      }`}
    >
      {children}
    </div>
  );
}