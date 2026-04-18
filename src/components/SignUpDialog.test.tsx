// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpDialog } from "./SignUpDialog";

vi.mock("@clerk/nextjs", () => ({
  SignUp: () => <div data-testid="clerk-sign-up">Clerk SignUp</div>,
}));

describe("SignUpDialog", () => {
  it("opens a dialog that embeds Clerk SignUp", async () => {
    const user = userEvent.setup();
    render(<SignUpDialog />);

    await user.click(screen.getByRole("button", { name: /^sign up$/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByTestId("clerk-sign-up")).toBeInTheDocument();
  });
});
