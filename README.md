# Inventory Management System

A modern **Inventory Management System** built as a **personal portfolio project**, focused on clean architecture, scalability, and explicit UI state control using a **controller-based layout system**.

This project demonstrates how a real-world internal admin system can be structured with clear separation between **UI, controllers, and domain logic**, making it suitable for long-term maintenance and team collaboration.

---

## 🎯 Project Goals

- Build a realistic **internal admin system**
- Showcase **architecture & decision-making**, not just features
- Design a **flexible UI layout system** similar to professional dashboards
- Serve as a strong **portfolio project** for frontend & full‑stack roles

---

## 👥 Target Users

- Internal company staff
- Admin users managing operational data

---

## 🧱 Tech Stack

### Frontend

- **React** – component-based UI
- **Vite** – fast dev server & build tooling
- **Controller-based UI architecture** (custom)

### Backend

- **Hono** – lightweight, modern web framework
- **RESTful API design**

### Database

- **PostgreSQL** – relational data storage

---

## 🧠 Architecture Overview

### 1. Controller-Based UI Architecture

Instead of relying purely on React local state or global stores, this project uses **explicit controllers** to manage complex UI behavior.

Each major UI element has its own controller, for example:

- `LayoutController`
- `TabController`
- `SidebarController`
- `DetailPaneController`

Controllers:

- Hold UI state
- Expose imperative actions (open, close, switch, reset)
- Are independent from rendering logic

This approach makes the UI:

- Predictable
- Easier to debug
- More scalable as features grow

---

### 2. Modular Layout System

The application layout is composed of dynamic panes:

- `leftPane`
- `rightPane`
- `topPane`
- `bottomPane`
- `content`

Each pane can host different components such as:

- Sidebars
- Tab bars
- Detail panels
- Pages

Layout behavior is fully driven by the **LayoutController**, allowing:

- Runtime layout changes
- User preferences (future feature)
- Reusable layout patterns across pages

---

### 3. Menu & Navigation Design

Navigation is driven by a **structured menu definition** stored as data.

Menu items support:

- Multiple display modes (`sliding`, `context`)
- Alignment grouping (`start`, `end`)
- Different action types (`route`, `command`, `group`)

This allows:

- One menu source of truth
- Easy permission-based filtering
- Consistent behavior across UI surfaces

---

### 4. Backend Design Decisions

- **Hono** is chosen for its simplicity and performance
- Clear separation between:
  - Routes
  - Services
  - Database access
- Authentication uses:
  - Access token (short-lived)
  - Refresh token (longer-lived)
- Designed to support:
  - Multi-role users
  - Role & permission management

---

## ✨ Key Features

### Inventory Management

- Product & stock management
- Category and metadata support

### User & Role Management

- CRUD users
- Multiple roles per user
- Permission-based access control

### Advanced UI System

- Tab-based navigation (browser-like)
- Dynamic sidebars
- Right-side detail panes
- Controller-driven UI state

### Admin-Friendly UX

- Page-based forms (mobile-friendly)
- Persistent state across tabs
- Predictable navigation behavior

---

## 🖼 Demo Screenshots

> Screenshots below illustrate the architecture-driven UI design

- Dashboard with dynamic sidebar
- Inventory list with right-side detail pane
- Tab-based navigation system
- User & role management pages

(Add screenshots or GIFs here)

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

## 📌 Design Trade-offs & Decisions

- **Controllers over global store**: clearer intent and easier debugging
- **Explicit layout panes** instead of implicit composition
- **Data-driven menu system** for future permission & customization support
- **Page-based forms** instead of modals for better mobile UX

---

## 🧪 Testing

(Planned)

---

## 🛣 Roadmap

- [ ] Audit log system
- [ ] User preferences (layout, theme, language)
- [ ] Multi-language support (i18n)
- [ ] Dashboard analytics widgets

---

## 📄 License

MIT License

---

## 🙌 Author

**Choirul Nurrohim**  
Personal Portfolio Project  
GitHub: https://github.com/cnurrohim
