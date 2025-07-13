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

- **buttonStyles.ts**  
  Contains isolated CSS and utility functions for styling extension buttons.

- **dropdownStyles.ts**  
  Contains isolated CSS and utility functions for dropdown UI components.
  - Dropdown styles are now responsive and support a universal variant type.

- **inlineToolbarStyles.ts**  
  Contains isolated CSS and utility functions for the inline/contextual toolbar.
  - Toolbar styles inherit the universal variant type for consistent theming.

- **toggleStyles.ts**  
  Contains isolated CSS and utility functions for toggle switches and similar UI elements.

---

## Key Responsibilities

- **Base Styling:**  
  Provides a consistent, utility-first styling foundation using Tailwind CSS.

- **Dynamic Style Injection:**  
  Ensures that content script UIs are styled correctly, regardless of the host page's styles.

- **Component Isolation & Variants:**  
  Keeps styles for buttons, dropdowns, toolbars, and toggles modular and isolated to prevent conflicts. All components support a universal variant type for future theming.

---

For more details, see inline comments in each file or refer to the main project README.
