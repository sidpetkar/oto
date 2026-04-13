import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const devices = sqliteTable("devices", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  otterName: text("otter_name"),
  publicKey: text("public_key").notNull(),
  platform: text("platform").notNull(),
  lastSeen: integer("last_seen"),
  avatarColor: text("avatar_color"),
  isSaved: integer("is_saved").default(0),
});

export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hashtag: text("hashtag"),
  createdAt: integer("created_at"),
  role: text("role").notNull(),
  isLocal: integer("is_local").default(1),
});

export const transfers = sqliteTable("transfers", {
  id: text("id").primaryKey(),
  roomId: text("room_id"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  checksum: text("checksum"),
  bytesReceived: integer("bytes_received").default(0),
  status: text("status").notNull(),
  direction: text("direction").notNull(),
  timestamp: integer("timestamp"),
  peerId: text("peer_id"),
  mode: text("mode"),
});

export const hashtags = sqliteTable("hashtags", {
  tag: text("tag").primaryKey(),
  lastUsed: integer("last_used"),
  useCount: integer("use_count").default(1),
});
