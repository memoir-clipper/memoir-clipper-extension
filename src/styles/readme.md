# Styles Package Overview

This document describes the purpose and structure of the `styles/` package in Memoir Clipper.

---

## Purpose

The `styles/` package contains all CSS and style-related logic for the extension. It provides the base Tailwind CSS, dynamic style injection for content scripts, and isolated CSS modules for UI components such as buttons, dropdowns, toolbars, and toggles.

---

## Structure

- **tailwind.css**  
  The base Tailwind CSS stylesheet.  
  - Contains all utility classes and customizations for the extension UI.

- **tailwindInjector.ts**  
  Dynamically injects the Tailwind CSS into content scripts at runtime.  
  - Ensures consistent styling for injected UI elements on any web page.

- **colors.ts**  
  Centralized color catalog for all UI components.  
  - Provides semantic and scale-based color tokens (e.g., `gray100`, `blue500`, `white`, `transparent`).

- **dimensions.ts**  
  Centralized dimension catalog for spacing, sizing, border radius, font sizes, shadows, and transitions.  
  - Ensures consistent sizing and spacing across all components.

- **baseStylesSupplier.ts**  
  Abstract base class for style suppliers.  
  - Handles CSS variable mapping, variant-specific overrides, and style composition.

- **buttonStylesSupplier.ts**  
  Isolated CSS and utility functions for styling extension buttons.  
  - Uses the centralized color and dimension catalogs.

- **dropdownStylesSupplier.ts**  
  Isolated CSS and utility functions for dropdown UI components.  
  - Responsive, variant-aware, and catalog-driven.

- **inlineToolbarStylesSupplier.ts**  
  Isolated CSS and utility functions for the inline/contextual toolbar.  
  - Inherits the universal variant type for consistent theming.

- **toggleStylesSupplier.ts**  
  Isolated CSS and utility functions for toggle switches and similar UI elements.

---

## Key Responsibilities

- **Base Styling:**  
  Provides a consistent, utility-first styling foundation using Tailwind CSS and catalog-driven tokens.

- **Dynamic Style Injection:**  
  Ensures that content script UIs are styled correctly, regardless of the host page's styles.

- **Component Isolation & Variants:**  
  Keeps styles for buttons, dropdowns, toolbars, and toggles modular and isolated to prevent conflicts.  
  All components support a universal variant type for future theming.

- **Centralized Catalogs:**  
  All colors and dimensions are defined in dedicated files and referenced via CSS variables, ensuring reusability and maintainability.

- **Variant-Specific Styling:**  
  Each style supplier defines base styles and variant-specific overrides, with differences handled via CSS variables for colors and sizing.

---

For more details, see inline comments in each file or refer to the main project README.
