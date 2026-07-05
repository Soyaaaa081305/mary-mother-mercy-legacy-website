USE mary_mother_cms;

DELETE FROM event_participations;
DELETE FROM events;
DELETE FROM site_videos;
DELETE FROM gallery_images;
DELETE FROM gallery_categories;
DELETE FROM caregiver_stories;
DELETE FROM legacy_entries;
DELETE FROM contact_team_members;
DELETE FROM donation_records;
DELETE FROM contact_messages;
DELETE FROM support_information;

INSERT INTO pages
  (page_name, page_slug, hero_eyebrow, title, hero_summary, hero_image_path, content, status)
VALUES
  ('Home Page', 'home', 'A home of mercy in San Pedro', 'Mary Mother of Mercy Home For the Elderly And Abandoned Foundation',
   'A warm home in San Antonio, San Pedro, Laguna where elderly women are welcomed with daily care, prayer, food, shelter, and companionship.',
   '/images/mary-mother/home-hero-facebook.jpg',
   'Mary Mother of Mercy Home For the Elderly And Abandoned Foundation is a home of care in San Pedro, Laguna. The foundation serves elderly women who have been abandoned, forgotten, or left without steady family support. Its work is carried by the Sisters of St. Francis Xavier together with staff, caregivers, volunteers, neighbors, donors, and visitors who help keep the home peaceful and cared for.\n\nThe home is known for a simple rhythm of mercy: meals, prayer, light activity, laundry, health support, rest, and companionship. Visitors and donors are encouraged to coordinate before coming so every act of support is helpful, respectful, and aligned with current needs.',
   'Published'),
  ('About Page', 'about', 'About the foundation', 'A Haven of Love, Prayer, and Daily Care',
   'Learn about the home, the sisters and staff who serve, and the values that guide its care for abandoned elderly women.',
   '/images/mary-mother/about-facility.jpg',
   'Mary Mother of Mercy Home For the Elderly And Abandoned Foundation is located along Magsaysay Road in Barangay San Antonio, San Pedro, Laguna. The home was founded through the generosity of Dr. Mercedes Maravilla Oliver, who helped establish the compound, chapel, and museum area. Since 2002, the Sisters of St. Francis Xavier have carried forward the mission of caring for abandoned elderly women regardless of religious affiliation.\n\nCare at the home is practical and personal. The sisters and staff prepare meals, help with daily routines, coordinate health needs, encourage prayer and light movement, welcome responsible volunteers, and receive in-kind support when supplies are needed. The site presents the foundation with dignity and privacy, focusing on mission, staff, facilities, and ways to help.',
   'Published'),
  ('Legacy Page', 'legacy', '25 years of compassion and caring', 'Our Legacy of Mercy and Service',
   'From its founding roots to the daily work of the Sisters of St. Francis Xavier, the home continues as a place of shelter, prayer, and family-like care.',
   '/images/mary-mother/anniversary-cover.jpg',
   'The legacy of Mary Mother of Mercy Home is a living story of compassion. It began with a generous vision for elderly people who had nowhere steady to go, then grew through the service of the Sisters of St. Francis Xavier, caregivers, nurses, staff, benefactors, and nearby community helpers.\n\nIts legacy is not only found in buildings or plaques. It is found in meals prepared, clothes washed, medicines coordinated, prayers offered, smiles shared during visits, and supplies quietly delivered when the home needs help.',
   'Published'),
  ('Support Page', 'support', 'Support the lolas with care', 'Support the Foundation',
   'Coordinate donations, visits, volunteer service, and in-kind support through the official foundation channels.',
   '/images/mary-mother/mary-garden.jpg',
   'The foundation welcomes coordinated support from families, schools, churches, civic groups, companies, and individual benefactors. Please contact the foundation before sending supplies or planning a visit so staff can confirm current needs and prepare respectfully.',
   'Published'),
  ('Contact Page', 'contact', 'Official contacts and team', 'Contact Mary Mother of Mercy Home',
   'Use the official email, phone numbers, Facebook page, and location details to coordinate visits, donations, and volunteer help.',
   '/images/mary-mother/front-sign.jpg',
   'Mary Mother of Mercy Home welcomes respectful inquiries for visits, donations, volunteer coordination, and partnerships. Messages sent through the website are saved in the CMS for authorized staff review.',
   'Published'),
  ('Stories Page', 'stories', 'Care team reflections', 'Stories from the Staff Who Serve',
   'Privacy-safe reflections about daily service, teamwork, prayer, and the small acts that make the home feel cared for.',
   '/images/mary-mother/team-visit.jpg',
   'Stories on this website focus on staff service and community support. They avoid private resident names, medical details, trauma, or identifying information.',
   'Published'),
  ('Gallery Page', 'gallery', 'Photo gallery', 'A Home, a Chapel, a Garden, and a Community',
   'Approved photos from the home, signage, chapel, garden, organizational chart, and anniversary material.',
   '/images/mary-mother/street-billboard.jpg',
   'The gallery shares safe public-facing images of the foundation environment, official signage, team visits, and legacy materials.',
   'Published'),
  ('Videos Page', 'videos', 'Foundation videos', 'Watch Foundation Media',
   'Approved public videos and outreach media connected to Mary Mother of Mercy Home.',
   '/images/mary-mother/chapel-spread.jpg',
   'Videos are managed as public links in the CMS.',
   'Published'),
  ('Events Page', 'events', 'Visits, outreach, and coordination', 'Join Coordinated Foundation Activities',
   'Volunteer orientations, donation coordination, and community activities published by the foundation.',
   '/images/mary-mother/office-visit.jpg',
   'Submit participation requests for coordinated visits, donation drives, and volunteer service activities.',
   'Published')
