USE mary_mother_cms;

INSERT INTO admin_users
  (full_name, email, password_hash, role, status)
VALUES
  ('System Administrator', 'admin@marymother.local', 'scrypt$16384$8$1$bac8e91173cef8796bb7db48149a92c7$c2ec98f3c4e11a46f5ac7d8b0bc6595c312370802cef9d519a1354a2e681e1c02526ce164206f937f4b1f8f7cb01048a7a91c1fce15372c34c3f2e37d76ddf39', 'Super Admin', 'Active'),
  ('Content Editor', 'editor@marymother.local', 'scrypt$16384$8$1$249ca9f850e5a212fd269ea2a532f464$88b66b436bb2170a95d50ea1de92e0b025c83f1ab3c29ff3eee05baa9ab024b9d6400c4c06c5e6fa2d15aeea933f4bb973840396f95f9033c5b143af20bc1eae', 'Content Editor', 'Active'),
  ('Dashboard Viewer', 'viewer@marymother.local', 'scrypt$16384$8$1$7b50094d688106bee2132b503e0d309a$1d07dc99a4fbc80639c3cdb55ad5eb243c3a8820751c37a968bff982f254045191b2f1f3b52d57cc2cdaff1de589f87921e0187e5dc8fe5ca244fb7f32e390d5', 'Viewer', 'Active');

INSERT INTO pages
  (page_name, page_slug, hero_eyebrow, title, hero_summary, hero_image_path, content, status)
VALUES
  ('Home Page', 'home', 'Legacy, care, and compassionate service', 'Mary Mother of Mercy Home For the Elderly And Abandoned Foundation',
   'A respectful legacy website sharing the foundation mission, safe stories from staff, and ways to support the work.',
   '/images/placeholders/compassion-care.jpg',
   'Mary Mother of Mercy Home is a compassionate foundation dedicated to providing respectful care, safe shelter, and steady support for vulnerable elderly persons. This legacy website shares the foundation history, mission, services, and staff reflections while protecting the privacy and dignity of everyone served.',
   'Published'),
  ('About Page', 'about', 'About the Foundation', 'About the Foundation',
   'Learn about the foundation background, mission, vision, values, and service approach.',
   '/images/placeholders/facility-1.jpg',
   'The foundation exists to offer a caring home environment, daily assistance, spiritual encouragement, and community support. Its work is guided by mercy, dignity, patience, service, and respect. The website describes the organization and its programs without revealing private resident details.',
   'Published'),
  ('Legacy Page', 'legacy', 'Foundation Legacy', 'Our Legacy of Mercy and Care',
   'Milestones, partnerships, and the continuing story of service.',
   '/images/placeholders/legacy-founding.jpg',
   'The legacy of Mary Mother of Mercy Home is told through years of service, community partnership, volunteer generosity, and the commitment of staff who continue to serve with compassion.',
   'Published'),
  ('Support Page', 'support', 'Support and Donation Information', 'Support the Foundation',
   'Coordinate donations, online giving, and event participation through official foundation channels.',
   '/images/placeholders/donations-1.jpg',
   'Support may be given through financial assistance, food, hygiene supplies, medicines coordinated through staff, clothing, facility supplies, volunteer help, and prayerful encouragement. Online payment processing is not included in this system.',
   'Published'),
  ('Contact Page', 'contact', 'Official Contacts', 'Contact Mary Mother of Mercy Home',
   'Official contact channels, location map, and the foundation team contacts.',
   '/images/placeholders/staff-1.jpg',
   'Reach out to the foundation for inquiries, visits, donations, volunteer coordination, or partnership opportunities. Messages sent through this website are saved for staff review.',
   'Published'),
  ('Stories Page', 'stories', 'Nurses and Caregivers Stories', 'Stories from the Staff Who Serve',
   'Privacy-safe reflections from nurses, caregivers, volunteers, and staff.',
   '/images/placeholders/caregiver-service.jpg',
   'Stories focus on compassion, teamwork, lessons learned, and daily service while protecting private resident information.',
   'Published'),
  ('Gallery Page', 'gallery', 'Photo Gallery', 'Foundation Activities and Community Support',
   'Approved photos grouped by facility, events, outreach, volunteers, staff activities, and donations.',
   '/images/placeholders/community-support.jpg',
   'Photos are grouped by category and managed through the admin CMS.',
   'Published'),
  ('Videos Page', 'videos', 'Foundation Videos', 'Watch Approved Website Videos',
   'Approved YouTube or Vimeo videos embedded on the website.',
   '/images/placeholders/teamwork.jpg',
   'Videos are managed as links in the CMS, avoiding heavy direct uploads while keeping public viewing simple.',
   'Published'),
  ('Events Page', 'events', 'Events and Participation', 'Join Coordinated Foundation Activities',
   'Volunteer orientations, donation drives, and community activities published by the foundation.',
   '/images/placeholders/event-1.jpg',
   'Submit participation requests for volunteer orientations, donation drives, and community support activities.',
   'Published');

