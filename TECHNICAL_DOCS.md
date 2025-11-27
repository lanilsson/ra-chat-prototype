# Technical Documentation

## Architecture Overview

The widget is designed as a **Self-Contained Interface (SCI)**. It does not rely on the host page's framework (WordPress/jQuery) but inherits basic font settings for visual consistency.

### Core Components

1.  **`RAChatWidget` Namespace (JS)**
    *   Uses the Module Pattern (IIFE) to avoid global scope pollution.
    *   **`init(options)`**: The entry point. locates the container and renders the initial UI.
    *   **`state`**: Holds the active chat history and current mocked conversations.
    *   **`els`**: Caches DOM references for performance.

2.  **Scoped CSS**
    *   All styles are nested under `#ra-chat-root`.
    *   Specific "reset" styles (`box-sizing: border-box`) ensure the widget renders consistently regardless of the host site's global CSS.

3.  **DOM Generation**
    *   We use `document.createElement()` helpers instead of massive `innerHTML` strings. This is safer (XSS prevention) and cleaner for event binding.

---

## Feature Implementation

### 1. Onboarding Tour
*   **Trigger:** Checks `localStorage.getItem('ra-chat-tour-completed')`.
*   **Overlay:** An absolute positioned `div` covering the widget.
*   **Highlighting:** Uses `z-index` manipulation to "lift" target elements (Sidebar, Input) above the backdrop.

### 2. Rich Media "Cards"
The `addMessage()` function supports an optional `attachments` array.
*   **Type: Chart:** Renders an `<img>` tag with border and meta text.
*   **Type: Article:** Renders a title, meta-data, and summary snippet.

### 3. Fake Backend (Mocks)
Currently, `ra-chat-widget.js` contains a hardcoded `state.chats` object.
*   **Transition to Live:** To connect a real backend, replace the `setTimeout` block in `handleUserSend` with:
    ```javascript
    fetch('https://api.your-backend.com/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
    })
    .then(response => response.json())
    .then(data => addMessage('bot', 'AI', data.text, data.attachments));
    ```

---

## Customization Guide

### Changing Colors
Edit `ra-chat-widget.css`. The primary branding color is hardcoded as `#cf2e2e`.
*   Search/Replace `#cf2e2e` to update the brand color.

### Adding New Prompts
Update the `prompts` array in `loadNewChatScreen()` within `ra-chat-widget.js`.

```javascript
const prompts = [
    'Analyze current market trends',
    'New Prompt Here...'
];
```

