# Memoir Clipper — Source Directory Overview

This document outlines the primary packages and folders within the `src` directory of Memoir Clipper. Use it as a reference to understand the structure, responsibilities, and entry points of each major component.

---

## Directory Structure & Responsibilities

- **background/**
    - Manages background scripts, extension lifecycle events, and context menu integration.
    - **Entry point:** `background/index.ts`

- **content/**
    - Contains content scripts injected into web pages.
    - Responsible for UI orchestration, user selection handling, toolbars, keyboard shortcuts, and DOM/content analysis utilities.
    - Selection IDs are now generated based on selection content and position for consistency.
    - Toolbar selection data is cached and restored for repeated selections within a short time frame.
    - Dropdown menus support keyboard navigation and focus management.
    - **Entry point:** `content/index.ts`

- **models/**
    - Defines TypeScript data models for text, images, links, pages, and extension messaging.
    - Facilitates structured data exchange and communication.
    - Models support unique ID generation and serialization.

- **popup/**
    - Implements the browser action popup interface and its logic.
    - **Entry points:** `popup/index.html`, `popup/index.ts`

- **options/**
    - Provides the extension’s options/settings page UI and logic.
    - **Entry points:** `options/index.html`, `options/index.ts`

- **styles/**
    - Contains Tailwind CSS files, dynamic style injectors, and isolated CSS for UI components (buttons, dropdowns, toolbars, toggles).
    - Style architecture now supports a universal variant type for consistent theming.

- **utils/**
    - Houses shared utilities, helpers, constants, enums, type definitions, and UI factories.
    - Style variant mapping is centralized for all UI components.
    - **Subfolders:**
        - `helpers/`: Utilities for DOM manipulation, favicon retrieval, logging, environment detection, and selection handling.
        - `values/`: Centralized constants, enums, identifiers, strings, HTML tags/attributes, and types.
        - `ui/`: Factories and base logic for UI elements such as dropdowns, toggles, and buttons, now supporting variants.

---

## Main Entry Points

- `background/index.ts` — Background service worker and context menu logic.
- `content/index.ts` — Content script initialization and UI orchestration.
- `popup/index.html`, `popup/index.ts` — Popup user interface.
- `options/index.html`, `options/index.ts` — Options/settings user interface.

---

For further details, refer to the project README or the inline documentation within each file.
