CREATE TABLE `likes` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `likes_post_user_uidx` ON `likes` (`post_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `likes_post_id_idx` ON `likes` (`post_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`movie` text,
	`link` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `posts_created_at_idx` ON `posts` (`created_at`);