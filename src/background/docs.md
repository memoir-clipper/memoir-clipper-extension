# Background Package Overview

This document describes the purpose and structure of the `background/` package in Memoir Clipper.

---

## Purpose

The `background/` package contains the background service worker and related logic for the extension. It is responsible for:

- Registering and handling context menus for capturing text, images, links, and pages.
- Managing extension-wide events and communication between content scripts, popup, and options pages.
- Acting as the main event hub for Chrome extension APIs (contextMenus, storage, messaging, etc.).

---

## Structure

- **index.ts**  
  Main entry point for the background service worker.  
  - Registers context menus on extension startup.
  - Handles extension events and message routing.

- **contextMenus/**  
  Contains logic for creating and handling context menu items.
  - **contextMenus.ts**: Defines context menu item IDs, types, and shared logic.
  - **createContextMenus.ts**: Functions to register and initialize all context menus.
  - **handlers.ts**: Event handlers for context menu actions (e.g., capturing selected text, images, links, or pages).

---

## Key Responsibilities

- **Context Menu Registration:**  
  Dynamically creates context menu items for different content types (text, image, link, page).

- **Context Menu Handling:**  
  Responds to user actions on context menus, gathers relevant data, and communicates with content scripts or other extension components.

- **Event Management:**  
  Listens for extension lifecycle events (install, update, etc.) and manages background tasks.

- **Messaging:**  
  Facilitates communication between background, content scripts, popup, and options pages using Chrome's messaging APIs.

---

For more details, see inline comments in each file or refer to the main project README.
