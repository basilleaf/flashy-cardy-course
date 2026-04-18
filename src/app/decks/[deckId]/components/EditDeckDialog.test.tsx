// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditDeckDialog } from "./EditDeckDialog";
import { updateDeckAction } from "@/app/actions/decks";

vi.mock("@/app/actions/decks", () => ({
  updateDeckAction: vi.fn(),
}));

const mockUpdateDeckAction = vi.mocked(updateDeckAction);

describe("EditDeckDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits updated title and description", async () => {
    mockUpdateDeckAction.mockResolvedValue(undefined as never);
    const user = userEvent.setup();
    render(
      <EditDeckDialog deckId={4} title="Old" description="Old desc">
        <button type="button">Edit</button>
      </EditDeckDialog>,
    );

    await user.click(screen.getByRole("button", { name: /^edit$/i }));
    const dialog = screen.getByRole("dialog");

    const titleInput = within(dialog).getByRole("textbox", {
      name: /^title$/i,
    });
    await user.clear(titleInput);
    await user.type(titleInput, "New title");

    await user.click(
      within(dialog).getByRole("button", { name: /^save changes$/i }),
    );

    expect(mockUpdateDeckAction).toHaveBeenCalledWith(4, {
      title: "New title",
      description: "Old desc",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an error when update fails", async () => {
    mockUpdateDeckAction.mockRejectedValue(new Error("err"));
    const user = userEvent.setup();
    render(
      <EditDeckDialog deckId={1} title="T" description={null}>
        <button type="button">Open</button>
      </EditDeckDialog>,
    );

    await user.click(screen.getByRole("button", { name: /^open$/i }));
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /^save changes$/i }),
    );

    expect(
      await within(dialog).findByText(
        "Something went wrong. Please try again.",
      ),
    ).toBeInTheDocument();
  });
});
