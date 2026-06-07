USE mary_mother_cms;

ALTER TABLE support_information
  ADD COLUMN foundation_address TEXT NULL AFTER contact_number,
  ADD COLUMN foundation_email VARCHAR(160) NULL AFTER foundation_address,
  ADD COLUMN facebook_url VARCHAR(255) NULL AFTER foundation_email,
  ADD COLUMN youtube_url VARCHAR(255) NULL AFTER facebook_url,
  ADD COLUMN google_maps_query VARCHAR(255) NULL AFTER youtube_url;

CREATE TABLE IF NOT EXISTS donation_records (
  donation_id INT AUTO_INCREMENT PRIMARY KEY,
  donor_name VARCHAR(120) NOT NULL,
  donor_email VARCHAR(160) NOT NULL,
  donor_phone VARCHAR(60) NULL,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT NULL,
  reference_number VARCHAR(80) NOT NULL UNIQUE,
  paymongo_checkout_session_id VARCHAR(120) NULL,
  paymongo_checkout_url TEXT NULL,
  payment_status ENUM('Pending', 'Redirected', 'Paid', 'Cancelled', 'Failed') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  event_date DATETIME NULL,
  location VARCHAR(180) NULL,
  image_path VARCHAR(255) NULL,
  status ENUM('Draft', 'Published') NOT NULL DEFAULT 'Draft',
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_created_by_upgrade
    FOREIGN KEY (created_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS event_participations (
  participation_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone_number VARCHAR(60) NULL,
  organization VARCHAR(160) NULL,
  message TEXT NULL,
  status ENUM('Pending', 'Confirmed', 'Declined') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_participation_event_upgrade
    FOREIGN KEY (event_id) REFERENCES events(event_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_videos (
  video_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  video_url VARCHAR(255) NOT NULL,
  embed_url VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  status ENUM('Draft', 'Published') NOT NULL DEFAULT 'Published',
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_video_created_by_upgrade
    FOREIGN KEY (created_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

INSERT INTO events
  (title, description, event_date, location, image_path, status, created_by)
VALUES
  ('Volunteer Orientation Day',
   'A privacy-safe orientation for interested volunteers, school groups, and partner organizations. Participants learn about respectful service, donation coordination, and foundation guidelines.',
   '2026-07-20 09:00:00', 'Foundation activity area', '/images/placeholders/event-1.jpg', 'Published', 1),
  ('Community Donation Drive',
   'A coordinated event for receiving pre-approved in-kind donations such as hygiene kits, cleaning supplies, and food support. Donors are encouraged to contact staff before participating.',
   '2026-08-12 10:00:00', 'Foundation receiving area', '/images/placeholders/donations-1.jpg', 'Published', 2);

INSERT INTO site_videos
  (title, description, video_url, embed_url, display_order, status, created_by)
VALUES
  ('Foundation Introduction Video',
   'A sample CMS-managed YouTube link. Replace this with the foundation approved public video URL.',
   'https://www.youtube.com/watch?v=M7lc1UVf-VE',
   'https://www.youtube.com/embed/M7lc1UVf-VE',
   1, 'Published', 1);

