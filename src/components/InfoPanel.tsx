import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/useToast';
import { useLocale } from '@/hooks/useLocale';
import { Copy, RotateCcw, ChevronUp, ChevronDown, Box, Globe, Terminal } from 'lucide-react';
import type { AppState } from '@/types';

interface InfoPanelProps {
  state: AppState;
  onResetWebId?: () => Promise<{ success: boolean; webId: string }>;
}

export function InfoPanel({ state, onResetWebId }: InfoPanelProps) {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const apiUrl = `https://${state.workerDomain}/api/${state.webId}`;
  const mcpUrl = `https://${state.workerDomain}/mcp/${state.webId}`;
  const serviceName = state.mcpConfig?.name || 'broxy';

  const handleCopy = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('toast.copySuccess'),
        description: t('toast.copiedToClipboard', { name }),
        variant: 'success',
      });
    } catch {
      toast({
        title: t('toast.copyFailed'),
        description: t('toast.cannotCopy'),
        variant: 'destructive',
      });
    }
  };

  const mcpConfigObj: Record<string, unknown> = {
    type: 'remote',
    url: mcpUrl,
    enabled: true,
  };

  if (state.authEnabled) {
    mcpConfigObj.headers = {
      Authorization: `Bearer ${state.authToken}`,
    };
  }

  const mcpConfigJson = JSON.stringify({
    mcp: {
      [serviceName]: mcpConfigObj,
    },
  }, null, 2);

  let curlGetCmd = `curl ${apiUrl}/your-path`;
  let curlPostCmd = `curl -X POST ${apiUrl}/your-path \\
  -H "Content-Type: application/json" \\
  -d '{"key":"value"}'`;

  if (state.authEnabled) {
    curlGetCmd = `curl -H "Authorization: Bearer ${state.authToken}" ${apiUrl}/your-path`;
    curlPostCmd = `curl -X POST ${apiUrl}/your-path \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${state.authToken}" \\
  -d '{"key":"value"}'`;
  }

  const curlCommands = `${curlGetCmd}\n\n${curlPostCmd}`;

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div className="p-2 sm:p-3 rounded-lg bg-muted">
          <div className="text-xl sm:text-2xl font-bold">{state.routes.length}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">{t('info.routes')}</div>
        </div>
        <div className="p-2 sm:p-3 rounded-lg bg-muted">
          <div className="text-xl sm:text-2xl font-bold">{state.tools.length}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">{t('info.tools')}</div>
        </div>
        <div className="p-2 sm:p-3 rounded-lg bg-muted">
          <div className="text-xl sm:text-2xl font-bold">{state.logs.length}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">{t('info.logs')}</div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>{t('info.webId')}</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input value={state.webId} readOnly className="font-mono text-sm pr-10" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => handleCopy(state.webId, 'Web ID')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" title={t('info.resetWebId')}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('info.resetWebIdConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('info.resetWebIdMessage')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={onResetWebId}>
                    {t('common.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('info.mcpEndpoint')}</Label>
          <div className="relative">
            <Input value={mcpUrl} readOnly className="font-mono text-sm pr-10" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleCopy(mcpUrl, 'MCP')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('info.apiEndpoint')}</Label>
          <div className="relative">
            <Input value={apiUrl} readOnly className="font-mono text-sm pr-10" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleCopy(apiUrl, 'API')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3 py-2 bg-muted hover:bg-muted/80 transition-colors"
          onClick={() => setIsGuideOpen(!isGuideOpen)}
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <span className="text-amber-500">💡</span>
            {t('info.usageGuide')}
          </span>
          {isGuideOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isGuideOpen && (
          <div className="p-3 space-y-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Box className="h-4 w-4 text-primary" />
                {t('info.mcpUsage')} (StreamableHTTP)
              </div>
              <div className="pl-6 space-y-1 text-muted-foreground">
                <p>{t('info.mcpUsageDesc')}</p>
                <p className="text-xs">{t('info.mcpClients')}</p>
              </div>
              <div className="pl-6">
                <p className="text-xs text-muted-foreground mb-1">{t('info.sampleConfig')}：</p>
                <div className="relative">
                  <pre className="p-2 bg-muted rounded text-xs overflow-x-auto font-mono">
                    {mcpConfigJson}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => handleCopy(mcpConfigJson, t('info.sampleConfig'))}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Globe className="h-4 w-4 text-blue-500" />
                {t('info.apiUsage')}
              </div>
              <div className="pl-6 space-y-1 text-muted-foreground text-xs">
                <p>{t('info.apiUsageDesc')}</p>
              </div>
              <div className="pl-6">
                <div className="relative">
                  <pre className="p-2 bg-muted rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
                    <span className="flex items-center gap-1 text-muted-foreground"><Terminal className="h-3 w-3" /> {t('info.testCommands')}:</span>
                    {'\n'}
                    {curlCommands}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => handleCopy(curlCommands, t('info.testCommands'))}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