ON DUPLICATE KEY UPDATE
  page_name = VALUES(page_name),
  hero_eyebrow = VALUES(hero_eyebrow),
  title = VALUES(title),
  hero_summary = VALUES(hero_summary),
  hero_image_path = VALUES(hero_image_path),
  content = VALUES(content),
  status = VALUES(status);

INSERT INTO legacy_entries
  (title, content, milestone_date, image_path, display_order, status, created_by)
VALUES
  ('Founding Roots of Mercy',
   'The home grew from the generosity of Dr. Mercedes Maravilla Oliver, whose vision helped create a place where abandoned elderly women could receive shelter, prayer, and practical care in San Pedro, Laguna.',
   '1997-01-01', '/images/mary-mother/facility-spread.jpg', 1, 'Published', 1),
  ('Sisters of St. Francis Xavier Continue the Mission',
   'Public accounts describe the Sisters of St. Francis Xavier taking up the work in 2002 and continuing the care of elderly women through prayer, meals, health coordination, and daily household service.',
   '2002-01-01', '/images/mary-mother/chapel-spread.jpg', 2, 'Published', 1),
  ('Community Help Keeps the Home Steady',
   'Neighbors, volunteers, students, donors, churches, and civic groups help the foundation through food, adult care supplies, visits, and other coordinated support. The home depends on this generous circle of care.',
   '2015-01-01', '/images/mary-mother/street-billboard.jpg', 3, 'Published', 1),
  ('25 Years of Compassion and Caring',
   'The anniversary material celebrates a long-running mission of compassion and care. It honors the sisters, staff, benefactors, and supporters who have helped make the home feel like family.',
   '2022-01-01', '/images/mary-mother/anniversary-cover.jpg', 4, 'Published', 1),
  ('A Living Legacy Today',
   'Today the foundation continues to welcome responsible support, coordinate visits with care, and protect the dignity and privacy of the elderly women it serves.',
   '2026-07-04', '/images/mary-mother/home-hero.jpg', 5, 'Published', 1);

INSERT INTO caregiver_stories
  (title, author_name, author_role, content, featured_image_path, status, created_by, published_at)
VALUES
  ('Daily Care Begins with Small Faithful Acts',
   'Mary Mother Care Team', 'Care Team',
   'The work of the home is built from small acts repeated with patience: preparing food, checking supplies, helping with laundry, keeping rooms clean, listening gently, and making sure each day has time for prayer and rest. These ordinary routines are where mercy becomes visible.',
   '/images/mary-mother/office-visit.jpg', 'Published', 1, '2026-07-04 09:00:00'),
  ('A Home Supported by Many Hands',
   'Foundation Office', 'Community Coordination',
   'The sisters and staff do not serve alone. Families, students, church groups, civic partners, neighbors, and donors help through visits, supplies, and encouragement. Coordinated support allows the home to receive help in a way that is useful and respectful.',
   '/images/mary-mother/team-visit.jpg', 'Published', 1, '2026-07-04 09:30:00'),
  ('Prayer, Meals, and Companionship',
   'Sisters of St. Francis Xavier', 'Religious Community',
   'Public stories about the home describe a rhythm of breakfast, prayer, light movement, meals, laundry, and afternoon devotion. The details are simple, but together they create a daily environment of steadiness and care.',
   '/images/mary-mother/mary-garden.jpg', 'Published', 1, '2026-07-04 10:00:00');

INSERT INTO gallery_categories
  (category_name, description)
