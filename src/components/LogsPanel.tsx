import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CodeEditorDialog } from '@/components/CodeEditorDialog';
import { Trash2, ChevronDown, ChevronUp, FileText, Wifi, Code, Shield, Maximize2 } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import type { LogEntry } from '@/types';

interface LogsPanelProps {
  logs: LogEntry[];
  actions: {
    clearLogs: () => Promise<void>;
  };
}

const MAX_DISPLAY_LENGTH = 300;

const truncateString = (str: string, maxLen: number) => {
  if (str.length <= maxLen) return { text: str, truncated: false, fullText: str };
  return {
    text: str.slice(0, maxLen) + '\n...',
    truncated: true,
    fullText: str,
  };
};

const isSystemLog = (log: LogEntry) => {
  return ['connection', 'initScript', 'auth'].includes(log.type);
};

const getLogIcon = (type: string) => {
  switch (type) {
    case 'connection':
      return <Wifi className="h-3 w-3" />;
    case 'initScript':
      return <Code className="h-3 w-3" />;
    case 'auth':
      return <Shield className="h-3 w-3" />;
    default:
      return null;
  }
};

const getLogTypeVariant = (type: string) => {
  switch (type) {
    case 'connection':
      return 'default';
    case 'initScript':
      return 'outline';
    case 'auth':
      return 'destructive';
    case 'mcp':
      return 'default';
    default:
      return 'outline';
  }
};

const getLogTypeLabel = (type: string, t: (key: string) => string) => {
  switch (type) {
    case 'connection':
      return t('logs.typeConnection');
    case 'initScript':
      return t('logs.typeInitScript');
    case 'auth':
      return t('logs.typeAuth');
    default:
      return type.toUpperCase();
  }
};

const getLogActionLabel = (action: string, t: (key: string) => string) => {
  switch (action) {
    case 'connecting':
      return t('logs.actionConnecting');
    case 'connected':
      return t('logs.actionConnected');
    case 'disconnected':
      return t('logs.actionDisconnected');
    case 'reconnecting':
      return t('logs.actionReconnecting');
    case 'error':
      return t('logs.actionError');
    case 'failed':
      return t('logs.actionFailed');
    case 'executing':
      return t('logs.actionExecuting');
    case 'success':
      return t('logs.actionSuccess');
    default:
      return action.toUpperCase();
  }
};

const hasExpandableDetails = (log: LogEntry) => {
  if (!isSystemLog(log)) return true;
  return log.details != null;
};

export function LogsPanel({ logs, actions }: LogsPanelProps) {
  const { t } = useLocale();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [fullContentDialog, setFullContentDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
  }>({ open: false, title: '', content: '' });

  const handleClearConfirm = async () => {
    await actions.clearLogs();
    setShowClearConfirm(false);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatJson = (data: any): { text: string; truncated: boolean; fullText: string } => {
    if (!data) return { text: '-', truncated: false, fullText: '-' };
    try {
      const str = JSON.stringify(data, null, 2);
      return truncateString(str, MAX_DISPLAY_LENGTH);
    } catch {
      const str = String(data);
      return truncateString(str, MAX_DISPLAY_LENGTH);
    }
  };

  const handleViewFullContent = (title: string, content: string) => {
    setFullContentDialog({ open: true, title, content });
  };

  const renderLogHeader = (log: LogEntry) => {
    if (isSystemLog(log)) {
      return (
        <>
          {getLogIcon(log.type)}
          <Badge variant={getLogTypeVariant(log.type)} className="hidden sm:inline-flex">
            {getLogTypeLabel(log.type, t)}
          </Badge>
          <Badge variant={log.status === 'error' ? 'destructive' : 'success'} className="hidden sm:inline-flex">
            {log.action ? getLogActionLabel(log.action, t) : log.status.toUpperCase()}
          </Badge>
          <span className="font-medium text-sm flex-1">
            {log.message}
          </span>
        </>
      );
    }

    return (
      <>
        <Badge variant={log.type === 'mcp' ? 'default' : 'outline'} className="hidden sm:inline-flex">
          {log.type.toUpperCase()}
        </Badge>
        <Badge variant={log.status === 'error' ? 'destructive' : 'success'} className="hidden sm:inline-flex">
          {log.status.toUpperCase()}
        </Badge>
        <span className="font-medium text-sm">
          {log.method} {log.path}
        </span>
        <span className="ml-auto text-muted-foreground text-sm">
          {log.duration}ms
        </span>
      </>
    );
  };

  const renderLogDetail = (log: LogEntry) => {
    const renderField = (label: string, data: any) => {
      const { text, truncated, fullText } = formatJson(data);
      return (
        <div>
          <span className="text-muted-foreground">{label}:</span>
          <pre className="mt-1 p-2 bg-background rounded text-xs whitespace-pre-wrap break-all">
            {text}
          </pre>
          {truncated && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs mt-1"
              onClick={() => handleViewFullContent(label, fullText)}
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              {t('logs.viewFullContent')}
            </Button>
          )}
        </div>
      );
    };

    if (isSystemLog(log)) {
      return (
        <div className="p-3 border-t bg-muted/50 space-y-2 text-sm font-mono">
          {log.details && renderField(t('logs.details'), log.details)}
        </div>
      );
    }

    return (
      <div className="p-3 border-t bg-muted/50 space-y-2 text-sm font-mono">
        {renderField(t('logs.query'), log.query)}
        {renderField(t('logs.body'), log.body)}
        {renderField(t('logs.result'), log.result)}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">{t('logs.title')}</span>
          <Badge variant="secondary">{logs.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowClearConfirm(true)}>
          <Trash2 className="h-4 w-4 mr-1" />
          {t('logs.clearLogs')}
        </Button>
      </div>

      {/* Log List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('logs.noLogs')}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                  const canExpand = hasExpandableDetails(log);
                  return (
                    <div
                      key={log.id}
                      className="border rounded-lg overflow-hidden bg-card"
                    >
                      {/* Log Header */}
                      <div
                        className={`flex items-center gap-2 p-3 ${canExpand ? 'cursor-pointer hover:bg-accent/50' : ''}`}
                        onClick={() => canExpand && toggleExpand(log.id)}
                      >
                        <Badge variant="secondary" className="font-mono text-xs">
                          {log.timestamp}
                        </Badge>
                        {renderLogHeader(log)}
                        {canExpand && (
                          expandedId === log.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        )}
                      </div>

                      {/* Log Detail */}
                      {expandedId === log.id && canExpand && renderLogDetail(log)}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Clear Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logs.confirmClear')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('logs.confirmClearMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearConfirm}>{t('common.clear')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CodeEditorDialog
        open={fullContentDialog.open}
        title={fullContentDialog.title}
        value={fullContentDialog.content}
        language="json"
        readOnly
        onClose={() => setFullContentDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
