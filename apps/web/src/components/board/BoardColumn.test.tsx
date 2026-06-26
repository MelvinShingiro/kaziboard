import type { ReactNode } from "react";
import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Column } from "../../types/board";
import BoardColumn from "./BoardColumn";

const mockColumn: Column = {
  id: 1,
  name: "To Do",
  position: 1,
  projectId: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  cards: [],
};

function renderBoardColumn(children: ReactNode) {
  return render(
    <DndContext>
      <BoardColumn column={mockColumn}>{children}</BoardColumn>
    </DndContext>
  );
}

describe("BoardColumn", () => {
  it("renders its children", () => {
    renderBoardColumn(<p>Column content</p>);

    expect(screen.getByText("Column content")).toBeInTheDocument();
  });

  it("works inside DndContext", () => {
    renderBoardColumn(<h2>To Do</h2>);

    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
  });

  it("renders as a droppable area without crashing", () => {
    const { container } = renderBoardColumn(<p>Drop zone</p>);

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText("Drop zone")).toBeInTheDocument();
  });
});
