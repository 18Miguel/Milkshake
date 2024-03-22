import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const guilds = sqliteTable('guilds', {
  id: text('id').primaryKey(),
  birthdayRole: text('birthday_role'),
  birthdayChannel: text('birthday_channel'),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  birthdayDate: text('birthday_date'),
})

export const guildsRelations = relations(guilds, ({ many }) => ({
  users: many(users),
}))

export const usersRelations = relations(users, ({ many }) => ({
  guilds: many(guilds),
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
  youTubeChannels: one(youTubeChannels, { fields: [youTubeSubscriptions.id], references: [youTubeChannels.id] }),
  guilds: one(guilds, { fields: [youTubeSubscriptions.id], references: [guilds.id] }),
}))