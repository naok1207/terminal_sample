import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  terminal: {
    create: () => ipcRenderer.invoke('terminal:create'),
    write: (sessionId: string, data: string) => 
      ipcRenderer.send('terminal:write', sessionId, data),
    resize: (sessionId: string, cols: number, rows: number) => 
      ipcRenderer.send('terminal:resize', sessionId, cols, rows),
    dispose: (sessionId: string) => 
      ipcRenderer.send('terminal:dispose', sessionId),
    onData: (callback: (sessionId: string, data: string) => void) => {
      ipcRenderer.on('terminal:data', (event, sessionId, data) => {
        callback(sessionId, data);
      });
    },
    onExit: (callback: (sessionId: string) => void) => {
      ipcRenderer.on('terminal:exit', (event, sessionId) => {
        callback(sessionId);
      });
    }
  }
});