import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBridgeMessage } from '@/hooks/useBridgeMessage';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import { InfoPanel } from '@/components/InfoPanel';
import { RoutesManager } from '@/components/RoutesManager';
import { ToolsManager } from '@/components/ToolsManager';
import { LogsPanel } from '@/components/LogsPanel';
import { Settings } from '@/components/Settings';
import { Logo } from '@/components/Logo';
import { Wifi, WifiOff, RefreshCw, Route as RouteIcon, Wrench, FileText, Settings as SettingsIcon, Info, X, Maximize2, Minimize2, Loader2, Globe, Sun, Moon } from 'lucide-react';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours === 0) {
    return `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}]`;
  }
  return `[${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}]`;
}

function App() {
  const { state, actions, isConnecting, isMaximized, connectedAt } = useBridgeMessage();
  const { t, currentLanguage, changeLanguage, languages } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [connectionDuration, setConnectionDuration] = useState<string>('');
  const [activeTab, setActiveTab] = useState('info');

  const isConnected = state.status === 'connected';
  const isReconnecting = state.status === 'reconnecting';
  const hasError = state.status === 'error' || state.status === 'failed';

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isMaximized) return;
    
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input, [role="button"], [data-radix-collection-item]');
    if (isInteractive) return;
    
    e.preventDefault();
    const screenX = 'touches' in e ? e.touches[0].screenX : e.screenX;
    const screenY = 'touches' in e ? e.touches[0].screenY : e.screenY;
    
    actions.dragStart(screenX, screenY);
  }, [isMaximized, actions]);

  const tabs = [
    { value: 'info', icon: Info, label: t('tabs.info') },
    { value: 'routes', icon: RouteIcon, label: t('tabs.routes'), count: state.routes.length },
    { value: 'tools', icon: Wrench, label: t('tabs.tools'), count: state.tools.length },
    { value: 'logs', icon: FileText, label: t('tabs.logs'), count: state.logs.length },
    { value: 'settings', icon: SettingsIcon, label: t('tabs.settings') },
  ];

  useEffect(() => {
    if (!connectedAt) {
      setConnectionDuration('');
      return;
    }

    const updateDuration = () => {
      const duration = Date.now() - connectedAt;
      setConnectionDuration(formatDuration(duration));
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [connectedAt]);

  useEffect(() => {
    if (window.innerWidth < 640 && !isMaximized) {
      actions.toggleMaximize();
    }
  }, []);

  // 获取连接按钮配置
  const getConnectionButtonConfig = () => {
    if (isConnecting) {
      return {
        variant: 'secondary' as const,
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        text: t('header.connecting'),
        disabled: true,
        onClick: () => {},
      };
    }
    if (isReconnecting) {
      return {
        variant: 'warning' as const,
        icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" />,
        text: t('status.reconnecting'),
        disabled: true,
        onClick: () => {},
      };
    }
    if (hasError) {
      return {
        variant: 'destructive' as const,
        icon: <WifiOff className="h-3.5 w-3.5" />,
        text: state.status === 'error' ? t('status.error') : t('status.failed'),
        disabled: false,
        onClick: () => actions.connect(),
      };
    }
    if (isConnected) {
      return {
        variant: 'success' as const,
        icon: <Wifi className="h-3.5 w-3.5" />,
        text: connectionDuration ? `${t('status.connected')} ${connectionDuration}` : t('status.connected'),
        hoverIcon: <WifiOff className="h-3.5 w-3.5" />,
        hoverText: t('header.disconnect'),
        disabled: false,
        onClick: () => actions.disconnect(),
      };
    }
    // 默认：未连接
    return {
      variant: 'default' as const,
      icon: <WifiOff className="h-3.5 w-3.5" />,
      text: t('header.clickToConnect'),
      disabled: false,
      onClick: () => actions.connect(),
    };
  };

  const buttonConfig = getConnectionButtonConfig();

  return (
    <div className={`h-screen flex flex-col bg-background ${isMaximized ? 'rounded-none' : ''}`}>
      {/* Unified Header Bar */}
      <div 
        className={`flex items-center justify-between px-3 py-1.5 border-b bg-muted ${!isMaximized ? 'cursor-move' : ''}`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Left: Connection Button */}
        <div className="flex items-center justify-start">
          {isConnected ? (
            <Button
              size="sm"
              variant="success"
              onClick={buttonConfig.onClick}
              disabled={buttonConfig.disabled}
              className="h-7 group hover:bg-destructive"
            >
              <Wifi className="h-3.5 w-3.5 group-hover:hidden" />
              <WifiOff className="h-3.5 w-3.5 hidden group-hover:block" />
              <span className="group-hover:hidden hidden sm:inline">{buttonConfig.text}</span>
              <span className="hidden group-hover:inline sm:hidden">{buttonConfig.hoverText}</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant={buttonConfig.variant}
              onClick={buttonConfig.onClick}
              disabled={buttonConfig.disabled}
              className="h-7"
            >
              {buttonConfig.icon}
              <span className="hidden sm:inline">{buttonConfig.text}</span>
            </Button>
          )}
        </div>
        
        {/* Center: Logo */}
        <div className="flex items-center justify-center">
          <a 
            href="https://broxy.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Logo className="h-5 w-5" />
            <h1 className="hidden md:block text-base font-semibold ml-1.5">Broxy.Dev</h1>
          </a>
        </div>
        
        {/* Right: Language + Theme + Maximize + Close */}
        <div className="flex items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-black/10" title={t('settings.language')}>
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={currentLanguage === lang.code ? 'bg-accent' : ''}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-black/10"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-black/10 hidden sm:flex"
            onClick={() => actions.toggleMaximize()}
            title={isMaximized ? t('header.restore') : t('header.maximize')}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-black/10"
            onClick={() => actions.closePanel()}
            title={t('header.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden pb-16 md:pb-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Desktop Tabs - Top */}
          <TabsList className="mx-4 mt-2 hidden md:flex">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1">
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count !== undefined && <Badge variant="secondary" className="ml-1">{tab.count}</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-auto m-0">
            <InfoPanel state={state} onResetWebId={actions.resetWebId} />
          </TabsContent>
          <TabsContent value="routes" className="flex-1 overflow-auto m-0">
            <RoutesManager routes={state.routes} actions={actions} />
          </TabsContent>
          <TabsContent value="tools" className="flex-1 overflow-auto m-0">
            <ToolsManager tools={state.tools} actions={actions} />
          </TabsContent>
          <TabsContent value="logs" className="flex-1 overflow-auto m-0">
            <LogsPanel logs={state.logs} actions={actions} />
          </TabsContent>
          <TabsContent value="settings" className="flex-1 overflow-auto m-0">
            <Settings state={state} actions={actions} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around items-center h-14 safe-area-pb">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-colors ${
              activeTab === tab.value ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className="relative">
              <tab.icon className="h-5 w-5" />
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 text-[10px] font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
}

export default App;
