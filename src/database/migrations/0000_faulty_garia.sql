CREATE TABLE `guilds` (
	`id` text PRIMARY KEY NOT NULL,
	`birthday_role` text,
	`birthday_channel` text
);
--> statement-breakpoint
CREATE TABLE `guilds_to_users` (
	`guild_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`guild_id`, `user_id`),
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`birthday_date` integer
);
--> statement-breakpoint
CREATE TABLE `youtube_channels` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `youtube_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`youtube_channel_id` text NOT NULL,
	`guild_id` text NOT NULL,
	`guild_text_channel_id` text NOT NULL,
	FOREIGN KEY (`youtube_channel_id`) REFERENCES `youtube_channels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE cascade
);
