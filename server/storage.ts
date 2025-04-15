import { db } from './db';
import { 
  users, chats, messages, codeSnippets, promptTemplates,
  type User, type InsertUser, type InsertChat, type InsertMessage,
  type CodeSnippet, type PromptTemplate,
  type InsertCodeSnippet, type InsertPromptTemplate
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

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
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
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
}

// Create and export an instance of the DatabaseStorage
export const storage = new DatabaseStorage();
