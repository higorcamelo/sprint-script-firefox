# 🧩 ScriptSprint — Firefox Extension

[![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](https://addons.mozilla.org/pt-BR/firefox/addon/sprintscript/)

This is the **ScriptSprint** extension for Firefox, designed to automate text insertion and streamline navigation through text fields, such as forms and text editors. The extension helps you improve your productivity by replacing user-defined shortcuts with full phrases or commands.

If you prefer to view this README in Portuguese, click the flag below:

🇧🇷 [Versão em português deste README](./README.md)

## Project Description

**ScriptSprint** is a Firefox browser extension designed to automate the insertion of text and simplify navigation through text fields, such as forms and editors, by replacing user-defined shortcuts with complete phrases or commands. The extension helps optimize repetitive tasks, improve efficiency, and provide a smoother, more personalized browsing experience.

## Current Features

- **Custom Shortcut Creation**: Users can define their own text shortcuts, linking a short command to a full phrase or command.
- **Substitution Confirmation**: When a shortcut is detected, the extension asks for confirmation before replacing the text, ensuring control over the process.
- **Simple Management Interface**: An intuitive interface for adding, editing, and removing shortcuts, allowing for full customization.
- **Support for Text Fields and Editable Elements**: Works with `input`, `textarea`, and `contenteditable` elements, like text editors.
- **Local Storage**: Shortcuts are stored locally in the browser, with no need for external servers.

## Planned Features for Future Versions

- **Shortcut Synchronization**: Implement synchronization of shortcuts across different devices via a user account, allowing the same shortcuts to be used anywhere.
- **Multi-language Support**: Add support for multiple languages, allowing the extension to be used globally.
- **Context Filters**: Implement filters to define shortcuts based on the type of field or page, ensuring greater flexibility.
- **Conditional Shortcuts**: Support for conditional shortcuts based on page content or specific actions, such as only replacing text if a form field is empty or a login page is open.
- **Real-Time Shortcut Management**: Improved interface for viewing, editing, and deleting shortcuts directly from the interface.
- **Automated and Stress Testing**: Implement tests to validate the extension's functionality and ensure robustness in various use cases, including scenarios with a large number of shortcuts.
- **Usage Analytics**: Collect usage data (with user consent) to understand how users are interacting with the extension and which features are most used.

## Project Structure

- **popup.html**: HTML file responsible for the extension's popup interface, where users can create and manage their custom shortcuts.
- **popup.css**: CSS file to style the popup interface.
- **popup.js**: JavaScript file controlling the logic for displaying and interacting with the popup interface.
- **content.js**: Script that detects and replaces shortcuts in text fields on web pages. Manages the logic for text replacement and confirmation prompts.
- **background.js**: Background JavaScript file managing background tasks and potential future integrations.
- **manifest.json**: The extension's manifest file containing permissions and details about the extension.

## How to Use

1. **Installation**
   - Download and extract the repository.
   - Open Firefox and navigate to `about:debugging`.
   - Click "Load Temporary Add-on" and select the project directory.

2. **Add Shortcuts**
   - Click the extension icon in the Firefox toolbar.
   - Use the interface to create new shortcuts by defining the shortcut and its corresponding text.
   - Save the shortcuts to use them on any webpage.

3. **Use Shortcuts**
   - When typing a shortcut in a text field or editable content, the extension will automatically detect it and ask for confirmation before replacing the shortcut with the associated text.

## Contributing

If you'd like to contribute to the project, feel free to open an issue or submit a pull request. All contributions are welcome! Check out the `CONTRIBUTING.md` file for more details on how to contribute.

