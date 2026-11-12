# Project Plan — 10X Shop SPA

## 1. Project Scope

The goal of this project is to build a high-performance, responsive Single Page Application (SPA) e-commerce store using React, TypeScript, Tailwind CSS, and DummyJSON API.

### Core Objectives:

- Implement URL-backed catalog navigation (`useSearchParams`) for pagination and category filtering.
- Interactive product cards with AliExpress-style mouse-move image carousels.
- Shopping cart persistent state management using `localStorage`.
- Form validation-backed checkout process.
- Authentication simulation and route guards (`ProtectedRoute`).
- User profile & order history tracking with live order status simulation and customer review capabilities.
- Local stock overrides to reflect real-time inventory updates upon checkout.

## 2. Weekly Stages & Timeline

### Stage 1: Setup & Architecture

- Initialize React + Vite project with TypeScript and Tailwind CSS v4.
- Setup React Router DOM structure and basic Layout wrapper.
- Configure isolated utility helpers (`src/utils/format.ts`) for currency and discount calculations.

### Stage 2: Catalog & API Integration

- Implement DummyJSON API fetching for products and categories.
- Integrate URL search parameters for catalog state retention (page, category).
- Develop `ProductCard` with hover-driven image switching and stock status indicators.

### Stage 3: Cart, Checkout & Auth

- Build global `CartContext` with local storage persistence and stock availability limits.
- Create `/cart` and `/checkout` views with input validation (name/email, address, ZIP code).
- Build `AuthContext` and `/login` route with strict validation rules.

### Stage 4: User Profile, Orders & Refinement

- Implement `/orders` page for tracking order lifecycles (Processing -> Shipped -> Delivered).
- Enable customer review submissions for delivered items with real-time update in product details.
- Implement demo data reset utility ("Reset Demo Data").
- Ensure `verbatimModuleSyntax` strict TypeScript compliance and clean build.

## 3. Definition of Done (DoD)

- Zero TypeScript errors (`npm run typecheck` passes cleanly).
- Fully responsive across desktop, tablet, and mobile breakpoints.
- Persistent local state (Cart, Orders, Stock overrides, Reviews, Auth).
- Proper back-navigation (`navigate(-1)`) retaining search/pagination params.