VALUES
  ('Home and Facilities', 'Public-facing views of the home, chapel, garden, and building spaces.'),
  ('Legacy Materials', 'Anniversary, magazine, and historical materials from the foundation.'),
  ('Organization', 'Organizational chart and team structure references.'),
  ('Visits and Community', 'Coordinated visits, volunteer moments, and community support.'),
  ('Official Signage', 'Street signs and official foundation identifiers.'),
  ('Prayer and Garden', 'Quiet spiritual spaces within the foundation compound.'),
  ('Facebook Updates', 'Selected public photos from the foundation Facebook page.');

INSERT INTO gallery_images
  (category_id, title, caption, image_path, alt_text, uploaded_by, status)
VALUES
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Home and Facilities'), 'Foundation Building', 'A public view of the Mary Mother of Mercy Home compound in San Pedro, Laguna.', '/images/mary-mother/home-hero.jpg', 'Mary Mother of Mercy Home building exterior', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Home and Facilities'), 'Chapel and Courtyard Area', 'The compound includes prayer spaces and a peaceful courtyard environment.', '/images/mary-mother/about-facility.jpg', 'Chapel and courtyard inside the home compound', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Official Signage'), 'Front Wall Signage', 'Official Mary Mother of Mercy Home signage at the entrance area.', '/images/mary-mother/front-sign.jpg', 'Front wall sign for Mary Mother of Mercy Home', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Official Signage'), 'Street Billboard', 'Public billboard showing the foundation name and contact details.', '/images/mary-mother/street-billboard.jpg', 'Street billboard for the foundation', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Prayer and Garden'), 'Mary Garden', 'A quiet garden image reflecting the foundation''s prayerful identity.', '/images/mary-mother/mary-garden.jpg', 'Mary statue in the garden', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Prayer and Garden'), 'Garden View', 'Greenery and devotional space inside the foundation grounds.', '/images/mary-mother/garden-wide.jpg', 'Wide garden view with Mary statue', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Legacy Materials'), '25 Years of Compassion and Caring', 'Anniversary cover material celebrating the foundation''s long mission.', '/images/mary-mother/anniversary-cover.jpg', '25 years of compassion and caring magazine cover', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Legacy Materials'), 'Home Facilities Magazine Spread', 'Magazine material describing facilities and spaces within the home.', '/images/mary-mother/facility-spread.jpg', 'Magazine spread showing the home facilities', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Legacy Materials'), 'Chapel Magazine Spread', 'A legacy spread showing the chapel and prayer spaces.', '/images/mary-mother/chapel-spread.jpg', 'Magazine spread showing chapel facilities', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Organization'), 'Organizational Chart', 'The foundation organizational chart photographed from the office display.', '/images/mary-mother/org-chart.jpg', 'Organizational chart of Mary Mother of Mercy Home', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Visits and Community'), 'Office Visit', 'A coordinated visit and discussion inside the office area.', '/images/mary-mother/office-visit.jpg', 'Visitors and staff inside the foundation office', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Visits and Community'), 'Team Visit', 'A team visit photo from the foundation office.', '/images/mary-mother/team-visit.jpg', 'Small team photo inside the foundation office', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Facebook Updates'), 'Courtyard from Facebook', 'A public Facebook photo showing the home courtyard and chapel frontage.', '/images/mary-mother/facebook/facility-courtyard.jpg', 'Courtyard and chapel frontage from the foundation Facebook page', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Facebook Updates'), 'Community Group Visit', 'A public Facebook photo of a coordinated community group visit.', '/images/mary-mother/facebook/community-group.jpg', 'Community group visit at Mary Mother of Mercy Home', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Facebook Updates'), 'Donation Visit', 'A public Facebook photo from a donation and support visit.', '/images/mary-mother/facebook/donation-visit.jpg', 'Donation visit photo from the foundation Facebook page', 1, 'Published'),
  ((SELECT category_id FROM gallery_categories WHERE category_name = 'Facebook Updates'), 'Handcraft Activity', 'A public Facebook photo showing a quiet handcraft activity moment.', '/images/mary-mother/facebook/handcraft-activity.jpg', 'Handcraft activity at the home', 1, 'Published');

INSERT INTO support_information
  (title, content, bank_details, in_kind_donations, contact_person, contact_number, telephone_number, gmail_address, foundation_address, foundation_email, facebook_url, youtube_url, google_maps_query, updated_by)
