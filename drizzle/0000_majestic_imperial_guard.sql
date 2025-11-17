CREATE TABLE `characters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`age` text,
	`appearance` text,
	`role` text,
	`pov_role` text,
	`pov_purposes` text DEFAULT '[]',
	`series_arc_notes` text,
	`appearance_details` text,
	`development_goals` text,
	`relationships` text DEFAULT '{}',
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comp_titles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inspiration_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`content` text NOT NULL,
	`tags` text DEFAULT '[]',
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `magic_systems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`rules` text NOT NULL,
	`costs` text,
	`consequences` text,
	`examples` text,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `manuscripts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`file_path` text NOT NULL,
	`upload_date` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`word_count` integer,
	`upload_type` text NOT NULL,
	`sections_covered` text,
	`version_number` integer DEFAULT 1,
	`extracted_text` text,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `outlines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`structure` text DEFAULT '{}',
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `plot_threads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active',
	`resolution_type` text,
	`introduced_in_chapter` integer,
	`resolved_in_chapter` integer,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`genre_tags` text DEFAULT '[]',
	`book_type` text DEFAULT 'standalone' NOT NULL,
	`book_number` integer,
	`total_books` integer,
	`series_arc` text,
	`status` text DEFAULT 'planning' NOT NULL,
	`word_count_target` integer,
	`last_worked_on` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`outline_id` integer,
	`pov_character_id` integer,
	`location` text,
	`purpose_tags` text DEFAULT '[]',
	`tension_level` integer DEFAULT 1,
	`magic_used` text,
	`status` text DEFAULT 'rough',
	`order` integer NOT NULL,
	`title` text,
	`description` text,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outline_id`) REFERENCES `outlines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`pov_character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `thematic_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`theme` text NOT NULL,
	`description` text,
	`examples` text,
	`manifestations` text,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `world_building` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`details` text,
	`image_path` text,
	`created_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:00:40.366Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
