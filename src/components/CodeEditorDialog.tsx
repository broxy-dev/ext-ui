import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Editor from '@monaco-editor/react';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';

interface CodeEditorDialogProps {
  open: boolean;
  title: string;
  value: string;
  onChange?: (value: string) => void;
  onSave?: () => void;
  onClose: () => void;
  language?: string;
  description?: string;
  readOnly?: boolean;
}

export function CodeEditorDialog({
  open,
  title,
  value,
  onChange,
  onSave,
  onClose,
  language = 'javascript',
  description,
  readOnly = false,
}: CodeEditorDialogProps) {
  const { t } = useLocale();
  const { theme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} className="w-screen h-screen max-w-none rounded-none flex flex-col p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {description && (
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          )}
          <Label className="mb-2">{t('common.code')}</Label>
          <div className="flex-1 border rounded-md overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={language}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              value={value}
              onChange={(v) => onChange?.(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                readOnly,
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {readOnly ? t('common.confirm') : t('common.cancel')}
          </Button>
          {!readOnly && onSave && (
            <Button onClick={onSave}>{t('common.save')}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
