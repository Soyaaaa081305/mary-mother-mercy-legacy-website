# Suggested Project Report Content

## Title

Mary Mother of Mercy Home Legacy Website: A Dynamic Content Management and Storytelling Platform

## Project Description

This project is a dynamic CMS-based website for Mary Mother of Mercy Home For the Elderly And Abandoned Foundation. It allows the foundation to share its history, mission, services, values, community impact, caregiver reflections, gallery images, support information, and contact details.

## Problem Statement

Many small foundations need a presentable public website but do not have technical staff available to update content regularly. This system solves that problem by providing an admin CMS where authorized staff can manage website content without editing source code.

## Objectives

- Build a public legacy website for the foundation
- Provide an admin CMS for staff
- Implement CRUD functionality
- Store website content in MySQL
- Save contact form submissions
- Support image uploads
- Support online donation checkout through PayMongo
- Support event participation requests
- Support website video links through YouTube or Vimeo embeds
- Protect admin routes with login and roles
- Maintain activity logs
- Ensure privacy-safe storytelling

## Scope

In scope:

- public website
- admin CMS
- MySQL database
- CRUD modules
- image upload handling
- donation checkout records
- event participation forms
- website video links
- Google Maps footer/contact location
- session authentication
- role-based access
- activity logs
- contact form storage

Out of scope:

- online payment processing
- direct banking API integration outside PayMongo Hosted Checkout
- resident case management
- medical record handling
- scheduling system

## Database Design Summary

The database is normalized into tables for users, page content, legacy entries, caregiver stories, gallery categories, gallery images, support information, contact messages, and activity logs. Foreign keys connect content records to admin users where appropriate.

## Functional Requirements

- Visitors can view website pages
- Visitors can send contact messages
- Admins can log in and log out
- Admins can manage CMS content based on role
- Admins can upload and replace images
- Visitors can submit donation checkout requests
- Visitors can submit event participation requests
- Visitors can watch approved embedded website videos
- Admins can view messages
- Super Admin can manage users
- System records important admin actions

## Non-Functional Requirements

- Responsive layout
- Accessible color contrast
- Simple navigation
- Beginner-friendly local setup
- Respectful and privacy-safe content design
- Input validation
- Basic XSS and SQL injection protection

## Conclusion

The project provides a functional, presentable, and locally runnable academic CMS system. It demonstrates full-stack development, database integration, authentication, CRUD operations, upload handling, and responsible storytelling practices.
