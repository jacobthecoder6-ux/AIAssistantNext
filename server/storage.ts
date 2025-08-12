import { db } from './db';
import {
  users, chats, messages, codeSnippets, promptTemplates,
  specializedChatbots, specializedChatbotMessages,
  type User, type InsertUser, type InsertChat, type InsertMessage,
  type CodeSnippet, type PromptTemplate,
  type SpecializedChatbot, type SpecializedChatbotMessage,
  type InsertCodeSnippet, type InsertPromptTemplate,
  type InsertSpecializedChatbot, type InsertSpecializedChatbotMessage
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises'; // Import fs/promises for async file operations
import path from 'path'; // Import path module
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Types for chat and messages (for in-memory representation)
export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: string;
  codeBlocks?: any;
  metadata?: any;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  userId?: number;
  aiProvider?: string;
  aiModel?: string;
  isArchived?: boolean;
}

// In-memory storage implementation for quick prototyping
export class MemStorage implements IStorage {
  private chats: Map<string, Chat> = new Map();
  private users: Map<number, User> = new Map();
  private userPasswords: Map<string, string> = new Map();
  private premiumAccounts: Set<string> = new Set();
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = Math.floor(Math.random() * 1000000);
    const newUser: User = {
      id,
      username: user.username,
      password: user.password,
      unlocked: user.unlocked ?? false,
      preferredLanguage: user.preferredLanguage ?? null,
      preferredModel: user.preferredModel ?? null,
      preferredTheme: user.preferredTheme ?? null,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Chat operations
  async createChat(title: string, userId?: number, aiProvider?: string, aiModel?: string): Promise<string> {
    const id = uuidv4();
    const chat: Chat = {
      id,
      title,
      messages: [],
      timestamp: new Date(),
      userId,
      aiProvider,
      aiModel,
      isArchived: false
    };
    this.chats.set(id, chat);
    return id;
  }

  async getChatById(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getAllChats(userId?: number): Promise<Chat[]> {
    const allChats = Array.from(this.chats.values());
    if (userId) {
      return allChats.filter(chat => chat.userId === userId);
    }
    return allChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async addMessageToChat(chatId: string, message: Omit<Message, 'id'>): Promise<Message> {
    const chat = this.chats.get(chatId);
    if (!chat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }
    
    const newMessage: Message = {
      id: uuidv4(),
      ...message
    };
    
    chat.messages.push(newMessage);
    return newMessage;
  }

  async deleteChat(id: string): Promise<void> {
    this.chats.delete(id);
  }

  async clearAllChats(userId?: number): Promise<void> {
    if (userId) {
      const chatsArray = Array.from(this.chats.entries());
      const chatsToDelete = chatsArray
        .filter(([, chat]) => chat.userId === userId)
        .map(([id]) => id);
      chatsToDelete.forEach(id => this.chats.delete(id));
    } else {
      this.chats.clear();
    }
  }

  // Password storage
  async storeUserPassword(email: string, password: string): Promise<void> {
    this.userPasswords.set(email, password);
  }

  // Premium account operations
  async markAsPremiumAccount(email: string): Promise<void> {
    this.premiumAccounts.add(email);
  }

  async isPremiumAccount(email: string): Promise<boolean> {
    return this.premiumAccounts.has(email);
  }
}

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser?(id: number, data: Partial<User>): Promise<User | undefined>;

  // Chat operations
  createChat(title: string, userId?: number, aiProvider?: string, aiModel?: string): Promise<string>;
  getChatById(id: string): Promise<Chat | undefined>;
  getChatWithMessages?(id: string): Promise<{chat: Chat, messages: Message[]} | undefined>;
  getAllChats(userId?: number): Promise<Chat[]>;
  addMessageToChat(chatId: string, message: Omit<Message, 'id'>): Promise<Message>;
  deleteChat(id: string): Promise<void>;
  clearAllChats(userId?: number): Promise<void>;

  // Code snippet operations - added to support code generation capabilities
  createCodeSnippet?(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  getCodeSnippets?(userId: number): Promise<CodeSnippet[]>;
  getCodeSnippetsByLanguage?(language: string): Promise<CodeSnippet[]>;

  // Prompt template operations - added to enhance AI with custom prompts for coding
  createPromptTemplate?(template: InsertPromptTemplate): Promise<PromptTemplate>;
  getPromptTemplates?(category?: string): Promise<PromptTemplate[]>;

  // Password storage (insecure - for demonstration only)
  storeUserPassword(email: string, password: string): Promise<void>;
  // Premium account operations
  markAsPremiumAccount(email: string): Promise<void>;
  isPremiumAccount(email: string): Promise<boolean>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private userPasswordsFile: string;

  constructor() {
    this.userPasswordsFile = path.join(__dirname, 'user-passwords.json');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Chat operations
  async createChat(title: string, userId?: number, aiProvider: string = 'openai', aiModel: string = 'gpt-4o'): Promise<string> {
    const id = uuidv4();
    await db.insert(chats).values({
      id,
      title,
      userId: userId || null,
      aiProvider,
      aiModel,
      timestamp: new Date()
    });
    return id;
  }

  async getChatById(id: string): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    if (!chat) return undefined;

    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, id))
      .orderBy(messages.timestamp);

    return {
      id: chat.id,
      title: chat.title,
      messages: chatMessages.map(msg => ({
        id: msg.id,
        type: msg.type as 'user' | 'bot',
        content: msg.content,
        timestamp: msg.timestamp,
        language: msg.language || undefined,
        codeBlocks: msg.codeBlocks || undefined,
        metadata: msg.metadata || undefined
      })),
      timestamp: chat.timestamp,
      userId: chat.userId || undefined,
      aiProvider: chat.aiProvider || undefined,
      aiModel: chat.aiModel || undefined,
      isArchived: chat.isArchived || false
    };
  }

  async getChatWithMessages(id: string): Promise<{chat: Chat, messages: Message[]} | undefined> {
    const [chatData] = await db.select().from(chats).where(eq(chats.id, id));
    if (!chatData) return undefined;

    const messageList = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, id))
      .orderBy(messages.timestamp);