INSERT INTO legacy_entries
  (title, content, milestone_date, image_path, display_order, status, created_by)
VALUES
  ('A Foundation Built on Mercy',
   'Mary Mother of Mercy Home began with a simple purpose: to create a respectful place of care where vulnerable elderly persons could receive attention, shelter, and compassion. This milestone highlights the organization''s founding spirit rather than private individual stories.',
   '2010-01-15', '/images/placeholders/legacy-founding.jpg', 1, 'Published', 1),
  ('Community Support Grew Stronger',
   'Through local volunteers, donors, staff, and partner groups, the foundation expanded its ability to provide meals, daily care, spiritual support, and practical assistance. This milestone celebrates the community around the foundation.',
   '2016-07-20', '/images/placeholders/community-support.jpg', 2, 'Published', 1),
  ('Continuing a Legacy of Compassion',
   'The foundation continues to strengthen its public presence, share its values, and invite responsible support while maintaining a privacy-safe approach to storytelling.',
   '2024-03-10', '/images/placeholders/compassion-care.jpg', 3, 'Published', 2);

INSERT INTO caregiver_stories
  (title, author_name, author_role, content, featured_image_path, status, created_by, published_at)
VALUES
  ('A Day of Service and Compassion',
   'Nurse Maria', 'Nurse',
   'Each day begins with preparation, teamwork, and a quiet reminder that care is shown through small consistent actions. Serving in the foundation has taught me that compassion is not only a feeling. It is a practice of patience, listening, and respect. Our staff works together so daily routines feel calmer, safer, and more dignified for everyone in our care.',
   '/images/placeholders/caregiver-service.jpg', 'Published', 2, '2026-01-10 09:00:00'),
  ('Lessons Learned from Caring with Patience',
   'Caregiver Staff', 'Caregiver',
   'Patience is one of the most important lessons I have learned in this work. Some days are busy and challenging, but steady care helps create trust. The foundation reminds us to serve with gentleness, to protect privacy, and to focus on dignity in every task.',
   '/images/placeholders/patient-care.jpg', 'Published', 2, '2026-02-08 09:00:00'),
  ('Why Teamwork Matters in Elderly Care',
   'Volunteer Coordinator Ana', 'Volunteer Coordinator',
   'No one serves alone. Nurses, caregivers, volunteers, donors, and administrators all contribute to the daily rhythm of the home. Teamwork allows us to respond with organization and kindness while keeping the needs of the foundation at the center.',
   '/images/placeholders/teamwork.jpg', 'Published', 1, '2026-03-12 09:00:00');

INSERT INTO gallery_categories
  (category_name, description)
VALUES
  ('Facility', 'Photos of the foundation spaces and facilities.'),
  ('Events', 'Foundation programs, celebrations, and organized activities.'),
  ('Outreach', 'Community outreach and partnership activities.'),
  ('Volunteers', 'Volunteer groups and service activities.'),
  ('Staff Activities', 'Nurses, caregivers, and staff teamwork activities.'),
  ('Donations', 'Donated supplies and support activities.');

INSERT INTO gallery_images
  (category_id, title, caption, image_path, alt_text, uploaded_by, status)
VALUES
  (1, 'Welcoming Facility Area', 'A respectful view of the foundation environment.', '/images/placeholders/facility-1.jpg', 'Clean welcoming facility space', 1, 'Published'),
  (1, 'Care Preparation Area', 'Organized spaces help staff prepare for daily routines.', '/images/placeholders/facility-2.jpg', 'Organized care preparation area', 1, 'Published'),
  (2, 'Community Program', 'A foundation program supported by staff and volunteers.', '/images/placeholders/event-1.jpg', 'Community program setup', 2, 'Published'),
  (3, 'Outreach Coordination', 'Staff and partners prepare outreach support.', '/images/placeholders/outreach-1.jpg', 'Outreach supplies organized on tables', 2, 'Published'),
  (4, 'Volunteer Service', 'Volunteers help with safe and respectful foundation activities.', '/images/placeholders/volunteers-1.jpg', 'Volunteers arranging support supplies', 2, 'Published'),
  (5, 'Staff Teamwork', 'Care work is strengthened through communication and teamwork.', '/images/placeholders/staff-1.jpg', 'Staff teamwork meeting', 1, 'Published'),
  (6, 'Donation Supplies', 'In-kind support helps the foundation continue serving.', '/images/placeholders/donations-1.jpg', 'Donation supplies sorted carefully', 1, 'Published'),
  (6, 'Support Packages', 'Support packages prepared for foundation use.', '/images/placeholders/donations-2.jpg', 'Support packages ready for delivery', 2, 'Published');

