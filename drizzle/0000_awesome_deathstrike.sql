CREATE TABLE `maps` (
	`owner` text NOT NULL,
	`id` text NOT NULL,
	`data` text NOT NULL,
	`version` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`owner`, `id`)
);
--> statement-breakpoint
CREATE INDEX `maps_owner_updated` ON `maps` (`owner`,`updated_at`);--> statement-breakpoint
CREATE TABLE `revisions` (
	`owner` text NOT NULL,
	`map_id` text NOT NULL,
	`version` integer NOT NULL,
	`data` text NOT NULL,
	`deleted` integer NOT NULL,
	`saved_at` integer NOT NULL,
	PRIMARY KEY(`owner`, `map_id`, `version`)
);
