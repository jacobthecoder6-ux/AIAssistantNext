import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  apiKey: text("api_key"),
  anthropicKey: text("anthropic_key"),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  preferredModel: text("preferred_model").default("gpt-4o"),
  preferredTheme: varchar("preferred_theme", { length: 10 }).default("light"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login")
});

export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats)
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  apiKey: true,
  anthropicKey: true,
  preferredLanguage: true,
  preferredModel: true,
  preferredTheme: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Chat model
export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  aiProvider: varchar("ai_provider", { length: 20 }).default("openai"),
  aiModel: text("ai_model").default("gpt-4o"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isArchived: boolean("is_archived").default(false),
});

export const chatsRelations = relations(chats, ({ many, one }) => ({
  messages: many(messages),
  user: one(users, {
    fields: [chats.userId],
    references: [users.id]
  })
}));

export const insertChatSchema = createInsertSchema(chats).pick({
  userId: true,
  title: true,
  aiProvider: true,
  aiModel: true,
});

// Message model
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'user' | 'bot'
  content: text("content").notNull(),
  language: varchar("language", { length: 10 }),
  codeBlocks: jsonb("code_blocks"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  })
}));

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  type: true,
  content: true,
  language: true,
  codeBlocks: true,
  metadata: true
});

// Code snippets model for storing reusable code
export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  language: varchar("language", { length: 20 }).notNull(),
  code: text("code").notNull(),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const codeSnippetsRelations = relations(codeSnippets, ({ one }) => ({
  user: one(users, {
    fields: [codeSnippets.userId],
    references: [users.id]
  })
}));

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets).pick({
  userId: true,
  title: true,
  description: true,
  language: true,
  code: true,
  tags: true
});

// Prompt templates to help the AI generate better code responses
export const promptTemplates = pgTable("prompt_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  templateText: text("template_text").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  isSystem: boolean("is_system").default(false),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const promptTemplatesRelations = relations(promptTemplates, ({ one }) => ({
  user: one(users, {
    fields: [promptTemplates.userId],
    references: [users.id]
  })
}));

export const insertPromptTemplateSchema = createInsertSchema(promptTemplates).pick({
  title: true,
  description: true,
  templateText: true,
  category: true,
  isSystem: true,
  userId: true
});

// Types
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;
export type InsertPromptTemplate = z.infer<typeof insertPromptTemplateSchema>;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
