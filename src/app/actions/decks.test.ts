import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createDeck, deleteDeck, updateDeck } from "@/lib/db/queries/decks";
import {
  createDeckAction,
  deleteDeckAction,
  updateDeckAction,
} from "./decks";

vi.mock("@clerk/nextjs/server");
vi.mock("next/cache");
vi.mock("@/lib/db/queries/decks");

const mockAuth = vi.mocked(auth);
const mockRevalidate = vi.mocked(revalidatePath);
const mockCreateDeck = vi.mocked(createDeck);
const mockUpdateDeck = vi.mocked(updateDeck);
const mockDeleteDeck = vi.mocked(deleteDeck);

describe("createDeckAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    await expect(
      createDeckAction({ title: "T", description: "" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockCreateDeck).not.toHaveBeenCalled();
  });

  it("rejects invalid input with ZodError", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);

    await expect(
      createDeckAction({ title: "", description: "" }),
    ).rejects.toThrow(ZodError);
    expect(mockCreateDeck).not.toHaveBeenCalled();
  });

  it("passes null description when description is only whitespace", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    const deck = {
      id: 1,
      clerkUserId: "user_1",
      title: "My deck",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockCreateDeck.mockResolvedValue(deck);

    await createDeckAction({ title: "My deck", description: "   " });

    expect(mockCreateDeck).toHaveBeenCalledWith("user_1", "My deck", null);
  });

  it("creates a deck, revalidates the dashboard, and returns the deck", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    const deck = {
      id: 2,
      clerkUserId: "user_1",
      title: "Title",
      description: "Desc",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockCreateDeck.mockResolvedValue(deck);

    const result = await createDeckAction({
      title: "  Title  ",
      description: "  Desc  ",
    });

    expect(mockCreateDeck).toHaveBeenCalledWith("user_1", "Title", "Desc");
    expect(mockRevalidate).toHaveBeenCalledTimes(1);
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");
    expect(result).toEqual(deck);
  });
});

describe("updateDeckAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    await expect(
      updateDeckAction(1, { title: "T", description: "" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockUpdateDeck).not.toHaveBeenCalled();
  });

  it("throws when the deck is not found", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    mockUpdateDeck.mockResolvedValue(null);

    await expect(
      updateDeckAction(9, { title: "T", description: "" }),
    ).rejects.toThrow("Deck not found");
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("updates a deck and revalidates dashboard, deck, and study routes", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    const deck = {
      id: 9,
      clerkUserId: "user_1",
      title: "New",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUpdateDeck.mockResolvedValue(deck);

    const result = await updateDeckAction(9, { title: "New", description: "" });

    expect(mockUpdateDeck).toHaveBeenCalledWith(9, "user_1", {
      title: "New",
      description: null,
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidate).toHaveBeenCalledWith("/decks/9");
    expect(mockRevalidate).toHaveBeenCalledWith("/study/9");
    expect(result).toEqual(deck);
  });
});

describe("deleteDeckAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    await expect(deleteDeckAction(1)).rejects.toThrow("Unauthorized");
    expect(mockDeleteDeck).not.toHaveBeenCalled();
  });

  it("throws when the deck is not found", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    mockDeleteDeck.mockResolvedValue(false);

    await expect(deleteDeckAction(3)).rejects.toThrow("Deck not found");
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("deletes a deck and revalidates dashboard, deck, and study routes", async () => {
    mockAuth.mockResolvedValue({ userId: "user_1" } as never);
    mockDeleteDeck.mockResolvedValue(true);

    await deleteDeckAction(3);

    expect(mockDeleteDeck).toHaveBeenCalledWith(3, "user_1");
    expect(mockRevalidate).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidate).toHaveBeenCalledWith("/decks/3");
    expect(mockRevalidate).toHaveBeenCalledWith("/study/3");
  });
});
