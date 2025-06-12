console.log('Renderer script loading...');

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebglAddon } from 'xterm-addon-webgl';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import 'xterm/css/xterm.css';

declare global {
  interface Window {
    electronAPI: {
      terminal: {
        create: () => Promise<string>;
        write: (sessionId: string, data: string) => void;
        resize: (sessionId: string, cols: number, rows: number) => void;
        dispose: (sessionId: string) => void;
        onData: (callback: (sessionId: string, data: string) => void) => void;
        onExit: (callback: (sessionId: string) => void) => void;
      };
    };
  }
}

class TerminalApp {
  private terminal: Terminal;
  private fitAddon: FitAddon;
  private sessionId: string | null = null;

  constructor() {
    this.terminal = new Terminal({
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        cursorAccent: '#000000',
        selectionBackground: '#3a3d41',
        black: '#000000',
        brightBlack: '#666666',
        red: '#cd3131',
        brightRed: '#f14c4c',
        green: '#0dbc79',
        brightGreen: '#23d18b',
        yellow: '#e5e510',
        brightYellow: '#f5f543',
        blue: '#2472c8',
        brightBlue: '#3b8eea',
        magenta: '#bc3fbc',
        brightMagenta: '#d670d6',
        cyan: '#11a8cd',
        brightCyan: '#29b8db',
        white: '#e5e5e5',
        brightWhite: '#ffffff'
      },
      allowTransparency: false,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 10000,
      tabStopWidth: 8,
      allowProposedApi: true
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    // Load Unicode11 addon
    // Commenting out for now as it requires allowProposedApi
    // const unicode11Addon = new Unicode11Addon();
    // this.terminal.loadAddon(unicode11Addon);

    this.setupEventHandlers();
  }

  async initialize() {
    const container = document.getElementById('terminal-container');
    if (!container) {
      throw new Error('Terminal container not found');
    }

    this.terminal.open(container);
    
    // Try to load WebGL addon for better performance
    try {
      const webglAddon = new WebglAddon();
      webglAddon.onContextLoss(() => {
        webglAddon.dispose();
      });
      this.terminal.loadAddon(webglAddon);
    } catch (e) {
      console.warn('WebGL addon could not be loaded:', e);
    }

    this.fitAddon.fit();

    // Create terminal session
    this.sessionId = await window.electronAPI.terminal.create();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.fitAddon.fit();
      if (this.sessionId) {
        window.electronAPI.terminal.resize(
          this.sessionId,
          this.terminal.cols,
          this.terminal.rows
        );
      }
    });
    resizeObserver.observe(container);

    // Focus terminal
    this.terminal.focus();
  }

  private setupEventHandlers() {
    // Handle terminal input
    this.terminal.onData((data) => {
      if (this.sessionId) {
        window.electronAPI.terminal.write(this.sessionId, data);
      }
    });

    // Handle terminal resize
    this.terminal.onResize(({ cols, rows }) => {
      if (this.sessionId) {
        window.electronAPI.terminal.resize(this.sessionId, cols, rows);
      }
    });

    // Handle data from backend
    window.electronAPI.terminal.onData((sessionId, data) => {
      if (sessionId === this.sessionId) {
        this.terminal.write(data);
      }
    });

    // Handle terminal exit
    window.electronAPI.terminal.onExit((sessionId) => {
      if (sessionId === this.sessionId) {
        this.terminal.write('\r\n[Process exited]\r\n');
      }
    });

    // Handle copy/paste
    this.terminal.onSelectionChange(() => {
      const selection = this.terminal.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    });

    // Paste on right-click or Ctrl/Cmd+V
    this.terminal.element?.addEventListener('contextmenu', async (e) => {
      e.preventDefault();
      const text = await navigator.clipboard.readText();
      if (text && this.sessionId) {
        window.electronAPI.terminal.write(this.sessionId, text);
      }
    });

    document.addEventListener('paste', async (e) => {
      if (this.terminal.element?.contains(document.activeElement)) {
        e.preventDefault();
        const text = e.clipboardData?.getData('text');
        if (text && this.sessionId) {
          window.electronAPI.terminal.write(this.sessionId, text);
        }
      }
    });
  }

  dispose() {
    if (this.sessionId) {
      window.electronAPI.terminal.dispose(this.sessionId);
    }
    this.terminal.dispose();
  }
}

// Initialize terminal when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded event fired');
  console.log('Container element:', document.getElementById('terminal-container'));
  console.log('Window.electronAPI:', window.electronAPI);
  
  const terminalApp = new TerminalApp();
  try {
    await terminalApp.initialize();
    console.log('Terminal initialized successfully');
  } catch (error) {
    console.error('Failed to initialize terminal:', error);
  }

  // Clean up on window unload
  window.addEventListener('beforeunload', () => {
    terminalApp.dispose();
  });
});