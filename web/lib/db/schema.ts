import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Better Auth — tables core (schéma officiel, ne pas renommer)        */
/* ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  // Champ applicatif : plan de l'utilisateur (quota agents)
  plan: text("plan", { enum: ["free", "pro"] }).default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/* ------------------------------------------------------------------ */
/* Application — agents, conversations, messages, fichiers             */
/* ------------------------------------------------------------------ */

export const messageRole = pgEnum("message_role", ["user", "assistant", "system"]);

export const aiProvider = pgEnum("ai_provider", [
  "ollama",
  "anthropic",
  "openai",
  "mistral",
]);

export const agent = pgTable(
  "agent",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    systemPrompt: text("system_prompt").notNull().default(""),
    // Provider LLM porté par l'agent (défaut: ollama, local)
    provider: aiProvider("provider").notNull().default("ollama"),
    model: text("model").notNull().default("llama3.1"),
    // Clé API spécifique à l'agent (null pour Ollama). Stockée telle quelle.
    apiKey: text("api_key"),
    // Agents locaux embarqués (non modifiables / non supprimables)
    isLocal: boolean("is_local").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("agent_user_id_idx").on(table.userId)],
);

export const conversation = pgTable(
  "conversation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => agent.id, { onDelete: "set null" }),
    title: text("title").notNull().default("Nouvelle conversation"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("conversation_user_id_idx").on(table.userId)],
);

export const message = pgTable(
  "message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("message_conversation_id_idx").on(table.conversationId)],
);

export const file = pgTable(
  "file",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id").references(() => conversation.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    extractedText: text("extracted_text").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("file_user_id_idx").on(table.userId)],
);

/* ------------------------------------------------------------------ */
/* Relations                                                          */
/* ------------------------------------------------------------------ */

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  agents: many(agent),
  conversations: many(conversation),
  files: many(file),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const agentRelations = relations(agent, ({ one, many }) => ({
  user: one(user, { fields: [agent.userId], references: [user.id] }),
  conversations: many(conversation),
}));

export const conversationRelations = relations(conversation, ({ one, many }) => ({
  user: one(user, { fields: [conversation.userId], references: [user.id] }),
  agent: one(agent, { fields: [conversation.agentId], references: [agent.id] }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
}));

export const fileRelations = relations(file, ({ one }) => ({
  user: one(user, { fields: [file.userId], references: [user.id] }),
  conversation: one(conversation, {
    fields: [file.conversationId],
    references: [conversation.id],
  }),
}));
