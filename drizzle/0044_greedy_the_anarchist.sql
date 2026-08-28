CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`sequence_number` integer NOT NULL,
	`direction` text NOT NULL,
	`msg_type` text DEFAULT 'text',
	`content` text NOT NULL,
	`metadata` text,
	`admin_id` text,
	`is_read` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chat_msgs_session` ON `chat_messages` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_msgs_sequence` ON `chat_messages` (`session_id`,`sequence_number`);--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`guest_name` text,
	`contact_id` text,
	`session_secret` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_chat_sessions_contact` ON `chat_sessions` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_sessions_user` ON `chat_sessions` (`user_id`);