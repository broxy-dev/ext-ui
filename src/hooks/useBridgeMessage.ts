import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, LogEntry } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 9);

export function useBridgeMessage() {
  const [state, setState] = useState<AppState>({
    webId: '',
    status: 'disconnected',
    routes: [],
    tools: [],
    logs: [],
    mcpConfig: { name: 'WEB MCP Server', version: '1.0.0' },
    initScript: '',
    workerDomain: '',
    authToken: '',
    authEnabled: false,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);

  const pendingRequests = useRef<Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>>(new Map());

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, event: eventName, data, id, result, error } = event.data || {};

      if (type === 'bb/event') {
        console.log('[BridgeClient] Received event:', eventName, data);

        switch (eventName) {
          case 'init':
            setState(prev => ({ ...prev, ...data }));
            setIsConnecting(false);
            setConnectedAt(data.connectedAt || null);
            break;
          case 'statusChange':
            setState(prev => ({ ...prev, status: data.status }));
            setIsConnecting(false);
            if (data.status === 'connected') {
              setConnectedAt(Date.now());
            } else {
              setConnectedAt(null);
            }
            break;
          case 'log':
            setState(prev => ({
              ...prev,
              logs: [data, ...prev.logs].slice(0, 100)
            }));
            break;
          case 'routesChange':
            setState(prev => ({ ...prev, routes: data }));
            break;
          case 'toolsChange':
            setState(prev => ({ ...prev, tools: data }));
            break;
          case 'logsChange':
            setState(prev => ({ ...prev, logs: data }));
            break;
          case 'maximizeChange':
            setIsMaximized(data.isMaximized);
            break;
          case 'webIdChange':
            setState(prev => ({ ...prev, webId: data.webId }));
            break;
          case 'authChange':
            setState(prev => ({ ...prev, authToken: data.authToken, authEnabled: data.authEnabled }));
            break;
          case 'configChange':
            setState(prev => ({ ...prev, mcpConfig: data.mcpConfig, initScript: data.initScript }));
            break;
        }
      }

      if (type === 'bb/response' && id) {
        const pending = pendingRequests.current.get(id);
        if (pending) {
          pendingRequests.current.delete(id);
          if (error) {
            pending.reject(new Error(error));
          } else {
            pending.resolve(result);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendAction = useCallback(<T = any,>(action: string, data?: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      const id = generateId();

      pendingRequests.current.set(id, { resolve, reject });

      window.parent.postMessage({
        type: 'bb/action',
        id,
        action,
        data,
      }, '*');

      setTimeout(() => {
        if (pendingRequests.current.has(id)) {
          pendingRequests.current.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }, []);

  const actions = {
    connect: () => {
      setIsConnecting(true);
      return sendAction('connect');
    },
    disconnect: () => {
      setIsConnecting(true);
      return sendAction('disconnect');
    },
    closePanel: () => sendAction('closePanel'),
    toggleMaximize: () => {
      const newMaximized = !isMaximized;
      setIsMaximized(newMaximized);
      return sendAction('toggleMaximize', { isMaximized: newMaximized });
    },
    getRoutes: () => sendAction<any[]>('getRoutes'),
    saveRoute: (id: string | null, route: any) => sendAction('saveRoute', { id, route }),
    deleteRoute: (id: string) => sendAction('deleteRoute', { id }),
    getTools: () => sendAction<any[]>('getTools'),
    saveTool: (id: string | null, tool: any) => sendAction('saveTool', { id, tool }),
    deleteTool: (id: string) => sendAction('deleteTool', { id }),
    getLogs: () => sendAction<LogEntry[]>('getLogs'),
    clearLogs: () => sendAction('clearLogs'),
    getConfig: () => sendAction('getConfig'),
    saveConfig: (mcpConfig: any, initScript: string) => sendAction('saveConfig', { mcpConfig, initScript }),
    saveAuth: (authToken: string, authEnabled: boolean) => sendAction('saveAuth', { authToken, authEnabled }),
    exportData: () => sendAction('exportData'),
    importData: (data: any) => sendAction('importData', data),
    executeHandler: (handler: string, args: any, isTool: boolean) => 
      sendAction('executeHandler', { handler, args, isTool }),
    executeInitScript: () => sendAction('executeInitScript'),
    resetWebId: () => sendAction<{ success: boolean; webId: string }>('resetWebId'),
    dragStart: (x: number, y: number) => {
      window.parent.postMessage({ type: 'bb/action', action: 'dragStart', data: { x, y } }, '*');
    },
  };

  return { state, actions, isConnecting, isMaximized, connectedAt };
}
