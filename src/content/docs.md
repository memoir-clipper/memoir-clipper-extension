# Content Package Overview

This document describes the purpose and structure of the `content/` package in Memoir Clipper.

---

## Purpose

The `content/` package contains all logic that runs as content scripts injected into web pages. Its responsibilities include:

- Detecting and analyzing user text selections.
- Injecting and managing the inline toolbar/context menu UI.
- Handling keyboard shortcuts for quick actions.
- Providing helpers for DOM analysis, formatting detection, and context extraction.
- Orchestrating communication between the content script and the background/popup/options scripts.

---

## Structure

- **index.ts**  
  Entry point for the content script.  
  - Injects Tailwind CSS styles.
  - Initializes the main orchestrator for selection and UI logic.

- **managers/**  
  Contains orchestrators and managers for UI and user interactions:
  - `textSelectionOrchestrator.ts`: Singleton that coordinates selection, context menu, and shortcuts.
  - `selectionManager.ts`: Detects and manages text selections, notifies listeners.
  - `inlineToolbarManager.ts`: Handles the lifecycle, positioning, and visibility of the inline toolbar/context menu.
  - `shortcutManager.ts`: Registers and handles keyboard shortcuts for actions.
  - `inlineToolbarFactory.ts`: Factory for creating the inline toolbar UI component.

- **helpers/**  
  Utility modules for content analysis and DOM operations:
  - `textSelectionAnalyzer.ts`: Extracts and formats selected text, preserving structure and formatting.
  - `textFormattingDetector.ts`: Detects formatting (bold, italic, etc.) in selections.
  - `positionCalculator.ts`: Calculates optimal position for the inline toolbar.
  - `htmlProcessor.ts`: Cleans and processes HTML fragments.
  - `contentTypeDetector.ts`: Determines the type of selected content (text, image, link, etc.).

---

## Key Responsibilities

- **Selection Detection:**  
  Listens for mouse and keyboard events to detect valid text selections.

- **Inline Toolbar UI:**  
  Renders a contextual toolbar near the selection, allowing quick actions (e.g., save, tag, AI actions).

- **Keyboard Shortcuts:**  
  Enables users to trigger the toolbar or actions via configurable shortcuts.

- **Content Analysis:**  
  Analyzes the selection for formatting, structure, and context to create rich data models.

- **Communication:**  
  Handles messaging with the background script for actions like saving content or responding to extension events.

---

For more details, see inline comments in each file or refer to the main project README.
