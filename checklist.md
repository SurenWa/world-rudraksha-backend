# Project Checklist for World Rudraksha Online Store (Backend)

This checklist tracks the implementation status of backend features based on the project requirements.

## 1. Core Backend Development

*   [x] Node.js backend (NestJS)
*   [x] Integrated CMS (Backend modules for categories, products, etc.)
*   [ ] Custom functionality implementation (as per requirements - specific features not yet identified)

## 2. Backend Features

### A. User Features (Backend)

*   [x] Signup/Login API
    *   [x] Name handling
    *   [x] Email handling
    *   [x] Password handling
    *   [ ] OTP verification API
    *   [x] Forgot password API
    *   [ ] Social login API integration
*   [ ] User Profile API
    *   [ ] View/edit profile API
    *   [ ] Change password API
    *   [ ] My Orders API (requires order module)
    *   [ ] Wishlist management API (requires wishlist module)

### B. Admin Panel Features (Backend)

*   [x] Admin Login API (Email & password)
*   [ ] Admin Dashboard Data APIs
    *   [ ] Latest orders data
    *   [ ] Total products count API
    *   [ ] Total users count API
    *   [ ] Total sales data
*   [x] Product Management API
    *   [x] Category management API (via Categories module)
    *   [x] Add/edit products API
    *   [ ] Hide/show products API
*   [ ] Order Management API
    *   [ ] Notifications API
    *   [ ] View orders API
    *   [ ] Order history API
*   [x] User Management API
    *   [x] List users API
    *   [ ] Block/Unblock users API
    *   [ ] View user details API
*   [ ] Content Management API
    *   [ ] Banners API
    *   [ ] FAQ API
    *   [ ] Privacy Policy API
    *   [ ] T&C API
    *   [ ] Return Policy API
*   [ ] Admin Management API
    *   [ ] Create/Block/Unblock sub-admins API

## 3. Additional Backend Features

*   [ ] Advanced search API
*   [x] Two-level categories (Categories and Subcategories modules implemented)
*   [x] Unlimited products (listing, filters, detailed page - backend support for data)
*   [ ] International payment integration API