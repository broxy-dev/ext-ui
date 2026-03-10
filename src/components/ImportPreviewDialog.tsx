import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Editor from '@monaco-editor/react';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ImportPreviewDialogProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmDisabled?: boolean;
  showUrlInput?: boolean;
  urlValue?: string;
  onUrlChange?: (value: string) => void;
  onFetch?: () => void;
  fetching?: boolean;
  importing?: boolean;
}

export function ImportPreviewDialog({
  open,
  title,
  content,
  onConfirm,
  onClose,
  confirmDisabled,
  showUrlInput,
  urlValue,
  onUrlChange,
  onFetch,
  fetching,
  importing,
}: ImportPreviewDialogProps) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-screen h-screen max-w-none rounded-none flex flex-col p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden space-y-4">
          {showUrlInput && (
            <div className="flex gap-2 shrink-0">
              <Input
                value={urlValue}
                onChange={(e) => onUrlChange?.(e.target.value)}
                placeholder={t('settings.importUrlPlaceholder')}
                disabled={fetching || importing}
                className="flex-1"
              />
              <Button onClick={onFetch} disabled={fetching || importing}>
                {fetching && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {t('settings.fetchData')}
              </Button>
            </div>
          )}

          {content && (
            <>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 shrink-0">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{t('settings.importWarning')}</span>
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <Label className="mb-2">{t('settings.dataPreview')}</Label>
                <div className="flex-1 border rounded-md overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                    value={content}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      readOnly: true,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={importing}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={confirmDisabled || importing}>
            {importing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {t('settings.confirmImport')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
