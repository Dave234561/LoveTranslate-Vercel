import { users, translations, conversations, messages, type User, type InsertUser, type Translation, type InsertTranslation, type Conversation, type InsertConversation, type Message, type InsertMessage } from "../shared/schema.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, ne } from "drizzle-orm";
import postgres from "postgres";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const PostgresStore = connectPgSimple(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  getTranslations(userId: number): Promise<Translation[]>;
  getTranslation(id: number): Promise<Translation | undefined>;
  getFavoriteTranslations(userId: number): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(id: number, data: Partial<Translation>): Promise<Translation | undefined>;
  
  getConversations(userId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation | undefined>;
  
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  private db: any;
  public sessionStore: session.Store;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    
    // Use a single connection for the database
    const client = postgres(connectionString, { prepare: false });
    this.db = drizzle(client);
    
    // Session store with optimized connection
    this.sessionStore = new PostgresStore({
      conString: connectionString,
      createTableIfMissing: true,
      schemaName: 'public',
      tableName: 'session'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await this.db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getTranslations(userId: number): Promise<Translation[]> {
    return await this.db.select().from(translations).where(eq(translations.userId, userId));
  }

  async getTranslation(id: number): Promise<Translation | undefined> {
    const [translation] = await this.db.select().from(translations).where(eq(translations.id, id));
    return translation;
  }

  async getFavoriteTranslations(userId: number): Promise<Translation[]> {
    return await this.db.select().from(translations).where(
      and(
        eq(translations.userId, userId),
        eq(translations.favorite, true)
      )
    );
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const [translation] = await this.db.insert(translations).values(insertTranslation).returning();
    return translation;
  }

  async updateTranslation(id: number, data: Partial<Translation>): Promise<Translation | undefined> {
    const [translation] = await this.db.update(translations).set(data).where(eq(translations.id, id)).returning();
    return translation;
  }

  async getConversations(userId: number): Promise<Conversation[]> {
    return await this.db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await this.db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await this.db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await this.db.update(conversations).set(data).where(eq(conversations.id, id)).returning();
    return conversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await this.db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.sentAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await this.db.insert(messages).values(insertMessage).returning();
    
    // Update lastMessageAt in conversation
    await this.updateConversation(insertMessage.conversationId, { lastMessageAt: new Date() });
    
    return message;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await this.db.update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.read, false),
          ne(messages.senderId, userId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
