import { 
  users, 
  translations, 
  conversations, 
  messages, 
  User, 
  InsertUser, 
  Translation, 
  InsertTranslation, 
  Conversation, 
  InsertConversation, 
  Message, 
  InsertMessage 
} from "@shared/schema";
import session from "express-session";
import memorystore from "memorystore";

// Create memory store factory
const MemoryStore = memorystore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Translation methods
  getTranslations(userId: number): Promise<Translation[]>;
  getTranslation(id: number): Promise<Translation | undefined>;
  getFavoriteTranslations(userId: number): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(id: number, data: Partial<Translation>): Promise<Translation | undefined>;
  
  // Conversation methods
  getConversations(userId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Message methods
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;
  
  // Session store
  sessionStore: any; // Using any for the session store type to avoid import issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private translations: Map<number, Translation>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  sessionStore: any; // Using any for the session store type to avoid import issues
  currentUserId: number;
  currentTranslationId: number;
  currentConversationId: number;
  currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.translations = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    this.currentUserId = 1;
    this.currentTranslationId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    
    // Initialize with some sample data
    this.seedData();
    console.log("Storage initialized with users:", Array.from(this.users.values()).map(u => u.username));
  }

  private seedData() {
    // Simple password - this is ONLY for testing purposes
    // In a real app, never store passwords like this
    const testPassword = "password123";
    
    // Create a simple test password - use a known string for testing
    const simplePassword = testPassword;
    
    // Create the main test user - this will actually use the proper password format
    this.createUser({
      username: "test",
      password: simplePassword,
      email: "test@example.com",
      name: "Test User",
      langPreference: "en"
    });
    
    // Create some French-speaking test users
    this.createUser({
      username: "marie",
      password: simplePassword,
      email: "marie@example.com",
      name: "Marie Dupont",
      langPreference: "fr"
    });
    
    this.createUser({
      username: "pierre",
      password: simplePassword,
      email: "pierre@example.com",
      name: "Pierre Lemaire",
      langPreference: "fr"
    });
    
    // Create an English-speaking test user
    this.createUser({
      username: "emma",
      password: simplePassword,
      email: "emma@example.com",
      name: "Emma Johnson",
      langPreference: "en"
    });
    
    // Seed some sample translations
    const testUser = Array.from(this.users.values()).find(u => u.username === "test");
    if (testUser) {
      this.createTranslation({
        userId: testUser.id,
        sourceText: "Hello, how are you?",
        translatedText: "Bonjour, comment allez-vous?",
        fromLang: "en",
        toLang: "fr",
        favorite: true
      });
      
      this.createTranslation({
        userId: testUser.id,
        sourceText: "I'm learning French",
        translatedText: "J'apprends le français",
        fromLang: "en",
        toLang: "fr",
        favorite: true
      });
      
      this.createTranslation({
        userId: testUser.id,
        sourceText: "Je suis très heureux de vous rencontrer",
        translatedText: "I am very happy to meet you",
        fromLang: "fr",
        toLang: "en",
        favorite: true
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      name: insertUser.name ?? null,
      langPreference: insertUser.langPreference ?? "en"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Translation methods
  async getTranslations(userId: number): Promise<Translation[]> {
    return Array.from(this.translations.values()).filter(
      (translation) => translation.userId === userId
    );
  }

  async getTranslation(id: number): Promise<Translation | undefined> {
    return this.translations.get(id);
  }

  async getFavoriteTranslations(userId: number): Promise<Translation[]> {
    return Array.from(this.translations.values()).filter(
      (translation) => translation.userId === userId && translation.favorite
    );
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const id = this.currentTranslationId++;
    const now = new Date();
    const newTranslation: Translation = { 
      ...translation, 
      id, 
      userId: translation.userId ?? null,
      favorite: translation.favorite ?? false,
      createdAt: now
    };
    this.translations.set(id, newTranslation);
    return newTranslation;
  }

  async updateTranslation(id: number, data: Partial<Translation>): Promise<Translation | undefined> {
    const translation = await this.getTranslation(id);
    if (!translation) return undefined;
    
    const updatedTranslation = { ...translation, ...data };
    this.translations.set(id, updatedTranslation);
    return updatedTranslation;
  }

  // Conversation methods
  async getConversations(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId || conversation.participantId === userId
    );
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const now = new Date();
    const newConversation: Conversation = { 
      ...conversation, 
      id, 
      lastMessageAt: now
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  // Message methods
  async getMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => {
        const timeA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
        const timeB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
        return timeA - timeB;
      });
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const newMessage: Message = { 
      ...message, 
      id, 
      sentAt: now, 
      read: (message as any).read ?? false 
    };
    this.messages.set(id, newMessage);
    
    // Update the conversation's lastMessageAt
    const conversation = await this.getConversation(message.conversationId);
    if (conversation) {
      await this.updateConversation(conversation.id, { lastMessageAt: now });
    }
    
    return newMessage;
  }

  private async updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = await this.getConversation(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { ...conversation, ...data };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    const messagesToUpdate = Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId && message.senderId !== userId && !message.read);
    
    for (const message of messagesToUpdate) {
      const updatedMessage = { ...message, read: true };
      this.messages.set(message.id, updatedMessage);
    }
  }
}

export const storage = new MemStorage();
