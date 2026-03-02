import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RouteEditorDialog } from './RouteEditorDialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash2, Route as RouteIcon, MoreVertical } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { useToast } from '@/hooks/useToast';
import type { Route } from '@/types';

interface RoutesManagerProps {
  routes: Route[];
  actions: {
    saveRoute: (id: string | null, route: any) => Promise<void>;
    deleteRoute: (id: string) => Promise<void>;
  };
}

export function RoutesManager({ routes, actions }: RoutesManagerProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingRoute(null);
    setEditorOpen(true);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setEditorOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await actions.deleteRoute(deleteId);
      setDeleteId(null);
    }
  };

  const handleSave = async (route: Route) => {
    await actions.saveRoute(editingRoute?.id || null, route);
    setEditorOpen(false);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const route = routes.find(r => r.id === id);
    if (route) {
      await actions.saveRoute(id, { ...route, enabled });
      toast({
        title: enabled ? t('common.enable') : t('common.disable'),
        description: enabled
          ? t('routes.routeEnabled', { name: route.name })
          : t('routes.routeDisabled', { name: route.name }),
        variant: 'success',
      });
    }
  };

  const methodColors: Record<string, string> = {
    get: 'bg-green-500',
    post: 'bg-blue-500',
    put: 'bg-orange-500',
    delete: 'bg-red-500',
    all: 'bg-gray-500',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{t('routes.title')}</span>
          <Badge variant="secondary">{routes.length}</Badge>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          {t('routes.addRoute')}
        </Button>
      </div>

      {/* Route List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {routes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('routes.noRoutes')}
            </div>
          ) : (
            routes.map((route) => (
              <div
                key={route.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <Badge className={`${methodColors[route.method]} text-white text-xs shrink-0`}>
                    {route.method.toUpperCase()}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{route.name}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate hidden xs:block">
                      {route.pattern}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Switch
                    checked={route.enabled}
                    onCheckedChange={(checked) => handleToggle(route.id, checked)}
                    title={route.enabled ? t('common.disable') : t('common.enable')}
                  />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hidden sm:flex" onClick={() => handleEdit(route)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hidden sm:flex" onClick={() => setDeleteId(route.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 sm:hidden">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(route)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(route.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Editor Dialog */}
      <RouteEditorDialog
        open={editorOpen}
        route={editingRoute}
        onSave={handleSave}
        onClose={() => setEditorOpen(false)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('routes.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('routes.confirmDeleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
