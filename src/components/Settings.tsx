import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Settings as SettingsIcon, Code, FileUp, Edit3, Shield, RefreshCw, Copy, FileCode, Link, Loader2, Upload, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useLocale } from '@/hooks/useLocale';
import { CodeEditorDialog } from '@/components/CodeEditorDialog';
import type { AppState } from '@/types';

interface SettingsProps {
  state: AppState;
  actions: {
    saveConfig: (mcpConfig: any, initScript: string) => Promise<void>;
    saveAuth: (authToken: string, authEnabled: boolean) => Promise<void>;
    exportData: () => Promise<any>;
    importData: (data: any) => Promise<void>;
  };
}

export function Settings({ state, actions }: SettingsProps) {
  const { toast } = useToast();
  const { t } = useLocale();
  const [mcpConfig, setMcpConfig] = useState(state.mcpConfig);
  const [initScript, setInitScript] = useState(state.initScript);
  const [authToken, setAuthToken] = useState(state.authToken);
  const [authEnabled, setAuthEnabled] = useState(state.authEnabled);
  const [importText, setImportText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [showInitScriptDialog, setShowInitScriptDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMcpConfig(state.mcpConfig);
    setInitScript(state.initScript);
    setAuthToken(state.authToken);
    setAuthEnabled(state.authEnabled);
  }, [state.mcpConfig, state.initScript, state.authToken, state.authEnabled]);

  const handleSaveConfig = async () => {
    await actions.saveConfig(mcpConfig, initScript);
    toast({
      title: t('toast.saveSuccess'),
      description: t('toast.configSaved'),
      variant: 'success',
    });
  };

  const handleSaveInitScript = async () => {
    await actions.saveConfig(mcpConfig, initScript);
    setShowInitScriptDialog(false);
    toast({
      title: t('toast.saveSuccess'),
      description: t('toast.configSaved'),
      variant: 'success',
    });
  };

  const handleAuthToggle = async (enabled: boolean) => {
    let token = authToken;

    if (enabled && !token.trim()) {
      token = crypto.randomUUID();
      setAuthToken(token);
    }

    setAuthEnabled(enabled);
    await actions.saveAuth(token, enabled);

    toast({
      title: enabled ? t('common.enable') : t('common.disable'),
      description: enabled ? t('toast.authEnabled') : t('toast.authDisabled'),
      variant: 'success',
    });
  };

  const handleSaveAuth = async () => {
    await actions.saveAuth(authToken, authEnabled);
    toast({
      title: t('toast.saveSuccess'),
      description: t('toast.authSaved'),
      variant: 'success',
    });
  };

  const handleGenerateToken = () => {
    const newToken = crypto.randomUUID();
    setAuthToken(newToken);
    toast({
      title: t('toast.tokenGenerated'),
      description: t('toast.tokenGeneratedDesc'),
      variant: 'success',
    });
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(authToken);
      toast({
        title: t('toast.copySuccess'),
        description: t('toast.tokenCopied'),
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

  const handleExport = async () => {
    const data = await actions.exportData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = data?.data?.mcpConfig?.name || 'config';
    const version = data?.data?.mcpConfig?.version || '1.0.0';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.download = `broxy-${name}-${version}-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t('toast.exportSuccess'),
      description: t('toast.dataExported'),
      variant: 'success',
    });
  };

  const handleExportScript = async () => {
    const data = await actions.exportData();
    const jsonStr = JSON.stringify(data, null, 2);
    const name = data?.data?.mcpConfig?.name || 'config';
    const version = data?.data?.mcpConfig?.version || '1.0.0';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    const script = `/**
 * Broxy 初始化数据脚本 / Broxy Init Data Script
 * 
 * 使用说明 / Instructions:
 * 1. 将此脚本保存为 .js 文件 / Save this script as a .js file
 * 2. 在脚本管理器中设置此脚本优先执行 / Set this script to run first in your script manager
 * 3. 确保此脚本在 broxy-v1.user.js 之前执行 / Ensure this runs before broxy-v1.user.js
 */

window.__BROXY_INIT_DATA__ = ${jsonStr};
`;
    
    const blob = new Blob([script], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `broxy-init-${name}-${version}-${dateStr}.js`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t('toast.exportSuccess'),
      description: t('toast.scriptExported'),
      variant: 'success',
    });
  };

  const handleImportFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await actions.importData(data);
      toast({
        title: t('toast.importSuccess'),
        description: t('toast.dataImported'),
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: t('toast.importFailed'),
        description: t('toast.jsonParseFailed', { message: err.message }),
        variant: 'destructive',
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportFromEditor = async () => {
    if (!importText.trim()) {
      toast({
        title: t('toast.importFailed'),
        description: t('toast.pleasePasteData'),
        variant: 'destructive',
      });
      return;
    }
    try {
      const data = JSON.parse(importText);
      await actions.importData(data);
      setImportText('');
      setShowImportDialog(false);
      toast({
        title: t('toast.importSuccess'),
        description: t('toast.dataImported'),
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: t('toast.importFailed'),
        description: t('toast.jsonParseFailed', { message: err.message }),
        variant: 'destructive',
      });
    }
  };

  const handleFetchData = async () => {
    const url = importUrl.trim();
    if (!url) {
      toast({
        title: t('toast.importFailed'),
        description: t('toast.pleasePasteData'),
        variant: 'destructive',
      });
      return;
    }

    try {
      new URL(url);
    } catch {
      toast({
        title: t('toast.importFailed'),
        description: t('toast.invalidUrl'),
        variant: 'destructive',
      });
      return;
    }

    setFetching(true);
    setPreviewData(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(t('toast.httpError', { status: response.status }));
      }
      const data = await response.json();
      setPreviewData(data);
    } catch (err: any) {
      toast({
        title: t('toast.importFailed'),
        description: err.message || t('toast.fetchFailed', { message: 'Unknown error' }),
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) {
      toast({
        title: t('toast.importFailed'),
        description: t('settings.pleaseFetchFirst'),
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      await actions.importData(previewData);
      setImportUrl('');
      setPreviewData(null);
      setShowUrlDialog(false);
      toast({
        title: t('toast.importSuccess'),
        description: t('toast.dataImported'),
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: t('toast.importFailed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <h3 className="font-medium">{t('settings.auth')}</h3>
          </div>
          <div className="space-y-3 pl-6">
            <p className="text-sm text-muted-foreground">
              {t('settings.authDescription')}
            </p>
            <div className="flex items-center gap-2">
              <Switch
                checked={authEnabled}
                onCheckedChange={handleAuthToggle}
                title={authEnabled ? t('common.disable') : t('common.enable')}
              />
              <Label>{t('settings.enableAuth')}</Label>
            </div>
            {authEnabled && (
              <div className="space-y-2">
                <Label>{t('settings.authToken')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder={t('settings.authTokenPlaceholder')}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateToken}
                    title={t('settings.generateToken')}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyToken}
                    disabled={!authToken}
                    title={t('common.copy')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="sm" onClick={handleSaveAuth}>{t('settings.saveAuth')}</Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <h3 className="font-medium">{t('settings.mcpConfig')}</h3>
          </div>
          <div className="space-y-3 pl-6">
            <div className="space-y-2">
              <Label>{t('settings.serviceName')}</Label>
              <Input
                value={mcpConfig.name}
                onChange={(e) => setMcpConfig({ ...mcpConfig, name: e.target.value })}
                placeholder={t('settings.serviceNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('settings.version')}</Label>
              <Input
                value={mcpConfig.version}
                onChange={(e) => setMcpConfig({ ...mcpConfig, version: e.target.value })}
                placeholder={t('settings.versionPlaceholder')}
              />
            </div>
            <Button onClick={handleSaveConfig}>{t('settings.saveConfig')}</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <h3 className="font-medium">{t('settings.initScript')}</h3>
          </div>
          <div className="space-y-3 pl-6">
            <p className="text-sm text-muted-foreground">
              {t('settings.initScriptDescription')}
            </p>
            <Button
              variant="outline"
              onClick={() => setShowInitScriptDialog(true)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {initScript.trim() 
                ? t('settings.editInitScriptWithLength', { count: initScript.length })
                : t('settings.editInitScript')
              }
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <h3 className="font-medium">{t('settings.dataExport')}</h3>
          </div>
          <div className="space-y-3 pl-6">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                {t('settings.exportData')}
              </Button>
              <Button variant="outline" onClick={handleExportScript}>
                <FileCode className="h-4 w-4 mr-1" />
                {t('settings.exportScript')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.exportScriptHint')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <h3 className="font-medium">{t('settings.dataImport')}</h3>
          </div>
          <div className="space-y-3 pl-6">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={handleImportFromFile}>
                <FileUp className="h-4 w-4 mr-1" />
                {t('settings.importFromFile')}
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Edit3 className="h-4 w-4 mr-1" />
                {t('settings.importFromEditor')}
              </Button>
              <Button variant="outline" onClick={() => setShowUrlDialog(true)}>
                <Link className="h-4 w-4 mr-1" />
                {t('settings.importFromUrl')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.importHint')}
            </p>
          </div>
        </div>
      </div>

      <CodeEditorDialog
        open={showInitScriptDialog}
        title={t('settings.initScript')}
        value={initScript}
        onChange={setInitScript}
        onSave={handleSaveInitScript}
        onClose={() => setShowInitScriptDialog(false)}
        language="javascript"
        description={t('settings.initScriptDescription')}
      />

      <CodeEditorDialog
        open={showImportDialog}
        title={t('settings.importEditorTitle')}
        value={importText}
        onChange={setImportText}
        onSave={handleImportFromEditor}
        onClose={() => setShowImportDialog(false)}
        language="json"
      />

      <Dialog open={showUrlDialog} onOpenChange={(open) => {
        setShowUrlDialog(open);
        if (!open) {
          setPreviewData(null);
        }
      }}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('settings.importUrlTitle')}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex gap-2">
              <Input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder={t('settings.importUrlPlaceholder')}
                disabled={fetching || importing}
                className="flex-1"
              />
              <Button onClick={handleFetchData} disabled={fetching || importing}>
                {fetching && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {t('settings.fetchData')}
              </Button>
            </div>

            {previewData && (
              <>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{t('settings.importWarning')}</span>
                </div>
                <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
                  <div className="bg-muted px-3 py-2 text-sm font-medium border-b">
                    {t('settings.dataPreview')}
                  </div>
                  <ScrollArea className="h-[calc(100%-36px)]">
                    <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-all">
                      {JSON.stringify(previewData, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUrlDialog(false)} disabled={importing}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmImport} disabled={!previewData || importing}>
              {importing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {t('settings.confirmImport')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
