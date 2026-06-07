# Testing Checklist

## Database

- [ ] `database/01_schema.sql` runs successfully
- [ ] `database/02_seed.sql` runs successfully
- [ ] All required tables exist
- [ ] Sample admin users exist
- [ ] Sample public content appears in the database

## Public Website

- [ ] Home page loads
- [ ] About page loads
- [ ] Legacy page lists published milestones
- [ ] Legacy detail page opens
- [ ] Caregiver stories page lists published stories
- [ ] Caregiver story detail page opens
- [ ] Gallery page shows image categories and images
- [ ] Support page shows support information
- [ ] Support page shows PayMongo donation form
- [ ] Events page lists published events
- [ ] Event detail page accepts participation request
- [ ] Videos page embeds a YouTube/Vimeo video
- [ ] Footer shows Google Maps embed or map link
- [ ] Contact page shows contact form
- [ ] Contact form saves a message in the database
- [ ] Website works on mobile width

## Authentication

- [ ] Admin login page loads
- [ ] Super Admin can log in
- [ ] Content Editor can log in
- [ ] Viewer can log in
- [ ] Wrong password is rejected
- [ ] Logout works
- [ ] Admin pages redirect to login when not authenticated
- [ ] Form submissions include CSRF token
- [ ] PayMongo webhook endpoint remains reachable without CSRF token

## Role-Based Access

- [ ] Super Admin can manage users
- [ ] Content Editor cannot manage users
- [ ] Viewer can only access dashboard and messages
- [ ] Viewer cannot edit CMS content

## CMS CRUD

- [ ] Page content can be edited
- [ ] Legacy entry can be created
- [ ] Legacy entry can be edited
- [ ] Legacy entry can be deleted
- [ ] Caregiver story can be created
- [ ] Caregiver story privacy warning is visible
- [ ] Caregiver story can be edited
- [ ] Caregiver story can be deleted
- [ ] Gallery category can be created
- [ ] Gallery image can be uploaded
- [ ] Gallery image can be edited
- [ ] Gallery image can be deleted
- [ ] Support information can be updated
- [ ] Footer address and map query can be updated
- [ ] Donation records can be viewed
- [ ] Donation status can be updated
- [ ] Event can be created
- [ ] Event participation request can be reviewed
- [ ] Website video link can be created
- [ ] Contact messages can be marked read/unread
- [ ] Contact messages can be deleted
- [ ] Admin user can be created
- [ ] Admin user can be edited
- [ ] Admin user can be deactivated

## Upload Security

- [ ] JPG image upload works
- [ ] PNG image upload works
- [ ] Non-image upload is rejected
- [ ] Oversized image upload is rejected

## Activity Logs

- [ ] Login action is logged
- [ ] Page update is logged
- [ ] Legacy create/update/delete is logged
- [ ] Story create/update/delete is logged
- [ ] Gallery changes are logged
- [ ] User changes are logged