INSERT INTO support_information
  (title, content, bank_details, in_kind_donations, contact_person, contact_number, telephone_number, gmail_address, foundation_address, foundation_email, facebook_url, youtube_url, google_maps_query, updated_by)
VALUES
  ('Ways to Support Mary Mother of Mercy Home',
   'The foundation welcomes responsible support from individuals, families, schools, churches, civic groups, and partner organizations. Please contact staff before sending financial or in-kind donations so the foundation can confirm current needs.',
   'Sample Bank: Mercy Community Bank\nAccount Name: Mary Mother of Mercy Home Foundation\nAccount Number: 0000-0000-0000\nNote: Replace these sample details with verified foundation information before public use.',
   'Food supplies, hygiene kits, cleaning materials, adult care supplies, vitamins coordinated through staff, linens, clothing in good condition, and facility maintenance supplies.',
   'Foundation Office', '+63 900 000 0000', '(02) 0000 0000', 'marymotherfoundation@gmail.com',
   'Replace with verified foundation address, Philippines',
   'info@marymother.local',
   'https://www.facebook.com/',
   'https://www.youtube.com/',
   'Mary Mother of Mercy Home For the Elderly And Abandoned Foundation Philippines',
   1);

INSERT INTO contact_team_members
  (display_name, role_title, email, phone_number, profile_image_path, display_order, status, created_by)
VALUES
  ('Foundation Office', 'General Inquiries', 'info@marymother.local', '+63 900 000 0000', '/images/placeholders/team-office.jpg', 1, 'Published', 1),
  ('Donation Coordinator', 'Support and Donations', 'donations@marymother.local', '+63 900 111 2222', '/images/placeholders/team-donations.jpg', 2, 'Published', 1),
  ('Volunteer Coordinator', 'Events and Participation', 'volunteer@marymother.local', '+63 900 333 4444', '/images/placeholders/team-volunteer.jpg', 3, 'Published', 2);

INSERT INTO donation_records
  (donor_name, donor_email, donor_phone, amount, message, reference_number, payment_status)
VALUES
  ('Sample Donor', 'donor@example.com', '+63 900 111 2222', 500.00, 'For foundation support demonstration.', 'DON-SEED-001', 'Pending');

INSERT INTO events
  (title, description, event_date, location, image_path, status, created_by)
VALUES
  ('Volunteer Orientation Day',
   'A privacy-safe orientation for interested volunteers, school groups, and partner organizations. Participants learn about respectful service, donation coordination, and foundation guidelines.',
   '2026-07-20 09:00:00', 'Foundation activity area', '/images/placeholders/event-1.jpg', 'Published', 1),
  ('Community Donation Drive',
   'A coordinated event for receiving pre-approved in-kind donations such as hygiene kits, cleaning supplies, and food support. Donors are encouraged to contact staff before participating.',
   '2026-08-12 10:00:00', 'Foundation receiving area', '/images/placeholders/donations-1.jpg', 'Published', 2);

INSERT INTO event_participations
  (event_id, full_name, email, phone_number, organization, message, status)
VALUES
  (1, 'Sample Volunteer', 'volunteer@example.com', '+63 900 333 4444', 'IT124P Class', 'We would like to join the orientation as part of our academic outreach planning.', 'Pending');

INSERT INTO site_videos
  (title, description, video_url, embed_url, display_order, status, created_by)
VALUES
  ('Foundation Introduction Video',
   'A sample CMS-managed YouTube link. Replace this with the foundation approved public video URL.',
   'https://www.youtube.com/watch?v=M7lc1UVf-VE',
   'https://www.youtube.com/embed/M7lc1UVf-VE',
   1, 'Published', 1);

INSERT INTO contact_messages
  (full_name, email, phone_number, subject, message, status)
VALUES
  ('Juan Dela Cruz', 'juan@example.com', '+63 912 345 6789', 'Volunteer inquiry', 'I would like to ask about volunteer opportunities for our class project.', 'Unread'),
  ('Maria Santos', 'maria@example.com', '+63 917 222 3333', 'Donation coordination', 'Please let me know the current in-kind donation needs of the foundation.', 'Read'),
  ('Ana Reyes', 'ana@example.com', NULL, 'Visit request', 'Our organization would like to schedule a respectful visit and coordinate first with staff.', 'Unread');

INSERT INTO activity_logs
  (admin_id, action, table_affected, record_id)
VALUES
  (1, 'Seeded sample database content', 'database', NULL);
