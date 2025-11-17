CREATE TABLE `manuscript_analysis` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manuscript_id` integer NOT NULL,
	`project_id` integer NOT NULL,
	`analysis_type` text NOT NULL,
	`results` text DEFAULT '{}',
	`status` text DEFAULT 'pending' NOT NULL,
	`error` text,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pov_segments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manuscript_id` integer NOT NULL,
	`character_name` text NOT NULL,
	`start_position` integer NOT NULL,
	`end_position` integer NOT NULL,
	`word_count` integer NOT NULL,
	`confidence` real NOT NULL,
	`chapter` text,
	`section` text,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_characters` (
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
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_characters`("id", "project_id", "name", "age", "appearance", "role", "pov_role", "pov_purposes", "series_arc_notes", "appearance_details", "development_goals", "relationships", "created_at", "updated_at") SELECT "id", "project_id", "name", "age", "appearance", "role", "pov_role", "pov_purposes", "series_arc_notes", "appearance_details", "development_goals", "relationships", "created_at", "updated_at" FROM `characters`;--> statement-breakpoint
DROP TABLE `characters`;--> statement-breakpoint
ALTER TABLE `__new_characters` RENAME TO `characters`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_comp_titles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comp_titles`("id", "project_id", "title", "author", "notes", "created_at", "updated_at") SELECT "id", "project_id", "title", "author", "notes", "created_at", "updated_at" FROM `comp_titles`;--> statement-breakpoint
DROP TABLE `comp_titles`;--> statement-breakpoint
ALTER TABLE `__new_comp_titles` RENAME TO `comp_titles`;--> statement-breakpoint
CREATE TABLE `__new_conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_conversations`("id", "project_id", "role", "content", "timestamp", "created_at") SELECT "id", "project_id", "role", "content", "timestamp", "created_at" FROM `conversations`;--> statement-breakpoint
DROP TABLE `conversations`;--> statement-breakpoint
ALTER TABLE `__new_conversations` RENAME TO `conversations`;--> statement-breakpoint
CREATE TABLE `__new_inspiration_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`content` text NOT NULL,
	`tags` text DEFAULT '[]',
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_inspiration_notes`("id", "project_id", "content", "tags", "created_at", "updated_at") SELECT "id", "project_id", "content", "tags", "created_at", "updated_at" FROM `inspiration_notes`;--> statement-breakpoint
DROP TABLE `inspiration_notes`;--> statement-breakpoint
ALTER TABLE `__new_inspiration_notes` RENAME TO `inspiration_notes`;--> statement-breakpoint
CREATE TABLE `__new_magic_systems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`rules` text NOT NULL,
	`costs` text,
	`consequences` text,
	`examples` text,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_magic_systems`("id", "project_id", "name", "rules", "costs", "consequences", "examples", "created_at", "updated_at") SELECT "id", "project_id", "name", "rules", "costs", "consequences", "examples", "created_at", "updated_at" FROM `magic_systems`;--> statement-breakpoint
DROP TABLE `magic_systems`;--> statement-breakpoint
ALTER TABLE `__new_magic_systems` RENAME TO `magic_systems`;--> statement-breakpoint
CREATE TABLE `__new_manuscripts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`file_path` text NOT NULL,
	`upload_date` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`word_count` integer,
	`upload_type` text NOT NULL,
	`sections_covered` text,
	`version_number` integer DEFAULT 1,
	`extracted_text` text,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_manuscripts`("id", "project_id", "file_name", "file_path", "upload_date", "word_count", "upload_type", "sections_covered", "version_number", "extracted_text", "created_at", "updated_at") SELECT "id", "project_id", "file_name", "file_path", "upload_date", "word_count", "upload_type", "sections_covered", "version_number", "extracted_text", "created_at", "updated_at" FROM `manuscripts`;--> statement-breakpoint
DROP TABLE `manuscripts`;--> statement-breakpoint
ALTER TABLE `__new_manuscripts` RENAME TO `manuscripts`;--> statement-breakpoint
CREATE TABLE `__new_outlines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`structure` text DEFAULT '{}',
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_outlines`("id", "project_id", "structure", "created_at", "updated_at") SELECT "id", "project_id", "structure", "created_at", "updated_at" FROM `outlines`;--> statement-breakpoint
DROP TABLE `outlines`;--> statement-breakpoint
ALTER TABLE `__new_outlines` RENAME TO `outlines`;--> statement-breakpoint
CREATE TABLE `__new_plot_threads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active',
	`resolution_type` text,
	`introduced_in_chapter` integer,
	`resolved_in_chapter` integer,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_plot_threads`("id", "project_id", "name", "description", "status", "resolution_type", "introduced_in_chapter", "resolved_in_chapter", "created_at", "updated_at") SELECT "id", "project_id", "name", "description", "status", "resolution_type", "introduced_in_chapter", "resolved_in_chapter", "created_at", "updated_at" FROM `plot_threads`;--> statement-breakpoint
DROP TABLE `plot_threads`;--> statement-breakpoint
ALTER TABLE `__new_plot_threads` RENAME TO `plot_threads`;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`genre_tags` text DEFAULT '[]',
	`book_type` text DEFAULT 'standalone' NOT NULL,
	`book_number` integer,
	`total_books` integer,
	`series_arc` text,
	`status` text DEFAULT 'planning' NOT NULL,
	`word_count_target` integer,
	`last_worked_on` integer DEFAULT '"2025-11-17T03:56:50.673Z"' NOT NULL,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.673Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.673Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "title", "genre_tags", "book_type", "book_number", "total_books", "series_arc", "status", "word_count_target", "last_worked_on", "created_at", "updated_at") SELECT "id", "title", "genre_tags", "book_type", "book_number", "total_books", "series_arc", "status", "word_count_target", "last_worked_on", "created_at", "updated_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
CREATE TABLE `__new_scenes` (
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
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outline_id`) REFERENCES `outlines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`pov_character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_scenes`("id", "project_id", "outline_id", "pov_character_id", "location", "purpose_tags", "tension_level", "magic_used", "status", "order", "title", "description", "created_at", "updated_at") SELECT "id", "project_id", "outline_id", "pov_character_id", "location", "purpose_tags", "tension_level", "magic_used", "status", "order", "title", "description", "created_at", "updated_at" FROM `scenes`;--> statement-breakpoint
DROP TABLE `scenes`;--> statement-breakpoint
ALTER TABLE `__new_scenes` RENAME TO `scenes`;--> statement-breakpoint
CREATE TABLE `__new_thematic_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`theme` text NOT NULL,
	`description` text,
	`examples` text,
	`manifestations` text,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_thematic_notes`("id", "project_id", "theme", "description", "examples", "manifestations", "created_at", "updated_at") SELECT "id", "project_id", "theme", "description", "examples", "manifestations", "created_at", "updated_at" FROM `thematic_notes`;--> statement-breakpoint
DROP TABLE `thematic_notes`;--> statement-breakpoint
ALTER TABLE `__new_thematic_notes` RENAME TO `thematic_notes`;--> statement-breakpoint
CREATE TABLE `__new_world_building` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`details` text,
	`image_path` text,
	`created_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-17T03:56:50.674Z"' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_world_building`("id", "project_id", "type", "name", "details", "image_path", "created_at", "updated_at") SELECT "id", "project_id", "type", "name", "details", "image_path", "created_at", "updated_at" FROM `world_building`;--> statement-breakpoint
DROP TABLE `world_building`;--> statement-breakpoint
ALTER TABLE `__new_world_building` RENAME TO `world_building`;