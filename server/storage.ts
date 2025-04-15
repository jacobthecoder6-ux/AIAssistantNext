import { users, type User, type InsertUser } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Types for chat and messages
export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat operations
  createChat(title: string): Promise<string>;
  getChatById(id: string): Promise<Chat | undefined>;
  getAllChats(): Promise<Chat[]>;
  addMessageToChat(chatId: string, message: Omit<Message, 'id'>): Promise<Message>;
  deleteChat(id: string): Promise<void>;
  clearAllChats(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<string, Chat>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.currentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Chat operations
  async createChat(title: string): Promise<string> {
    const id = uuidv4();
    const chat: Chat = {
      id,
      title,
      messages: [],
      timestamp: new Date()
    };
    this.chats.set(id, chat);
    return id;
  }

  async getChatById(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getAllChats(): Promise<Chat[]> {
    return Array.from(this.chats.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async addMessageToChat(chatId: string, message: Omit<Message, 'id'>): Promise<Message> {
    const chat = this.chats.get(chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    const newMessage: Message = {
      id: uuidv4(),
      ...message
    };

    chat.messages.push(newMessage);
    chat.timestamp = new Date(); // Update timestamp
    this.chats.set(chatId, chat);

    return newMessage;
  }

  async deleteChat(id: string): Promise<void> {
    this.chats.delete(id);
  }

  async clearAllChats(): Promise<void> {
    this.chats.clear();
  }
}

// Create singleton instance
export const storage = new MemStorage();
