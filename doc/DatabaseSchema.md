# Database Schema

## Overview

Database of store application data.

---

### 1. Users

- userId (ObjectId)

- name (String)

- email (String)

- password (String)

- role (String)

- phone (String)

- createdTime (Date)

---

### 2. MenuItems

- menuItemId (ObjectId)

- name (String)

- description (String)

- price (Number)

- category (String)

- image (String)

- vendorId (ObjectId)

- available (Boolean)

---

### 3. Orders

- orderId (ObjectId)

- userId (ObjectId)

- items (Array)

- totalPrice (Number)

- status (String)

- createdTime (Date)

---

### 4. CateringPackages

- packageId (ObjectId)

- name (String)

- description (String)

- price (Number)

- items (Array of ObjectId)

- vendorId (ObjectId)

---

### 5. Vendors

- vendorId (ObjectId)

- name (String)

- contactEmail (String)

- phone (String)

- address (String)

---

### 6. Feedback

- feedbackId (ObjectId)

- userId (ObjectId)

- orderId (ObjectId)

- rating (Number)

- comment (String)

- createdTime (Date)

---

