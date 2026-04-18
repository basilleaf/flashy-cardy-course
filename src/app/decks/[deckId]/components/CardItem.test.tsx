// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardItem } from "./CardItem";
import { deleteCardAction } from "@/app/actions/cards";

vi.mock("@/app/actions/cards", () => ({
  createCardAction: vi.fn(),
  updateCardAction: vi.fn(),
  deleteCardAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockDeleteCardAction = vi.mocked(deleteCardAction);

const sampleCard = { id: 10, front: "Question text", back: "Answer text" };

describe("CardItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the card front and back", () => {
    render(<CardItem deckId={1} card={sampleCard} />);

    expect(screen.getByText("Question text")).toBeInTheDocument();
    expect(screen.getByText("Answer text")).toBeInTheDocument();
  });

  it("opens the edit dialog", async () => {
    const user = userEvent.setup();
    render(<CardItem deckId={2} card={sampleCard} />);

    await user.click(screen.getByRole("button", { name: /edit card/i }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Edit Card" }),
    ).toBeInTheDocument();
  });

  it("deletes the card when confirmed", async () => {
    mockDeleteCardAction.mockResolvedValue(undefined as never);
    const user = userEvent.setup();
    render(<CardItem deckId={3} card={sampleCard} />);

    await user.click(screen.getByRole("button", { name: /delete card/i }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Delete Card?" }),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    expect(mockDeleteCardAction).toHaveBeenCalledWith(3, 10);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
