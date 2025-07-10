# Models Package Overview

This document describes the purpose and structure of the `models/` package in Memoir Clipper.

---

## Purpose

The `models/` package defines all core data models and messaging structures used throughout the extension. These models provide type safety, serialization, and a consistent interface for representing captured content and extension communication.

---

## Structure & Responsibilities

- **textModel.ts**  
  Represents a text selection captured from a web page, including plain text, semantic HTML, and page metadata.

- **imageModel.ts**  
  Represents an image captured from a web page, including the image source URL and page context.

- **linkModel.ts**  
  Represents a link captured from a web page, including the link target, page URL, favicon, and title.

- **pageModel.ts**  
  Represents a full page capture, including the page URL, favicon, and title.

- **extensionMessage.ts**  
  Defines the structure for messages sent between extension components (background, content, popup, options).  
  Includes static factory methods and serialization helpers.

- **extensionResponse.ts**  
  Defines the structure for responses to extension messages, supporting success/error states, data payloads, and request tracking.

- **eventManager.ts**  
  Utility class for managing and cleaning up event listeners, used by managers throughout the extension.

- **baseModel.ts**  
  Abstract base class for all models, providing unique ID generation, timestamps, and serialization helpers.

---

## Key Responsibilities

- **Content Models:**  
  Encapsulate all relevant data for text, image, link, and page captures, including metadata and serialization logic.

- **Messaging Models:**  
  Standardize communication between background, content, popup, and options scripts using typed messages and responses.

- **Event Management:**  
  Provide a reusable utility for registering and cleaning up event listeners in a safe and consistent way.

---

For more details, see inline comments in each file or refer to the main project README.
