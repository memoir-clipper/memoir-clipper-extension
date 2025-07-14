# Utils Package Overview

This document describes the purpose and structure of the `utils/` package in Memoir Clipper.

---

## Purpose

The `utils/` package provides shared utility functions, constants, enums, type definitions, and UI factories used throughout the extension. It is organized for modularity and reusability, supporting both content and background scripts as well as UI components.

---

## Structure

- **helpers/**  
  General-purpose utility functions and helpers:
  - `domUtils.ts`: DOM manipulation and querying utilities.
  - `getFavicon.ts`: Logic to extract the favicon URL from the current page.
  - `logger.ts`: Logging utility with environment-aware log levels.
  - `environment.ts`: Detects environment (development/production) and feature support.
  - `getValidTextSelection.ts`: Validates and retrieves the current text selection.

- **values/**  
  Constants, enums, and type definitions:
  - `actions.ts`: Action string constants for extension messaging.
  - `constants.ts`: General constants used across the extension.
  - `enums.ts`: Enumerations for content types, events, menu reasons, variants, etc.
  - `ids.ts`: Unique IDs for DOM elements, shortcuts, and other resources.
  - `strings.ts`: User-facing strings and labels for menus and toolbars.
  - `htmlTags.ts`, `htmlAttributes.ts`: Lists of HTML tags and attributes for DOM processing.
  - `cssProperties.ts`: CSS property names for style manipulation.
  - `types.ts`: Shared TypeScript interfaces and types for selections, toolbars, shortcuts, etc.

- **ui/**  
  Factories and base logic for UI components:
  - `baseFactory.ts`: Shared base logic for UI factories (style injection, lifecycle, variant support).
  - `buttonFactory.ts`: Factory for creating styled button elements.
  - `dropdownFactory.ts`: Factory for dropdown UI components, supporting keyboard navigation and focus management.
  - `toggleFactory.ts`: Factory for toggle switches.
  - `inlineToolbarFactory.ts`: Factory for the inline/contextual toolbar UI, supporting variant inheritance.
  - `uiConfig.ts`: Configuration options and types for all UI components, including a universal variant type.

---

## Style and Theming Integration

All UI factories and components now support a universal variant type (e.g., light, dark). Styles are managed centrally for consistency, with each component accepting a variant and inheriting the toolbar's variant when used within the toolbar.  
A centralized catalog of colors and dimensions is used throughout the project, ensuring consistent, maintainable, and scalable styling.  
Component styles are structured to provide:
- A fixed set of base styles shared across all variants.
- Variant-specific overrides for styling differences.
- CSS variables for colors and sizing, with values mapped per variant.

---

## Features

- **Style Variants:**  
  Consistent theming across all UI components using a shared variant type and centralized style management.

- **Dropdowns:**  
  Dropdown menus support keyboard navigation, focus management, and selection highlighting.

- **Selection Handling:**  
  Selection IDs are generated based on content and position, ensuring reliable caching and restoration of toolbar state.

- **Component Isolation & Reusability:**  
  All UI components are modular, isolated, and reusable, with shared logic in base factories and centralized style catalogs.

---

For more details, see inline comments in each file or refer to the main project README.
