import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { revalidatePath } from "next/cache";
import { createCard } from "@/lib/db/queries/cards";
import { getDeckById } from "@/lib/db/queries/decks";
import { generateDeckCardsWithAiAction } from "./generateDeckCardsWithAi";

vi.mock("@clerk/nextjs/server");
vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    generateText: vi.fn(),
  };
});
vi.mock("next/cache");
vi.mock("@/lib/db/queries/cards");
vi.mock("@/lib/db/queries/decks");

const mockAuth = vi.mocked(auth);
const mockGenerateText = vi.mocked(generateText);
const mockRevalidate = vi.mocked(revalidatePath);
const mockCreateCard = vi.mocked(createCard);
const mockGetDeckById = vi.mocked(getDeckById);

function makeCards(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    front: `Q${i + 1}`,
    back: `A${i + 1}`,
  }));
}

describe("generateDeckCardsWithAiAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the user is not authenticated", async () => {
    mockAuth.mockResolvedValue({
      userId: null,
      has: vi.fn().mockReturnValue(false),
    } as never);

    await expect(generateDeckCardsWithAiAction(1)).rejects.toThrow(
      "Unauthorized",
    );
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it("throws when the user lacks AI access", async () => {
    mockAuth.mockResolvedValue({
      userId: "user_1",
      has: vi.fn().mockReturnValue(false),
    } as never);

    await expect(generateDeckCardsWithAiAction(1)).rejects.toThrow(
      "AI flashcard generation is not available on your plan",
    );
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it("throws when the deck has no title or description", async () => {
    mockAuth.mockResolvedValue({
      userId: "user_1",
      has: vi.fn().mockImplementation(({ plan }) => plan === "pro"),
    } as never);
    mockGetDeckById.mockResolvedValue({
      id: 1,
      clerkUserId: "user_1",
      title: "   ",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(generateDeckCardsWithAiAction(1)).rejects.toThrow(
      "Add a title and description to your deck before generating cards with AI.",
    );
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it("throws when the deck is not found", async () => {
    mockAuth.mockResolvedValue({
      userId: "user_1",
      has: vi.fn().mockImplementation(({ feature, plan }) => {
        if (feature === "ai_flashcard_generation") return true;
        if (plan === "pro") return false;
        return false;
      }),
    } as never);
    mockGetDeckById.mockResolvedValue(null);

    await expect(generateDeckCardsWithAiAction(99)).rejects.toThrow(
      "Deck not found",
    );
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it("generates cards, persists them, and revalidates routes", async () => {
    mockAuth.mockResolvedValue({
      userId: "user_1",
      has: vi.fn().mockImplementation(({ plan }) => plan === "pro"),
    } as never);
    mockGetDeckById.mockResolvedValue({
      id: 3,
      clerkUserId: "user_1",
      title: "Spanish verbs",
      description: "Common conjugations",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const cards = makeCards(20);
    mockGenerateText.mockResolvedValue({
      output: { cards },
    } as never);
    mockCreateCard.mockResolvedValue({
      id: 1,
      deckId: 3,
      front: "x",
      back: "y",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await generateDeckCardsWithAiAction(3);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    expect(mockCreateCard).toHaveBeenCalledTimes(20);
    expect(result).toEqual({ created: 20 });
    expect(mockRevalidate).toHaveBeenCalledWith("/decks/3");
    expect(mockRevalidate).toHaveBeenCalledWith("/study/3");
  });
});
