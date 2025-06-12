import * as pty from 'node-pty';
import { BrowserWindow } from 'electron';
import * as os from 'os';

export interface ITerminalSession {
  id: string;
  pty: pty.IPty;
}

export class TerminalManager {
  private terminals: Map<string, ITerminalSession> = new Map();
  private sessionCounter = 0;

  createTerminal(): string {
    const sessionId = `terminal-${++this.sessionCounter}`;
    
    // Get default shell
    const shell = process.env.SHELL || '/bin/zsh';
    const cwd = process.env.HOME || os.homedir();
    
    // Create PTY instance
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd,
      env: process.env as { [key: string]: string }
    });

    // Set up data handler
    ptyProcess.onData((data) => {
      this.sendToRenderer('terminal:data', sessionId, data);
    });

    // Set up exit handler
    ptyProcess.onExit(() => {
      this.sendToRenderer('terminal:exit', sessionId);
      this.terminals.delete(sessionId);
    });

    this.terminals.set(sessionId, {
      id: sessionId,
      pty: ptyProcess
    });

    return sessionId;
  }

  write(sessionId: string, data: string): void {
    const session = this.terminals.get(sessionId);
    if (session) {
      session.pty.write(data);
    }
  }

  resize(sessionId: string, cols: number, rows: number): void {
    const session = this.terminals.get(sessionId);
    if (session) {
      session.pty.resize(cols, rows);
    }
  }

  disposeTerminal(sessionId: string): void {
    const session = this.terminals.get(sessionId);
    if (session) {
      session.pty.kill();
      this.terminals.delete(sessionId);
    }
  }

  dispose(): void {
    for (const [id, session] of this.terminals) {
      session.pty.kill();
    }
    this.terminals.clear();
  }

  private sendToRenderer(channel: string, ...args: any[]): void {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      windows[0].webContents.send(channel, ...args);
    }
  }
}