// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardFormDialog } from "./CardFormDialog";
import { createCardAction, updateCardAction } from "@/app/actions/cards";

vi.mock("@/app/actions/cards", () => ({
  createCardAction: vi.fn(),
  updateCardAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockCreate = vi.mocked(createCardAction);
const mockUpdate = vi.mocked(updateCardAction);

async function openDialog(
  user: ReturnType<typeof userEvent.setup>,
  label = /open/i,
) {
  await user.click(screen.getByRole("button", { name: label }));
}

describe("CardFormDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a card in add mode", async () => {
    mockCreate.mockResolvedValue(undefined as never);
    const user = userEvent.setup();
    render(
      <CardFormDialog deckId={7}>
        <button type="button">Open</button>
      </CardFormDialog>,
    );
    await openDialog(user);

    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByRole("textbox", { name: /^front$/i }),
      "Q?",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: /^back$/i }),
      "A!",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /^add card$/i }),
    );

    expect(mockCreate).toHaveBeenCalledWith(7, { front: "Q?", back: "A!" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("updates a card in edit mode", async () => {
    mockUpdate.mockResolvedValue(undefined as never);
    const user = userEvent.setup();
    render(
      <CardFormDialog
        deckId={3}
        card={{ id: 99, front: "Old Q", back: "Old A" }}
      >
        <button type="button">Open</button>
      </CardFormDialog>,
    );
    await openDialog(user);

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Edit Card" }),
    ).toBeInTheDocument();

    const front = within(dialog).getByRole("textbox", { name: /^front$/i });
    await user.clear(front);
    await user.type(front, "New Q");
    await user.click(
      within(dialog).getByRole("button", { name: /^save changes$/i }),
    );

    expect(mockUpdate).toHaveBeenCalledWith(3, 99, {
      front: "New Q",
      back: "Old A",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an error when create fails", async () => {
    mockCreate.mockRejectedValue(new Error("fail"));
    const user = userEvent.setup();
    render(
      <CardFormDialog deckId={1}>
        <button type="button">Open</button>
      </CardFormDialog>,
    );
    await openDialog(user);

    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByRole("textbox", { name: /^front$/i }),
      "x",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: /^back$/i }),
      "y",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /^add card$/i }),
    );

    expect(
      await within(dialog).findByText(
        "Something went wrong. Please try again.",
      ),
    ).toBeInTheDocument();
  });
});
