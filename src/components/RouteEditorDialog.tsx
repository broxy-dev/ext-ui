import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Editor from '@monaco-editor/react';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import type { Route } from '@/types';

interface RouteEditorDialogProps {
  open: boolean;
  route: Route | null;
  onSave: (route: Route) => void;
  onClose: () => void;
}

const defaultRoute: Omit<Route, 'id'> = {
  name: '',
  pattern: '',
  method: 'all',
  description: '',
  handler: `async (method, path, query, body, headers) => {
  // 简单返回 JSON (状态码 200)
  // return { message: "Hello" };

  // 自定义响应格式:
  // return {
  //   status: 201,                              // HTTP 状态码
  //   headers: { 'Content-Type': 'text/html' }, // 响应头
  //   body: '<html><body>Hello</body></html>'   // 响应体
  // };

  // 图片示例 (isBase64: true 会自动解码 base64):
  // return {
  //   status: 200,
  //   headers: { 'Content-Type': 'image/png' },
  //   body: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  //   isBase64: true
  // };

  return { message: "Hello from custom route" };
}`,
  enabled: true,
};

export function RouteEditorDialog({ open, route, onSave, onClose }: RouteEditorDialogProps) {
  const { t } = useLocale();
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Omit<Route, 'id'>>(defaultRoute);
  const [code, setCode] = useState(defaultRoute.handler);

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name,
        pattern: route.pattern,
        method: route.method,
        description: route.description,
        handler: route.handler,
        enabled: route.enabled,
      });
      setCode(route.handler);
    } else {
      setFormData(defaultRoute);
      setCode(defaultRoute.handler);
    }
  }, [route, open]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert(t('routes.pleaseEnterName'));
      return;
    }
    if (!formData.pattern.trim()) {
      alert(t('routes.pleaseEnterPath'));
      return;
    }

    try {
      new Function('return ' + code);
    } catch (e: any) {
      alert(t('routes.syntaxError', { message: e.message }));
      return;
    }

    onSave({
      id: route?.id || crypto.randomUUID(),
      ...formData,
      handler: code,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} className="w-screen h-screen max-w-none rounded-none flex flex-col p-4">
        <DialogHeader>
          <DialogTitle>{route ? t('routes.editRoute') : t('routes.addRoute')}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Top/Left: Form */}
          <div className="h-1/2 md:h-full md:w-80 flex flex-col gap-4 overflow-auto px-2 pb-2 md:pb-0">
            <div className="space-y-2">
              <Label>{t('routes.name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('routes.namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('routes.path')}</Label>
              <Input
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                placeholder={t('routes.pathPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('routes.method')}</Label>
              <Select
                value={formData.method}
                onValueChange={(v) => setFormData({ ...formData, method: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL</SelectItem>
                  <SelectItem value="get">GET</SelectItem>
                  <SelectItem value="post">POST</SelectItem>
                  <SelectItem value="put">PUT</SelectItem>
                  <SelectItem value="delete">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('routes.description')}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('routes.descriptionPlaceholder')}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-border shrink-0" />
          <div className="md:hidden h-px bg-border shrink-0" />

          {/* Bottom/Right: Code Editor */}
          <div className="h-1/2 md:h-full md:flex-1 flex flex-col min-w-0 min-h-0">
            <Label className="mb-2 shrink-0">
              {t('routes.handler')}
              <span className="text-muted-foreground font-normal text-xs ml-2">
                {t('routes.handlerParams')}
              </span>
            </Label>
            <div className="flex-1 border rounded-md overflow-hidden min-h-0">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
