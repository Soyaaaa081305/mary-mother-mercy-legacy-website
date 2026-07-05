USE mary_mother_cms;

ALTER TABLE pages
  MODIFY COLUMN hero_image_path VARCHAR(1024) NULL;

ALTER TABLE legacy_entries
  MODIFY COLUMN image_path VARCHAR(1024) NULL;

ALTER TABLE caregiver_stories
  MODIFY COLUMN featured_image_path VARCHAR(1024) NULL;

ALTER TABLE gallery_images
  MODIFY COLUMN image_path VARCHAR(1024) NOT NULL;

ALTER TABLE contact_team_members
  MODIFY COLUMN profile_image_path VARCHAR(1024) NULL;

ALTER TABLE events
  MODIFY COLUMN image_path VARCHAR(1024) NULL;
