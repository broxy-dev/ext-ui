// 路由配置
export interface Route {
  id: string;
  name: string;
  pattern: string;
  method: 'all' | 'get' | 'post' | 'put' | 'delete';
  description: string;
  handler: string;
  enabled: boolean;
}

// MCP 工具配置
export interface MCPTool {
  id: string;
  name: string;
  description: string;
  pattern: string;
  handler: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      description: string;
    }>;
    required: string[];
  };
  enabled: boolean;
}

// 日志记录
export interface LogEntry {
  id: number;
  timestamp: string;
  type: 'api' | 'mcp' | 'connection' | 'initScript' | 'auth';
  // API/MCP 日志字段
  method?: string;
  path?: string;
  query?: Record<string, string>;
  body?: any;
  headers?: Record<string, string>;
  result?: any;
  duration?: number;
  // 系统日志字段
  action?: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'failed' | 'executing' | 'success';
  message?: string;
  details?: any;
  // 通用字段
  status: 'success' | 'error';
}

// MCP 配置
export interface MCPConfig {
  name: string;
  version: string;
}

// Skill 配置
export interface SkillConfig {
  name: string;
  description: string;
  usageNotes: string;
}

// 应用状态
export interface AppState {
  webId: string;
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'failed';
  routes: Route[];
  tools: MCPTool[];
  logs: LogEntry[];
  mcpConfig: MCPConfig;
  initScript: string;
  workerDomain: string;
  authToken: string;
  authEnabled: boolean;
  skillConfig: SkillConfig;
  theme: string;
  language: string;
}

// 通信消息类型
export interface BridgeEvent {
  type: 'bb/event';
  event: string;
  data: any;
}

export interface BridgeResponse {
  type: 'bb/response';
  id: string;
  result?: any;
  error?: string;
}

export interface BridgeAction {
  type: 'bb/action';
  id: string;
  action: string;
  data?: any;
}
