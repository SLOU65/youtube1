import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, youtubeApiKeys, InsertYoutubeApiKey, userPreferences, InsertUserPreference } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// YouTube API Key functions (without encryption)

export async function saveYoutubeApiKey(userId: number, apiKey: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Deactivate all existing keys for this user
    await db.update(youtubeApiKeys)
      .set({ isActive: false })
      .where(eq(youtubeApiKeys.userId, userId));

    // Insert the new API key without encryption
    const result = await db.insert(youtubeApiKeys).values({
      userId,
      encryptedApiKey: apiKey, // Store plaintext in encryptedApiKey field
      iv: '', // Empty IV since we're not encrypting
      isActive: true,
      lastValidated: new Date(),
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to save API key:", error);
    throw error;
  }
}

export async function getActiveYoutubeApiKey(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.select()
      .from(youtubeApiKeys)
      .where(and(
        eq(youtubeApiKeys.userId, userId),
        eq(youtubeApiKeys.isActive, true)
      ))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const keyData = result[0];
    if (!keyData) {
      return null;
    }

    // Return the API key directly (no decryption needed)
    return keyData.encryptedApiKey;
  } catch (error) {
    console.error("[Database] Failed to get API key:", error);
    throw error;
  }
}

export async function deleteYoutubeApiKey(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(youtubeApiKeys)
      .set({ isActive: false })
      .where(eq(youtubeApiKeys.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to delete API key:", error);
    throw error;
  }
}

export async function hasActiveYoutubeApiKey(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.select({ id: youtubeApiKeys.id })
      .from(youtubeApiKeys)
      .where(and(
        eq(youtubeApiKeys.userId, userId),
        eq(youtubeApiKeys.isActive, true)
      ))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to check API key:", error);
    return false;
  }
}

// User preferences functions

export async function getUserPreference(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user preference:", error);
    return null;
  }
}

export async function setUserLanguage(userId: number, language: 'ru' | 'en') {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const existing = await getUserPreference(userId);

    if (existing) {
      await db.update(userPreferences)
        .set({ language })
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({
        userId,
        language,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to set user language:", error);
    throw error;
  }
}
