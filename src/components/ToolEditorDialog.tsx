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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Editor from '@monaco-editor/react';
import { Plus, Trash2 } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';
import type { MCPTool } from '@/types';

interface ToolEditorDialogProps {
  open: boolean;
  tool: MCPTool | null;
  onSave: (tool: MCPTool) => void;
  onClose: () => void;
}

interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
}

const defaultTool: Omit<MCPTool, 'id' | 'pattern'> = {
  name: '',
  description: '',
  handler: 'async ({ param1 }) => {\n  return { result: param1 };\n}',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  enabled: true,
};

export function ToolEditorDialog({ open, tool, onSave, onClose }: ToolEditorDialogProps) {
  const { t } = useLocale();
  const { theme } = useTheme();
  const [formData, setFormData] = useState(defaultTool);
  const [code, setCode] = useState(defaultTool.handler);
  const [parameters, setParameters] = useState<Parameter[]>([]);

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        description: tool.description,
        handler: tool.handler,
        inputSchema: tool.inputSchema,
        enabled: tool.enabled,
      });
      setCode(tool.handler);

      const props = tool.inputSchema.properties || {};
      const required = tool.inputSchema.required || [];
      const params: Parameter[] = Object.entries(props).map(([name, prop]) => ({
        name,
        type: prop.type as any,
        description: prop.description,
        required: required.includes(name),
      }));
      setParameters(params);
    } else {
      setFormData(defaultTool);
      setCode(defaultTool.handler);
      setParameters([]);
    }
  }, [tool, open]);

  const addParameter = () => {
    setParameters([...parameters, { name: '', type: 'string', description: '', required: false }]);
  };

  const updateParameter = (index: number, field: keyof Parameter, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert(t('tools.pleaseEnterName'));
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      alert(t('tools.nameFormatError'));
      return;
    }

    try {
      new Function('return ' + code);
    } catch (e: any) {
      alert(t('tools.syntaxError', { message: e.message }));
      return;
    }

    const properties: Record<string, { type: 'string' | 'number' | 'boolean' | 'object' | 'array'; description: string }> = {};
    const required: string[] = [];
    parameters.forEach((p) => {
      if (p.name) {
        properties[p.name] = { type: p.type, description: p.description };
        if (p.required) required.push(p.name);
      }
    });

    onSave({
      id: tool?.id || crypto.randomUUID(),
      name: formData.name,
      pattern: `/mcp/${formData.name}`,
      description: formData.description,
      handler: code,
      inputSchema: { type: 'object', properties, required },
      enabled: formData.enabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-screen h-screen max-w-none rounded-none flex flex-col p-4">
        <DialogHeader>
          <DialogTitle>{tool ? t('tools.editTool') : t('tools.addTool')}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Top/Left: Form */}
          <div className="h-1/2 md:h-full md:w-80 flex flex-col gap-4 overflow-auto px-2 pb-2 md:pb-0">
            <div className="space-y-2">
              <Label>{t('tools.name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('tools.namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('tools.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('tools.descriptionPlaceholder')}
                className="auto-resize min-h-[1.5rem] max-h-[15rem] resize-none"
              />
            </div>

            {/* Parameters */}
            <div className="space-y-2 flex-1 overflow-auto">
              <div className="flex items-center justify-between sticky top-0 bg-background py-1">
                <Label>{t('tools.parameters')}</Label>
                <Button size="sm" variant="outline" onClick={addParameter}>
                  <Plus className="h-3 w-3 mr-1" />
                  {t('common.add')}
                </Button>
              </div>
              <div className="space-y-2">
                {parameters.map((param, index) => (
                  <div key={index} className="space-y-2 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Input
                        className="flex-1 h-8"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        placeholder={t('tools.paramName')}
                      />
                      <Select
                        value={param.type}
                        onValueChange={(v) => updateParameter(index, 'type', v as any)}
                      >
                        <SelectTrigger className="h-8 w-20 md:w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">{t('tools.paramTypeString')}</SelectItem>
                          <SelectItem value="number">{t('tools.paramTypeNumber')}</SelectItem>
                          <SelectItem value="boolean">{t('tools.paramTypeBoolean')}</SelectItem>
                          <SelectItem value="object">{t('tools.paramTypeObject')}</SelectItem>
                          <SelectItem value="array">{t('tools.paramTypeArray')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center shrink-0" title={t('tools.paramRequired')}>
                        <Switch
                          checked={param.required}
                          onCheckedChange={(v) => updateParameter(index, 'required', v)}
                        />
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={() => removeParameter(index)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      className="w-full h-8"
                      value={param.description}
                      onChange={(e) => updateParameter(index, 'description', e.target.value)}
                      placeholder={t('tools.paramDescription')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-border shrink-0" />
          <div className="md:hidden h-px bg-border shrink-0" />

          {/* Bottom/Right: Code Editor */}
          <div className="h-1/2 md:h-full md:flex-1 flex flex-col min-w-0 min-h-0">
            <Label className="mb-2 shrink-0">
              {t('tools.handler')}
              <span className="text-muted-foreground font-normal text-xs ml-2">
                {t('tools.handlerParams')}
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
