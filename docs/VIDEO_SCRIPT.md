# Suggested 3-Minute Video Presentation Script

## 0:00-0:25 Introduction

Good day. Our IT124P project is titled **Mary Mother of Mercy Home Legacy Website: A Dynamic Content Management and Storytelling Platform**. The system is designed for Mary Mother of Mercy Home For the Elderly And Abandoned Foundation. It provides a public website and an admin CMS so staff can manage website content without editing code.

## 0:25-0:55 Public Website

On the public website, visitors can view the home page, about page, foundation legacy page, nurses and caregivers stories, gallery, support information, and contact page. The storytelling approach is privacy-safe. It focuses on the foundation legacy and staff reflections, not private resident details.

## 0:55-1:35 Admin Login and Dashboard

The admin module starts with a secure login page. Passwords are stored as salted hashes. After login, the dashboard shows totals for legacy posts, caregiver stories, gallery images, contact messages, published content, and recent updates.

## 1:35-2:15 CMS Features

The CMS allows authorized staff to edit public pages, manage legacy entries, create caregiver stories, upload gallery images, create events, review participation requests, add YouTube video links, update support information, and view contact messages. Caregiver story forms include a reminder not to include real resident names, health details, personal trauma, or identifiable information.

## 2:15-2:40 Donations, Database, and Security

The system includes PayMongo Hosted Checkout for online donation redirection, Google Maps Embed API support for the footer location map, and YouTube video embedding for approved media. The normalized MySQL database stores admin users, pages, legacy entries, caregiver stories, gallery records, donation records, events, participation requests, videos, contact messages, and activity logs. SQL injection protection is handled through parameterized queries, and admin access is protected by sessions and role-based permissions.

## 2:40-3:00 Closing

This project demonstrates database implementation, CRUD operations, login and logout, role-based CMS management, image upload handling, contact form storage, and activity logging. It is ready for a local academic demonstration using VS Code and MySQL.
