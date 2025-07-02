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
  - `enums.ts`: Enumerations for content types, events, menu reasons, etc.
  - `ids.ts`: Unique IDs for DOM elements, shortcuts, and other resources.
  - `strings.ts`: User-facing strings and labels for menus and toolbars.
  - `htmlTags.ts`, `htmlAttributes.ts`: Lists of HTML tags and attributes for DOM processing.
  - `cssProperties.ts`: CSS property names for style manipulation.
  - `types.ts`: Shared TypeScript interfaces and types for selections, toolbars, shortcuts, etc.

- **ui/**  
  Factories and base logic for UI components:
  - `buttonFactory.ts`: Factory for creating styled button elements.
  - `dropdownFactory.ts`: Factory for dropdown UI components.
  - `toggleFactory.ts`: Factory for toggle switches.
  - `baseFactory.ts`: Shared base logic for UI factories.
  - `uiConfig.ts`: Configuration options for UI components.

---

## Key Responsibilities

- **Utility Functions:**  
  Provide reusable helpers for DOM operations, logging, environment detection, and selection validation.

- **Constants & Types:**  
  Centralize all enums, constants, IDs, and type definitions for consistency and type safety.

- **UI Factories:**  
  Enable modular, isolated creation of UI components (buttons, dropdowns, toggles) with consistent styling and behavior.

---

For more details, see inline comments in each file or refer to the main project README.
