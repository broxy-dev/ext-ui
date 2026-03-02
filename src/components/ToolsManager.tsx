import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolEditorDialog } from './ToolEditorDialog';
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
import { Plus, Edit, Trash2, Wrench, MoreVertical } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { useToast } from '@/hooks/useToast';
import type { MCPTool } from '@/types';

interface ToolsManagerProps {
  tools: MCPTool[];
  actions: {
    saveTool: (id: string | null, tool: any) => Promise<void>;
    deleteTool: (id: string) => Promise<void>;
  };
}

export function ToolsManager({ tools, actions }: ToolsManagerProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<MCPTool | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingTool(null);
    setEditorOpen(true);
  };

  const handleEdit = (tool: MCPTool) => {
    setEditingTool(tool);
    setEditorOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await actions.deleteTool(deleteId);
      setDeleteId(null);
    }
  };

  const handleSave = async (tool: MCPTool) => {
    await actions.saveTool(editingTool?.id || null, tool);
    setEditorOpen(false);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const tool = tools.find(t => t.id === id);
    if (tool) {
      await actions.saveTool(id, { ...tool, enabled });
      toast({
        title: enabled ? t('common.enable') : t('common.disable'),
        description: enabled
          ? t('tools.toolEnabled', { name: tool.name })
          : t('tools.toolDisabled', { name: tool.name }),
        variant: 'success',
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          <span className="text-sm font-medium">{t('tools.title')}</span>
          <Badge variant="secondary">{tools.length}</Badge>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          {t('tools.addTool')}
        </Button>
      </div>

      {/* Tool List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {tools.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('tools.noTools')}
            </div>
          ) : (
            tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate hidden xs:block">
                      {tool.description || t('tools.noDescription')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Switch
                    checked={tool.enabled}
                    onCheckedChange={(checked) => handleToggle(tool.id, checked)}
                    title={tool.enabled ? t('common.disable') : t('common.enable')}
                  />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hidden sm:flex" onClick={() => handleEdit(tool)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hidden sm:flex" onClick={() => setDeleteId(tool.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 sm:hidden">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(tool)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(tool.id)} className="text-destructive">
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
      <ToolEditorDialog
        open={editorOpen}
        tool={editingTool}
        onSave={handleSave}
        onClose={() => setEditorOpen(false)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tools.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tools.confirmDeleteMessage')}
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
