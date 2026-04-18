// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddCardButton } from "./AddCardButton";
import { createCardAction } from "@/app/actions/cards";

vi.mock("@/app/actions/cards", () => ({
  createCardAction: vi.fn(),
}));

const mockCreateCardAction = vi.mocked(createCardAction);

describe("AddCardButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the add-card dialog from the default trigger", async () => {
    mockCreateCardAction.mockResolvedValue(undefined as never);
    const user = userEvent.setup();
    render(<AddCardButton deckId={42} />);

    await user.click(screen.getByRole("button", { name: /add card/i }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Add Card" }),
    ).toBeInTheDocument();
  });
});
