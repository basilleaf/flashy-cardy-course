import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createCard, deleteCard, updateCard } from "@/lib/db/queries/cards";
import {
  createCardAction,
  deleteCardAction,
  updateCardAction,
} from "./cards";

vi.mock("@clerk/nextjs/server");
vi.mock("next/cache");
vi.mock("@/lib/db/queries/cards");

const mockAuth = vi.mocked(auth);
const mockRevalidate = vi.mocked(revalidatePath);
const mockCreateCard = vi.mocked(createCard);
const mockUpdateCard = vi.mocked(updateCard);
const mockDeleteCard = vi.mocked(deleteCard);

describe("createCardAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    await expect(
      createCardAction(1, { front: "Q", back: "A" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockCreateCard).not.toHaveBeenCalled();
  });

  it("rejects invalid input with ZodError", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);

    await expect(
      createCardAction(1, { front: "", back: "A" }),
    ).rejects.toThrow(ZodError);
    expect(mockCreateCard).not.toHaveBeenCalled();
  });

  it("throws when the deck is not found", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    mockCreateCard.mockResolvedValue(null);

    await expect(
      createCardAction(1, { front: "Q", back: "A" }),
    ).rejects.toThrow("Deck not found");
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("creates a card, revalidates deck and study routes, and returns the card", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    const created = {
      id: 10,
      deckId: 2,
      front: "Q",
      back: "A",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockCreateCard.mockResolvedValue(created);

    const result = await createCardAction(2, { front: "Q", back: "A" });

    expect(mockCreateCard).toHaveBeenCalledWith(2, "user_1", "Q", "A");
    expect(mockRevalidate).toHaveBeenCalledTimes(2);
    expect(mockRevalidate).toHaveBeenCalledWith("/decks/2");
    expect(mockRevalidate).toHaveBeenCalledWith("/study/2");
    expect(result).toEqual(created);
  });
});

describe("updateCardAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    await expect(updateCardAction(1, 5, { front: "New" })).rejects.toThrow(
      "Unauthorized",
    );
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  it("rejects invalid card id", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);

    await expect(updateCardAction(1, 0, { front: "New" })).rejects.toThrow(
      ZodError,
    );
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  it("throws when the card is not found", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    mockUpdateCard.mockResolvedValue(null);

    await expect(
      updateCardAction(1, 5, { front: "New" }),
    ).rejects.toThrow("Card not found");
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("updates a card, revalidates routes, and returns the card", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    const updated = {
      id: 5,
      deckId: 1,
      front: "New",
      back: "B",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUpdateCard.mockResolvedValue(updated);

    const result = await updateCardAction(3, 5, { front: "New" });

    expect(mockUpdateCard).toHaveBeenCalledWith(5, "user_1", { front: "New" });
    expect(mockRevalidate).toHaveBeenCalledWith("/decks/3");
    expect(mockRevalidate).toHaveBeenCalledWith("/study/3");
    expect(result).toEqual(updated);
  });
});

describe("deleteCardAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    await expect(deleteCardAction(1, 5)).rejects.toThrow("Unauthorized");
    expect(mockDeleteCard).not.toHaveBeenCalled();
  });

  it("rejects invalid card id", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);

    await expect(deleteCardAction(1, -1)).rejects.toThrow(ZodError);
    expect(mockDeleteCard).not.toHaveBeenCalled();
  });

  it("deletes a card and revalidates deck and study routes", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    mockDeleteCard.mockResolvedValue(undefined);

    await deleteCardAction(4, 7);

    expect(mockDeleteCard).toHaveBeenCalledWith(7, "user_1");
    expect(mockRevalidate).toHaveBeenCalledWith("/decks/4");
    expect(mockRevalidate).toHaveBeenCalledWith("/study/4");
  });
});