VALUES
  ('Ways to Support Mary Mother of Mercy Home',
   'The foundation welcomes help that is coordinated, respectful, and matched to current needs. Please contact the office before sending cash, goods, food, medicines, or arranging a visit. This helps staff receive support properly and protect the dignity and routine of the residents.',
   'For verified bank, GCash, or financial donation channels, please contact the foundation directly before sending money.\n\nOfficial email: marymother1@gmail.com\nTelephone: 8869-15-29\nMobile: 0927-688-5876',
   'Commonly useful in-kind support may include rice, coffee, food supplies, adult diapers, hygiene items, cleaning materials, linens, towels, clothing in good condition, vitamins or medicines coordinated through staff, and facility maintenance supplies. Please confirm current needs before delivery.',
   'Foundation Office', '0927-688-5876', '8869-15-29', 'marymother1@gmail.com',
   '48R Magsaysay Rd., San Antonio, San Pedro, Laguna, Philippines',
   'marymother1@gmail.com',
   'https://www.facebook.com/profile.php?id=61567675165302',
   'https://www.youtube.com/watch?v=Nnnm68SLI4A',
   'Mary Mother of Mercy Home For the Elderly And Abandoned Foundation 48R Magsaysay Rd San Antonio San Pedro Laguna',
   1);

INSERT INTO contact_team_members
  (display_name, role_title, email, phone_number, profile_image_path, display_order, status, created_by)
VALUES
  ('Foundation Office', 'Official Inquiries, Visits, and Donations', 'marymother1@gmail.com', '0927-688-5876', '/images/mary-mother/office-visit.jpg', 1, 'Published', 1),
  ('Ferdinand C. Gerodias, M.D.', 'Executive Director', NULL, NULL, '/images/mary-mother/team-ferdinand-gerodias.jpg', 2, 'Published', 1),
  ('Sr. Venus Marie S. Pegar, sfx, RSW', 'Case Manager / Center Head', NULL, NULL, '/images/mary-mother/team-sr-venus-pegar.jpg', 3, 'Published', 1),
  ('Sr. Mary Grace, sfx', 'Nutrition and Health Coordinator', NULL, NULL, '/images/mary-mother/team-sr-mary-grace.jpg', 4, 'Published', 1),
  ('Sr. Roselyn, sfx', 'Supervising Caregiver', NULL, NULL, '/images/mary-mother/team-sr-roselyn.jpg', 5, 'Published', 1),
  ('Sr. Jay Ann De La Cruz, sfx', 'Maintenance Coordinator', NULL, NULL, '/images/mary-mother/team-sr-jay-ann-de-la-cruz.jpg', 6, 'Published', 1),
  ('Karen Rose Llona', 'Registered Nurse', NULL, NULL, '/images/mary-mother/team-karen-llona.jpg', 7, 'Published', 1),
  ('Nasrifah M. Cabugatan, RSW', 'Case Manager - 1', NULL, NULL, '/images/mary-mother/team-nasrifah-cabugatan.jpg', 8, 'Published', 1),
  ('Caregiver and Support Team', 'Caregivers, OJT Volunteers, and Support Staff', 'marymother1@gmail.com', '8869-15-29', '/images/mary-mother/team-visit.jpg', 9, 'Published', 1);

INSERT INTO events
  (title, description, event_date, location, image_path, status, created_by)
VALUES
  ('Coordinated Visit and Donation Drop-Off',
   'A scheduled visit window for donors, families, students, and partner groups who have coordinated with the foundation office before arriving. Please confirm current needs and visitor guidelines first.',
   '2026-07-20 09:00:00', 'Mary Mother of Mercy Home, San Pedro, Laguna', '/images/mary-mother/front-sign.jpg', 'Published', 1),
  ('Volunteer and OJT Orientation',
   'An orientation for volunteers and student groups about respectful service, privacy, donation handling, and how to help without disrupting daily care routines.',
   '2026-08-10 09:00:00', 'Foundation office and activity area', '/images/mary-mother/office-visit.jpg', 'Published', 1),
  ('In-Kind Support Coordination Day',
   'A coordination day for rice, coffee, adult diapers, hygiene items, cleaning supplies, linens, and other confirmed needs. Please contact staff before bringing supplies.',
   '2026-09-05 10:00:00', 'Foundation receiving area', '/images/mary-mother/street-billboard.jpg', 'Published', 1);

INSERT INTO site_videos
  (title, description, video_url, embed_url, display_order, status, created_by)
VALUES
  ('Mary Mother of Mercy Home for the Elderly and Abandoned',
   'A public video feature connected to the foundation and its mission in Laguna.',
   'https://www.youtube.com/watch?v=Nnnm68SLI4A',
   'https://www.youtube.com/embed/Nnnm68SLI4A',
   1, 'Published', 1);

INSERT INTO contact_messages
  (full_name, email, phone_number, subject, message, status)
VALUES
  ('Sample Website Visitor', 'visitor@example.com', '0917 000 0000', 'Visit coordination', 'We would like to coordinate a respectful visit and confirm the current needs of the foundation.', 'Unread');
