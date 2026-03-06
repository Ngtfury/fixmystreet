# FixMyStreet
A modern, full-stack civic issue reporting platform engineered to streamline communication between citizens and local municipal authorities. Built with Next.js 16 and a mock JSON-based persistence layer for rapid prototyping.

## Overview
FixMyStreet solves the disjointed communication gap in urban infrastructure management. The application features distinct, secure portals:
- **Citizen Portal**: Allows residents to report issues with pinpoint geographical coordinates, upload multi-media evidence, and track issue resolution status.
- **Authority Portal**: Provides a centralized "Operations Control" dashboard for municipal workers to filter issues by district, verify citizen reports, and permanently attach proof-of-resolution media.

## Architecture Highlights
- **Role-Based Architecture**: Strictly segregates access and data views based on `citizen` and `authority` roles via Next.js middleware and API routing enforcement.
- **Evidentiary Media Support**: Robust multipart form-handling allows users to upload multiple high-resolution assets (images/videos) alongside reports, and provides authorities with full-screen media overlays for detailed inspection.
- **Mandatory Accountability**: Implements a zero-trust update model; authorities cannot flag an issue as "In Progress" or "Resolved" without appending verified photographic proof of action.
- **Mock Persistence Layer**: For high-velocity prototyping, the application leverages `lib/db.js` to synchronously serialize and deserialize JSON payloads to a single `data.json` repository, allowing for dynamic CRUD operations without a heavy external database dependency.
- **Responsive UI/UX**: Built entirely on Tailwind CSS v4, featuring a semantic class structure and modern glassmorphism design principles.

## Tech Stack
- **Framework**: Next.js 16.1 (App Router)
- **Frontend**: React 19, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend**: Next.js Serverless API Routes
- **Persistence**: File-system based JSON store (`data.json`)
- **Package Manager**: pnpm

## Development Setup

1. **Clone the repository and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm run dev
   ```

3. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

## File Structure
- `src/app/`: Next.js App Router containing all UI routes and pages.
  - `/api/`: Backend API routes for authentication, content creation, and database management.
  - `/authority/` & `/citizen/`: The primary partitioned dashboard routes.
- `src/components/`: Reusable React components (e.g., `Navbar.jsx`).
- `src/lib/`: Core utility functions, notably the JSON database bridge.
- `public/uploads/`: Local directory serving the uploaded multi-media report files.

## Workflows
- **Citizen Journey**: Register -> Log In -> Report Issue (Attach Location & Media) -> Dashboard (Track Progress & Provide Resolve Feedback).
- **Authority Journey**: Authority Log In -> Operations Dashboard -> Filter Complaints -> View Citizen Evidence -> Update Status (Attach Proof Media).

## Maintenance & Testing
A dedicated flush endpoint exists (`DELETE /api/database`) to systematically wipe all `complaints` arrays while preserving registered `users` profiles, ideal for safely testing rapid production cycles and resetting the testing environments.
