USE mary_mother_cms;

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS hero_eyebrow VARCHAR(120) NULL AFTER page_slug,
  ADD COLUMN IF NOT EXISTS hero_summary TEXT NULL AFTER title,
  ADD COLUMN IF NOT EXISTS hero_image_path VARCHAR(255) NULL AFTER hero_summary;

ALTER TABLE support_information
  ADD COLUMN IF NOT EXISTS telephone_number VARCHAR(80) NULL AFTER contact_number,
  ADD COLUMN IF NOT EXISTS gmail_address VARCHAR(160) NULL AFTER telephone_number;

CREATE TABLE IF NOT EXISTS contact_team_members (
  member_id INT AUTO_INCREMENT PRIMARY KEY,
  display_name VARCHAR(120) NOT NULL,
  role_title VARCHAR(120) NOT NULL,
  email VARCHAR(160) NULL,
  phone_number VARCHAR(80) NULL,
  profile_image_path VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  status ENUM('Draft', 'Published') NOT NULL DEFAULT 'Published',
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_member_created_by_upgrade
    FOREIGN KEY (created_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

UPDATE pages
SET
  hero_eyebrow = CASE page_slug
    WHEN 'home' THEN 'Legacy, care, and compassionate service'
    WHEN 'about' THEN 'About the Foundation'
    WHEN 'legacy' THEN 'Foundation Legacy'
    WHEN 'support' THEN 'Support and Donation Information'
    WHEN 'contact' THEN 'Official Contacts'
    ELSE page_name
  END,
  hero_summary = CASE page_slug
    WHEN 'home' THEN 'A respectful legacy website sharing the foundation mission, safe stories from staff, and ways to support the work.'
    WHEN 'about' THEN 'Learn about the foundation background, mission, vision, values, and service approach.'
    WHEN 'legacy' THEN 'Milestones, partnerships, and the continuing story of service.'
    WHEN 'support' THEN 'Coordinate donations, online giving, and event participation through official foundation channels.'
    WHEN 'contact' THEN 'Official contact channels, location map, and the foundation team contacts.'
    ELSE content
  END,
  hero_image_path = CASE page_slug
    WHEN 'home' THEN '/images/placeholders/compassion-care.jpg'
    WHEN 'about' THEN '/images/placeholders/facility-1.jpg'
    WHEN 'legacy' THEN '/images/placeholders/legacy-founding.jpg'
    WHEN 'support' THEN '/images/placeholders/donations-1.jpg'
    WHEN 'contact' THEN '/images/placeholders/staff-1.jpg'
    ELSE '/images/placeholders/compassion-care.jpg'
  END
WHERE hero_image_path IS NULL;

INSERT INTO pages
  (page_name, page_slug, hero_eyebrow, title, hero_summary, hero_image_path, content, status)
SELECT 'Stories Page', 'stories', 'Nurses and Caregivers Stories', 'Stories from the Staff Who Serve',
  'Privacy-safe reflections from nurses, caregivers, volunteers, and staff.',
  '/images/placeholders/caregiver-service.jpg',
  'Stories focus on compassion, teamwork, lessons learned, and daily service while protecting private resident information.',
  'Published'
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_slug = 'stories');

INSERT INTO pages
  (page_name, page_slug, hero_eyebrow, title, hero_summary, hero_image_path, content, status)
SELECT 'Gallery Page', 'gallery', 'Photo Gallery', 'Foundation Activities and Community Support',
  'Approved photos grouped by facility, events, outreach, volunteers, staff activities, and donations.',
  '/images/placeholders/community-support.jpg',
  'Photos are grouped by category and managed through the admin CMS.',
  'Published'
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_slug = 'gallery');

INSERT INTO pages
  (page_name, page_slug, hero_eyebrow, title, hero_summary, hero_image_path, content, status)
SELECT 'Videos Page', 'videos', 'Foundation Videos', 'Watch Approved Website Videos',
  'Approved YouTube or Vimeo videos embedded on the website.',
  '/images/placeholders/teamwork.jpg',
  'Videos are managed as links in the CMS, avoiding heavy direct uploads while keeping public viewing simple.',
  'Published'
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_slug = 'videos');

INSERT INTO pages
  (page_name, page_slug, hero_eyebrow, title, hero_summary, hero_image_path, content, status)
SELECT 'Events Page', 'events', 'Events and Participation', 'Join Coordinated Foundation Activities',
  'Volunteer orientations, donation drives, and community activities published by the foundation.',
  '/images/placeholders/event-1.jpg',
  'Submit participation requests for volunteer orientations, donation drives, and community support activities.',
  'Published'
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_slug = 'events');

UPDATE support_information
SET
  telephone_number = COALESCE(telephone_number, '(02) 0000 0000'),
  gmail_address = COALESCE(gmail_address, 'marymotherfoundation@gmail.com');

INSERT INTO contact_team_members
  (display_name, role_title, email, phone_number, profile_image_path, display_order, status, created_by)
SELECT 'Foundation Office', 'General Inquiries', 'info@marymother.local', '+63 900 000 0000', '/images/placeholders/team-office.jpg', 1, 'Published', 1
WHERE NOT EXISTS (SELECT 1 FROM contact_team_members WHERE display_name = 'Foundation Office');

INSERT INTO contact_team_members
  (display_name, role_title, email, phone_number, profile_image_path, display_order, status, created_by)
SELECT 'Donation Coordinator', 'Support and Donations', 'donations@marymother.local', '+63 900 111 2222', '/images/placeholders/team-donations.jpg', 2, 'Published', 1
WHERE NOT EXISTS (SELECT 1 FROM contact_team_members WHERE display_name = 'Donation Coordinator');

INSERT INTO contact_team_members
  (display_name, role_title, email, phone_number, profile_image_path, display_order, status, created_by)
SELECT 'Volunteer Coordinator', 'Events and Participation', 'volunteer@marymother.local', '+63 900 333 4444', '/images/placeholders/team-volunteer.jpg', 3, 'Published', 2
WHERE NOT EXISTS (SELECT 1 FROM contact_team_members WHERE display_name = 'Volunteer Coordinator');
