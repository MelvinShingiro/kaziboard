import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Card } from "../../types/board";
import BoardCard from "./BoardCard";

function buildCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 1,
    title: "Test Card",
    description: "Test description",
    priority: "HIGH",
    dueDate: "2026-12-31T00:00:00.000Z",
    position: 1,
    columnId: 10,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderBoardCard(card: Card = buildCard()) {
  const onDelete = vi.fn();
  const onUpdate = vi.fn().mockResolvedValue(true);

  render(
    <DndContext>
      <BoardCard
        card={card}
        columnId={10}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    </DndContext>
  );

  return { onDelete, onUpdate };
}

describe("BoardCard", () => {
  it("renders the card title", () => {
    renderBoardCard();

    expect(screen.getByRole("heading", { name: "Test Card" })).toBeInTheDocument();
  });

  it("renders the card description", () => {
    renderBoardCard();

    expect(
      screen.getByText("Test description", { selector: "p" })
    ).toBeInTheDocument();
  });

  it("renders the priority badge", () => {
    renderBoardCard();

    expect(
      screen.getByText("HIGH", { selector: "span" })
    ).toBeInTheDocument();
  });

  it("renders the due date when dueDate exists", () => {
    renderBoardCard();

    expect(screen.getByText(/^Due /)).toBeInTheDocument();
  });

  it("does not render due date when dueDate is null", () => {
    renderBoardCard(buildCard({ dueDate: null }));

    expect(screen.queryByText(/^Due /)).not.toBeInTheDocument();
  });

  it("opens the edit form when Edit is clicked", async () => {
    const user = userEvent.setup();
    renderBoardCard();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByPlaceholderText("Card title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Card description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("closes the edit form when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderBoardCard();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByPlaceholderText("Card title")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Test Card" })).toBeInTheDocument();
  });

  it("calls onUpdate when title is changed and Save is clicked", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderBoardCard();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByPlaceholderText("Card title");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onUpdate).toHaveBeenCalledWith(
      1,
      10,
      "Updated Title",
      "Test description",
      "HIGH",
      "2026-12-31"
    );
  });

  it("calls onDelete when Delete is clicked", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderBoardCard();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith(1, 10);
  });
});
