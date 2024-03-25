import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const guilds = sqliteTable('guilds', {
  id: text('id').primaryKey(),
  birthdayRole: text('birthday_role'),
  birthdayChannel: text('birthday_channel'),
})

export const guildsRelations = relations(guilds, ({ many }) => ({
  guildsToUsers: many(guildsToUsers),
}))

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  birthdayDate: integer('birthday_date', { mode: 'timestamp' }),
})

export const usersRelations = relations(users, ({ many }) => ({
  guildsToUsers: many(guildsToUsers),
}))

export const guildsToUsers = sqliteTable('guilds_to_users', {
    guildId: text('guild_id').notNull().references(() => guilds.id),
    userId: text('user_id').notNull().references(() => users.id),
  }, (table) => ({
    pk: primaryKey({ columns: [table.guildId, table.userId] }),
  }),
)

export const guildsToUsersRelations = relations(guildsToUsers, ({ one }) => ({
  guild: one(guilds, { fields: [guildsToUsers.guildId], references: [guilds.id] }),
  user: one(users, { fields: [guildsToUsers.userId], references: [users.id] }),
}))

export const youTubeChannels = sqliteTable('youtube_channels', {
  id: text('id').primaryKey(),
})

export const youTubeSubscriptions = sqliteTable('youtube_subscriptions', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  youTubeChannelId: text('youtube_channel_id').notNull().references(() => youTubeChannels.id, { onDelete: 'cascade' }),
  guildId: text('guild_id').notNull().references(() => guilds.id, { onDelete: 'cascade' }),
  guildTextChannelId: text('guild_text_channel_id').notNull(),
})

export const youTubeSubscriptionsRelations = relations(youTubeSubscriptions, ({ one }) => ({
  youTubeChannel: one(youTubeChannels, { fields: [youTubeSubscriptions.id], references: [youTubeChannels.id] }),
  guild: one(guilds, { fields: [youTubeSubscriptions.id], references: [guilds.id] }),
}))