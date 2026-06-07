DROP DATABASE IF EXISTS mary_mother_cms;
CREATE DATABASE mary_mother_cms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mary_mother_cms;

CREATE TABLE admin_users (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Super Admin', 'Content Editor', 'Viewer') NOT NULL DEFAULT 'Viewer',
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE pages (
  page_id INT AUTO_INCREMENT PRIMARY KEY,
  page_name VARCHAR(100) NOT NULL,
  page_slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('Draft', 'Published') NOT NULL DEFAULT 'Published',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE legacy_entries (
  legacy_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  milestone_date DATE NULL,
  image_path VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  status ENUM('Draft', 'Published') NOT NULL DEFAULT 'Draft',
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_legacy_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

CREATE TABLE caregiver_stories (
  story_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  author_name VARCHAR(120) NOT NULL,
  author_role VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  featured_image_path VARCHAR(255) NULL,
  status ENUM('Draft', 'Published') NOT NULL DEFAULT 'Draft',
  created_by INT NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_story_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

CREATE TABLE gallery_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE gallery_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  caption TEXT NULL,
  image_path VARCHAR(255) NOT NULL,
  alt_text VARCHAR(180) NULL,
  uploaded_by INT NULL,
  status ENUM('Draft', 'Published') NOT NULL DEFAULT 'Published',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_gallery_category
    FOREIGN KEY (category_id) REFERENCES gallery_categories(category_id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_gallery_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

CREATE TABLE support_information (
  support_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  bank_details TEXT NULL,
  in_kind_donations TEXT NULL,
  contact_person VARCHAR(120) NULL,
  contact_number VARCHAR(80) NULL,
  foundation_address TEXT NULL,
  foundation_email VARCHAR(160) NULL,
  facebook_url VARCHAR(255) NULL,
  youtube_url VARCHAR(255) NULL,
  google_maps_query VARCHAR(255) NULL,
  updated_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_support_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

CREATE TABLE contact_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone_number VARCHAR(60) NULL,
  subject VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('Unread', 'Read') NOT NULL DEFAULT 'Unread',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donation_records (
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

CREATE TABLE events (
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
  CONSTRAINT fk_event_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

CREATE TABLE event_participations (
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
  CONSTRAINT fk_participation_event
    FOREIGN KEY (event_id) REFERENCES events(event_id)
    ON DELETE CASCADE
);

CREATE TABLE site_videos (
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
  CONSTRAINT fk_video_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

CREATE TABLE activity_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  action VARCHAR(100) NOT NULL,
  table_affected VARCHAR(100) NOT NULL,
  record_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_admin
    FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id)
    ON DELETE SET NULL
);

CREATE INDEX idx_pages_slug_status ON pages(page_slug, status);
CREATE INDEX idx_legacy_status_order ON legacy_entries(status, display_order, milestone_date);
CREATE INDEX idx_stories_status_date ON caregiver_stories(status, published_at);
CREATE INDEX idx_gallery_status_category ON gallery_images(status, category_id);
CREATE INDEX idx_messages_status_created ON contact_messages(status, created_at);
CREATE INDEX idx_donation_reference ON donation_records(reference_number);
CREATE INDEX idx_donation_status_created ON donation_records(payment_status, created_at);
CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_participations_event_status ON event_participations(event_id, status);
CREATE INDEX idx_videos_status_order ON site_videos(status, display_order);
CREATE INDEX idx_logs_created ON activity_logs(created_at);
