// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInDialog } from "./SignInDialog";

vi.mock("@clerk/nextjs", () => ({
  SignIn: () => <div data-testid="clerk-sign-in">Clerk SignIn</div>,
}));

describe("SignInDialog", () => {
  it("opens a dialog that embeds Clerk SignIn", async () => {
    const user = userEvent.setup();
    render(<SignInDialog />);

    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByTestId("clerk-sign-in")).toBeInTheDocument();
  });
});
