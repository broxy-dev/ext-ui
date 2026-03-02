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
import { Copy, RotateCcw } from 'lucide-react';
import type { AppState } from '@/types';

interface InfoPanelProps {
  state: AppState;
  onResetWebId?: () => Promise<{ success: boolean; webId: string }>;
}

export function InfoPanel({ state, onResetWebId }: InfoPanelProps) {
  const { toast } = useToast();
  const { t } = useLocale();

  const apiUrl = `https://${state.workerDomain}/api/${state.webId}`;
  const mcpUrl = `https://${state.workerDomain}/mcp/${state.webId}`;
  const swaggerUrl = `https://${state.workerDomain}/api/${state.webId}/swagger.json`;

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

  return (
    <div className="p-4 space-y-4">
      {/* Statistics - at top */}
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

        <div className="space-y-2">
          <Label>{t('info.swaggerDoc')}</Label>
          <div className="relative">
            <Input value={swaggerUrl} readOnly className="font-mono text-sm pr-10" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleCopy(swaggerUrl, 'Swagger')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
