// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudySession } from "./StudySession";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  } & React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const cards = [
  { id: 1, front: "Q1", back: "A1" },
  { id: 2, front: "Q2", back: "A2" },
];

describe("StudySession", () => {
  it("shows the first card and progress", () => {
    render(
      <StudySession deckId={99} deckTitle="Biology" cards={cards} />,
    );

    expect(screen.getByText("Card 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Q1")).toBeInTheDocument();
  });

  it("flips the card when the main area is clicked", async () => {
    const user = userEvent.setup();
    render(
      <StudySession deckId={1} deckTitle="D" cards={cards} />,
    );

    await user.click(screen.getByText("Q1"));

    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Correct" })).toBeInTheDocument();
  });

  it("advances after grading when not on the last card", async () => {
    const user = userEvent.setup();
    render(
      <StudySession deckId={1} deckTitle="D" cards={cards} />,
    );

    await user.click(screen.getByText("Q1"));
    await user.click(screen.getByRole("button", { name: "Correct" }));

    expect(screen.getByText("Card 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Q2")).toBeInTheDocument();
  });

  it("shows the completion dialog after grading the last card", async () => {
    const user = userEvent.setup();
    render(
      <StudySession deckId={7} deckTitle="Final" cards={[cards[0]!]} />,
    );

    await user.click(screen.getByText("Q1"));
    await user.click(screen.getByRole("button", { name: "Correct" }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", {
        name: "Study Session Complete!",
      }),
    ).toBeInTheDocument();
    expect(dialog.textContent).toContain("Final");

    const backLink = within(dialog).getByRole("link", {
      name: /back to deck/i,
    });
    expect(backLink).toHaveAttribute("href", "/decks/7");
  });

  it("resets the session when Study Again is clicked", async () => {
    const user = userEvent.setup();
    render(
      <StudySession deckId={1} deckTitle="D" cards={cards} />,
    );

    await user.click(screen.getByText("Q1"));
    await user.click(screen.getByRole("button", { name: "Correct" }));
    await user.click(screen.getByText("Q2"));
    await user.click(screen.getByRole("button", { name: "Correct" }));

    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /study again/i }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Card 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Q1")).toBeInTheDocument();
  });
});
