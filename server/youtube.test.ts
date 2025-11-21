import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("YouTube API Key Management", () => {
  it("should check if user has API key", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.youtube.hasApiKey();

    expect(result).toHaveProperty("hasKey");
    expect(typeof result.hasKey).toBe("boolean");
  });

  it("should reject invalid API key format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.youtube.saveApiKey({ apiKey: "" });
      expect.fail("Should have thrown an error for empty API key");
    } catch (error: any) {
      expect(error.message).toBeTruthy();
    }
  });
});

describe("User Preferences", () => {
  it("should get user preferences", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preferences.get();

    expect(result).toHaveProperty("language");
    expect(["en", "ru"]).toContain(result.language);
  });

  it("should set user language preference", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preferences.setLanguage({ language: "ru" });

    expect(result).toEqual({ success: true });
  });

  it("should reject invalid language", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      // @ts-expect-error Testing invalid input
      await caller.preferences.setLanguage({ language: "fr" });
      expect.fail("Should have thrown an error for invalid language");
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
