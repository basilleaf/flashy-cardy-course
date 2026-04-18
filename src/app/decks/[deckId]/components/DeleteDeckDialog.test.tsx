// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteDeckDialog } from "./DeleteDeckDialog";
import { deleteDeckAction } from "@/app/actions/decks";

vi.mock("@/app/actions/decks", () => ({
  deleteDeckAction: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockDeleteDeckAction = vi.mocked(deleteDeckAction);

describe("DeleteDeckDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens and shows deck title and card count", async () => {
    const user = userEvent.setup();
    render(
      <DeleteDeckDialog deckId={5} title="My Deck" cardCount={3}>
        <button type="button">Remove</button>
      </DeleteDeckDialog>,
    );

    await user.click(screen.getByRole("button", { name: /remove/i }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: /delete deck/i }),
    ).toBeInTheDocument();
    expect(dialog.textContent).toContain("My Deck");
    expect(dialog.textContent).toMatch(/all 3 cards/);
  });

  it("deletes and navigates to the dashboard on success", async () => {
    mockDeleteDeckAction.mockResolvedValue(undefined as never);
    const user = userEvent.setup();
    render(
      <DeleteDeckDialog deckId={9} title="Gone" cardCount={0}>
        <button type="button">Delete</button>
      </DeleteDeckDialog>,
    );

    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /delete deck$/i }),
    );

    expect(mockDeleteDeckAction).toHaveBeenCalledWith(9);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an error when deletion fails", async () => {
    mockDeleteDeckAction.mockRejectedValue(new Error("nope"));
    const user = userEvent.setup();
    render(
      <DeleteDeckDialog deckId={2} title="X" cardCount={1}>
        <button type="button">Go</button>
      </DeleteDeckDialog>,
    );

    await user.click(screen.getByRole("button", { name: /^go$/i }));
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /delete deck$/i }),
    );

    expect(
      await within(dialog).findByText(
        "Something went wrong. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