    const formattedMessages = messageList.map(msg => ({
      id: msg.id,
      type: msg.type as 'user' | 'bot',
      content: msg.content,
      timestamp: msg.timestamp,
      language: msg.language || undefined,
      codeBlocks: msg.codeBlocks || undefined,
      metadata: msg.metadata || undefined
    }));

    const chat = {
      id: chatData.id,
      title: chatData.title,
      messages: formattedMessages,
      timestamp: chatData.timestamp,
      userId: chatData.userId || undefined,
      aiProvider: chatData.aiProvider || undefined,
      aiModel: chatData.aiModel || undefined,
      isArchived: chatData.isArchived || false
    };

    return { chat, messages: formattedMessages };
  }

  async getAllChats(userId?: number): Promise<Chat[]> {
    let chatsList;

    if (userId) {
      chatsList = await db
        .select()
        .from(chats)
        .where(eq(chats.userId, userId))
        .orderBy(desc(chats.timestamp));
    } else {
      chatsList = await db
        .select()
        .from(chats)
        .orderBy(desc(chats.timestamp));
    }

    // For each chat, get its messages
    const result: Chat[] = [];

    for (const chat of chatsList) {
      const messagesList = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chat.id))
        .orderBy(messages.timestamp);

      result.push({
        id: chat.id,
        title: chat.title,
        messages: messagesList.map(msg => ({
          id: msg.id,
          type: msg.type as 'user' | 'bot',
          content: msg.content,
          timestamp: msg.timestamp,
          language: msg.language || undefined,
          codeBlocks: msg.codeBlocks || undefined,
          metadata: msg.metadata || undefined
        })),
        timestamp: chat.timestamp,
        userId: chat.userId || undefined,
        aiProvider: chat.aiProvider || undefined,
        aiModel: chat.aiModel || undefined,
        isArchived: chat.isArchived || false
      });
    }

    return result;
  }

  async addMessageToChat(chatId: string, message: Omit<Message, 'id'>): Promise<Message> {
    // Check if chat exists
    const chat = await db.select().from(chats).where(eq(chats.id, chatId));
    if (chat.length === 0) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    // Update chat timestamp
    await db
      .update(chats)
      .set({ timestamp: new Date() })
      .where(eq(chats.id, chatId));

    const id = uuidv4();
    const [newMessage] = await db
      .insert(messages)
      .values({
        id,
        chatId,
        type: message.type,
        content: message.content,
        language: message.language || null,
        codeBlocks: message.codeBlocks || null,
        metadata: message.metadata || null,
        timestamp: message.timestamp || new Date()
      })
      .returning();

    return {
      id: newMessage.id,
      type: newMessage.type as 'user' | 'bot',
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      language: newMessage.language || undefined,
      codeBlocks: newMessage.codeBlocks || undefined,
      metadata: newMessage.metadata || undefined
    };
  }

  async deleteChat(id: string): Promise<void> {
    // Messages will be cascade deleted due to foreign key constraint
    await db.delete(chats).where(eq(chats.id, id));
  }

  async clearAllChats(userId?: number): Promise<void> {
    if (userId) {
      await db.delete(chats).where(eq(chats.userId, userId));
    } else {
      await db.delete(chats);
    }
  }

  // Code snippet operations
  async createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const [newSnippet] = await db
      .insert(codeSnippets)
      .values(snippet)
      .returning();

    return newSnippet;
  }

  async getCodeSnippets(userId: number): Promise<CodeSnippet[]> {
    return db
      .select()
      .from(codeSnippets)
      .where(eq(codeSnippets.userId, userId))
      .orderBy(desc(codeSnippets.createdAt));
  }

  async getCodeSnippetsByLanguage(language: string): Promise<CodeSnippet[]> {
    return db
      .select()
      .from(codeSnippets)
      .where(eq(codeSnippets.language, language))
      .orderBy(desc(codeSnippets.createdAt));
  }

  // Prompt template operations
  async createPromptTemplate(template: InsertPromptTemplate): Promise<PromptTemplate> {
    const [newTemplate] = await db
      .insert(promptTemplates)
      .values(template)
      .returning();

    return newTemplate;
  }

  async getPromptTemplates(category?: string): Promise<PromptTemplate[]> {
    if (category) {
      return db
        .select()
        .from(promptTemplates)
        .where(eq(promptTemplates.category, category))
        .orderBy(desc(promptTemplates.createdAt));
    }

    return db
      .select()
      .from(promptTemplates)
      .orderBy(desc(promptTemplates.createdAt));
  }

  // Store user password (insecure - for demonstration only)
  async storeUserPassword(email: string, password: string): Promise<void> {
    try {
      // Read existing data
      let userData: Record<string, string> = {};
      try {
        const data = await fs.readFile(this.userPasswordsFile, 'utf8');
        userData = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet, userData remains empty object
      }

      // Add/update user
      userData[email] = password;

      // Write back to file
      await fs.writeFile(this.userPasswordsFile, JSON.stringify(userData));
      console.log('User password stored successfully');
    } catch (error) {
      console.error('Error storing user password:', error);
      throw error;
    }
  }

  async markAsPremiumAccount(email: string): Promise<void> {
    try {
      const premiumFile = path.join(__dirname, '..', 'premium-accounts.json');

      // Read existing premium accounts
      let premiumAccounts: string[] = [];
      try {
        const data = await fs.readFile(premiumFile, 'utf8');
        premiumAccounts = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet, premiumAccounts remains empty array
      }

      // Add email if not already in list
      if (!premiumAccounts.includes(email)) {
        premiumAccounts.push(email);
        await fs.writeFile(premiumFile, JSON.stringify(premiumAccounts, null, 2));
      }

      console.log('Premium account marked successfully');
    } catch (error) {
      console.error('Error marking premium account:', error);
      throw error;
    }
  }

  async isPremiumAccount(email: string): Promise<boolean> {
    try {
      const premiumFile = path.join(__dirname, '..', 'premium-accounts.json');

      try {
        const data = await fs.readFile(premiumFile, 'utf8');
        const premiumAccounts: string[] = JSON.parse(data);
        return premiumAccounts.includes(email);
      } catch (error) {
        // File doesn't exist or can't be read, return false
        return false;
      }
    } catch (error) {
      console.error('Error checking premium account:', error);
      return false;
    }
  }
}

// Create and export an instance of the MemStorage for now (switch to DatabaseStorage when database is ready)
export const storage = new MemStorage();