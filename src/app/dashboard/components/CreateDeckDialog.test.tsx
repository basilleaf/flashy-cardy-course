// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateDeckDialog } from "./CreateDeckDialog";
import { createDeckAction } from "@/app/actions/decks";

vi.mock("@/app/actions/decks", () => ({
  createDeckAction: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockCreateDeckAction = vi.mocked(createDeckAction);

function renderDialog() {
  const user = userEvent.setup();
  render(
    <CreateDeckDialog>
      <button type="button">Add deck</button>
    </CreateDeckDialog>,
  );
  return { user };
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /add deck/i }));
}

describe("CreateDeckDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the dialog when the trigger is activated", async () => {
    const { user } = renderDialog();
    await openDialog(user);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeVisible();
    expect(
      within(dialog).getByRole("heading", { name: "New Deck" }),
    ).toBeInTheDocument();
  });

  it("submits the form and navigates to the new deck on success", async () => {
    mockCreateDeckAction.mockResolvedValue({ id: "deck_abc" } as never);
    const { user } = renderDialog();
    await openDialog(user);

    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByRole("textbox", { name: /^title$/i }),
      "My deck",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: /^description$/i }),
      "Notes here",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /^create deck$/i }),
    );

    expect(mockCreateDeckAction).toHaveBeenCalledWith({
      title: "My deck",
      description: "Notes here",
    });
    await screen.findByRole("button", { name: /add deck/i });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith("/decks/deck_abc");
  });

  it("shows an error message when creation fails", async () => {
    mockCreateDeckAction.mockRejectedValue(new Error("boom"));
    const { user } = renderDialog();
    await openDialog(user);

    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByRole("textbox", { name: /^title$/i }),
      "Bad deck",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /^create deck$/i }),
    );

    expect(
      await within(dialog).findByText(
        "Something went wrong. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears fields when the dialog is closed", async () => {
    const { user } = renderDialog();
    await openDialog(user);

    const dialog = screen.getByRole("dialog");
    const titleField = within(dialog).getByRole("textbox", {
      name: /^title$/i,
    });
    await user.type(titleField, "Draft");
    const footer = dialog.querySelector('[data-slot="dialog-footer"]');
    expect(footer).not.toBeNull();
    await user.click(
      within(footer as HTMLElement).getByRole("button", { name: /^close$/i }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await openDialog(user);
    const dialogAgain = screen.getByRole("dialog");
    expect(
      within(dialogAgain).getByRole("textbox", { name: /^title$/i }),
    ).toHaveValue("");
  });
});
