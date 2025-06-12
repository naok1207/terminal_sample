# Electron Terminal

VSCode-like terminal implementation for Electron on macOS using xterm.js and node-pty.

## Features

- Full terminal emulation with xterm.js
- Native shell integration (zsh/bash) via node-pty
- WebGL rendering for better performance
- Copy/paste support
- Automatic PATH fixing for macOS
- Support for vim, tmux, and other interactive CLI tools

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- macOS (this implementation is optimized for macOS)

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd terminal_sample
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the application:
```bash
npm start
```

### Development

For development with logging enabled:
```bash
npm run dev
```

To clean build artifacts:
```bash
npm run clean
```

## Project Structure

```
terminal_sample/
├── src/
│   ├── main/
│   │   ├── index.ts          # Main process entry point
│   │   ├── terminal-manager.ts # Terminal session management
│   │   └── preload.ts        # Preload script for IPC
│   └── renderer/
│       ├── index.html        # HTML template
│       ├── style.css         # Terminal styling
│       └── renderer.ts       # Renderer process with xterm.js
├── dist/                     # Build output (generated)
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Technical Details

- **xterm.js**: Terminal UI in the renderer process
- **node-pty**: Native pseudoterminal handling in the main process
- **IPC Communication**: Secure communication between main and renderer processes
- **WebGL Addon**: Hardware-accelerated rendering for better performance
- **fix-path**: Ensures proper PATH resolution on macOS

## Notes

- The terminal starts with the user's default shell (usually zsh on modern macOS)
- All standard terminal operations are supported including vim, tmux, etc.
- Copy functionality works automatically on text selection
- Paste can be triggered via right-click or Cmd+V

## Troubleshooting

If you encounter issues with missing commands or PATH problems:
1. The application uses `fix-path` to resolve macOS PATH issues automatically
2. Check that your shell configuration files (.zshrc, .bashrc) are properly set up
3. Ensure all dependencies are installed correctly with `npm install`

## Future Enhancements

As per Claude.md, this is a minimal implementation. Future enhancements could include:
- Multiple terminal tabs
- Split panes
- Custom themes
- Session persistence
- Search functionality