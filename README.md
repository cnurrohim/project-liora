# Inventory Management System

This is a personal project focused on building a modular internal admin application using React, Node.js, and PostgreSQL.

I started this project based on some of the problems and requirements I encountered in previous projects, such as:

- Some users need to have multiple roles
- Permissions may need to be added or removed for a specific user or role
- Users may need a simpler interface for specific use cases, such as data entry, without being cluttered with unnecessary elements
- Users may want to customize the information shown on their dashboard instead of always following the default layout defined by their role

Through this project, I wanted to learn how an admin system can grow as more features are added without making the UI and application logic difficult to manage. Rather than trying to build a large system, I focused on keeping the structure simple, reusable, and easy to change.

---

## 🎯 Project Goals

- Build an internal basic inventory admin application
- Design a flexible and reusable UI layout that can adapt as the app grows
- Practice writing clean, readable code that is easy to understand and maintain

---

## 👥 Target Users

- Internal company staff
- Admin users managing operational data

---

## 🧱 Tech Stack

### Frontend

- **React** – component-based UI
- **Vite** – fast dev server & build tooling

### Backend

- **Hono** – web framework for the REST API
- REST API – communication between frontend and backend

### Database

- **PostgreSQL** – relational database

---

## ✨ Key Features

### Inventory Management

- Inventory item management (CRUD)
- Track basic inventory information
- Support item details such as SKU, unit, and notes

### User & Role Management

- CRUD users
- Multiple roles per user
- Role-based permission management
- User-specific permission overrides
- Role switching for users with multiple roles

### UI System

- Tab-based navigation (browser-like)
- Dynamic sidebar
- Dynamic dashboard content
- Predefined themes
- Easy navigation with pinned menus
- Changeable default page

---

## 🖼 UI & Architecture Demos

> The following demos show some of the UI and permission-related features implemented in the application.

### Dynamic Layout Preferences

Users can change the arrangement of the main UI areas, such as the sidebar, tab bar, and content panes.

<img src="docs/gifs/layout_preferences.gif" alt="Dynamic layout" width="920">

### Pinned Menu for Fast Navigation

Menus can be pinned so frequently used pages remain easy to access. The available menus are generated from the application's menu configuration and current user permissions.

<img src="docs/gifs/pinnedmenu.gif" alt="Pinned menu" width="920">

---

### Swappable New Tab Component

The New Tab page is treated as a replaceable part of the application. Users can change which page is opened as the default New Tab from Preferences.

<img src="docs/gifs/newtab.gif" alt="Swappable new tab" width="920">

---

### Dynamic Dashboard

The dashboard uses modular widgets that can be added or rearranged without changing the surrounding application layout.

<img src="docs/gifs/dashboard.gif" alt="Dynamic dashboard" width="920">

---

### Multi-Role User with Role Switching

A user can have multiple roles and switch between them at runtime. The active role determines the permissions and navigation available to the user.

<img src="docs/gifs/switchrole.gif" alt="Switch role" width="920">

---

### Predefined Themes

Users can switch between predefined themes from the Preferences page.

<img src="docs/gifs/theme.gif" alt="Themes" width="920">

---

### Role-Based Permission Management

Permissions are assigned to roles and are reflected throughout the UI, including menus, pages, and available actions.

<img src="docs/gifs/permissions.gif" alt="Role permissions" width="920">

---

### User-Specific Permission Overrides

Individual users can have permission overrides on top of their role permissions.
This allows access to be adjusted for specific users without creating another role.

<img src="docs/gifs/override_permission.gif" alt="Override permissions" width="920">

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL
- PNPM / NPM / Yarn

### Installation

```bash
git clone https://github.com/cnurrohim/project-liora.git
cd project-liora
npm install
```

## Environment Setup

Create a `.env` file based on `.env.example`

### Frontend

```env
VITE_API_BASE_URL=http://123.456.78.90:1234
VITE_API_DEMO_MODE=true
```

### Backend

```env
DATABASE_URL=postgresql://user:user@localhost:5432/db_name
REDIS_URL=redis://127.0.0.1:1234
JWT_SECRET=secrets
JWT_REFRESH_SECRET=refresh-secrets
CORS_ORIGIN=http://127.0.0.1:1234
NODE_ENV=production
PORT=1234
DEMO_MODE=true
```

### Run Development Server

```bash
npm run dev
```

---

## 📄 License

MIT License — free to use, modify, and learn from.

---

## 🙌 Author

**Choirul Nurrohim**  
Personal Portfolio Project built for learning and practice
GitHub: https://github.com/cnurrohim
