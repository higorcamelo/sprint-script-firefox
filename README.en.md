# 🧩 ScriptSprint — Firefox Extension

[![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/sprintscript/)

This is the main README for the **ScriptSprint** extension in English. If you prefer the Portuguese version, click the flag below:

##### 🇧🇷 [Versão em português deste README](./README.md)

---

**ScriptSprint** is a Firefox extension that enables automatic replacement of custom text shortcuts with full phrases directly inside text fields and editable areas. Designed to speed up writing and eliminate repetitive tasks, the extension offers control and flexibility to the end user.

---

## ✨ Overview

ScriptSprint is ideal for anyone working with form filling, support, development, content creation, or any task involving repeated phrases. Users define a shortcut, and when typed, the extension suggests an automatic replacement with confirmation — ensuring accuracy and control.

---

## 🔧 Features

- **Custom Shortcuts** — Map short commands to full phrases or blocks of text.  
- **Confirmation Before Replacement** — To avoid accidental substitutions.  
- **Support for `input`, `textarea`, and `contenteditable` areas** — Works even on chat apps like WhatsApp Web and Instagram.  
- **Support for Line Breaks** — Create texts with structure and formatting.  
- **Intuitive Interface** — Easily manage your shortcuts.  
- **Internationalization (i18n)** — Interface available in English and Portuguese.  
- **Local Storage** — No data leaves your browser.  
- **100% Open Source** — Transparent, lightweight, and customizable.

---

## 🗂 Project Structure

```bash
├── index.js                 # Main file that connects all modules
│   ├── i18n.js              # Translation and language logic
│   ├── substitutions.js     # Loads shortcuts, applies replacements, and listens to typing
│   ├── tooltip.js           # Creates, displays, and manages confirmation tooltip
│   ├── replace.js           # Functions to replace text inside fields
│   ├── observer.js          # Observes page changes and adds listeners
│   └── utils.js             # Helper functions like text truncation, etc.
├── popup.html              # User interface for managing shortcuts
├── popup.css               # Interface styles
├── popup.js                # Popup interaction logic
├── manifest.json           # Extension configuration
├── locales/                # Translation files (i18n)

```
---

## 🚀 How to Install (Temporary Mode)


1. Clone or download this repository.

2. In Firefox, go to `about:debugging`.

3. Click on “Load temporary extension” and select the project manifest.


---


## 📝 How to use


1. Click on the extension icon.

2. Add a new shortcut with a short name and its corresponding text.

3. On any web page, type in the shortcut and confirm the replacement.


---


## 🌱 About the Future


ScriptSprint is a constantly evolving project. New ideas are being explored to expand the extension with more advanced features, better performance and an even more refined user experience. Feel free to follow the repository and suggest improvements.


---
