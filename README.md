# Inventory Management System

An **Inventory Management System** built as a **personal portfolio project** for learning and practice. This project focuses on building a realistic internal admin application with a clean structure, clear responsibilities, and a UI that is easy to understand and extend.

The main goal of this project is learning. I wanted to understand how an internal admin system can grow without becoming messy, so I focused on keeping the UI and application logic simple, clear, and easy to maintain.

---

## 🎯 Project Goals

- Build a realistic internal admin system for everyday operational needs
- Design a flexible and reusable UI layout that can adapt as the app grows
- Practice writing clean, readable code that is easy to understand and maintain
- Serve as a personal portfolio project for frontend and full-stack roles

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

- **Hono** – lightweight, modern web framework
- REST API

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
- Permission-based access control

### UI System

- Tab-based navigation (browser-like)
- Dynamic sidebar
- Dynamic dashboard content
- Predefined themes
- Easy navigation with pinned menus
- Changeable default page

---

## 🖼 UI & Architecture Demos

> The following GIFs showcase key UI behaviors and interactions in the application.  
> Each demo focuses on one feature to keep the behavior clear and easy to understand.

### Dynamic Layout Preferences

Demonstrates how users can rearrange core UI regions (sidebar, tab bar, content panes) at runtime.

<img src="docs/gifs/layout_preferences.gif" alt="Dynamic layout" width="920">

### Pinned Menu for Fast Navigation

Shows a persistent, pinnable menu that remains accessible across views. Menu behavior is data-driven and permission-aware, ensuring consistent navigation for admin workflows.

<img src="docs/gifs/pinnedmenu.gif" alt="Pinned menu" width="920">

---

### Swappable New Tab Component

A browser-like tab system with a flexible New Tab concept.  
The New Tab content is replaceable by design and can be switched from the Preferences page.

<img src="docs/gifs/newtab.gif" alt="Swappable new tab" width="920">

---

### Dynamic Dashboard

A dashboard composed of modular widgets. This shows how dashboard content can change without affecting the overall layout, keeping the navigation and surrounding UI stable.

<img src="docs/gifs/dashboard.gif" alt="Dynamic dashboard" width="920">

---

### Multi-Role User with Role Switching

Shows a user with multiple roles switching their active role at runtime. The UI reacts immediately by recalculating permissions and available navigation entries.

<img src="docs/gifs/switchrole.gif" alt="Switch role" width="920">

---

### Predefined Themes

Shows how users can switch between predefined themes to change the look of the application. This feature is meant to keep the interface comfortable to use and easy to adjust in the future.

<img src="docs/gifs/theme.gif" alt="Themes" width="920">

---

### Role-Based Permission Management

Shows how permissions are defined per role and reflected across the UI (menus, pages, actions). This reinforces the data-driven approach to access control.

<img src="docs/gifs/permissions.gif" alt="Role permissions" width="920">

---

### User-Specific Permission Overrides

Illustrates fine-grained permission overrides for individual users on top of role-based permissions, enabling flexible real-world access control scenarios.

<img src="docs/gifs/override_permission.gif" alt="Override permissions" width="920">

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL
- PNPM / NPM / Yarn

### Installation

```bash
git clone https://github.com/yourusername/inventory-system.git
cd inventory-system
npm install
```

### Environment Setup

Create a `.env` file based on `.env.example`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret
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
