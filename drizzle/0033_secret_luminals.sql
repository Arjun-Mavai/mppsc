CREATE INDEX `idx_support_conv_guest_phone` ON `support_conversations` (`guest_phone`);--> statement-breakpoint
CREATE INDEX `idx_support_conv_last_msg` ON `support_conversations` (`last_message_at`);--> statement-breakpoint
CREATE INDEX `idx_support_msg_conv_id` ON `support_messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `idx_support_msg_created_at` ON `support_messages` (`created_at`);