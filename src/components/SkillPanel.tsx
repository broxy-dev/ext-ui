import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Editor from '@monaco-editor/react';
import { useLocale } from '@/hooks/useLocale';
import { useCurrentTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { FileCode, Copy, Download, Info, Lightbulb } from 'lucide-react';
import type { AppState, SkillConfig } from '@/types';

interface SkillPanelProps {
  state: AppState;
  actions: {
    saveSkillConfig: (skillConfig: SkillConfig) => Promise<void>;
  };
}

const defaultSkillConfig: SkillConfig = {
  name: '',
  description: '',
  usageNotes: '',
};

function generateSkillContent(
  skillConfig: SkillConfig,
  mcpName: string,
  webId: string,
  workerDomain: string,
  authEnabled: boolean,
  authToken: string
): string {
  const skillName = skillConfig.name || mcpName || 'MCP Server';
  const skillDescription = skillConfig.description || 'Use this skill to interact with the MCP server via HTTP requests.';

  let content = `---
name: ${skillName}
description: ${skillDescription}
---

# ${skillName}

## Parameters

Define these parameters for all API requests:
- \`baseURL\`: \`https://${workerDomain}\`
- \`webId\`: \`${webId}\`
`;

  if (authEnabled) {
    content += `- \`authToken\`: \`${authToken}\`
`;
  }

  content += `
## Workflow

1. **Check Service Status** → \`GET /api/{webId}/mcp/config\`
2. **List Available Tools** → \`GET /api/{webId}/mcp/tools/list\`
3. **Execute Tool** → \`POST /api/{webId}/mcp/{toolName}\`

`;

  if (authEnabled) {
    content += `## Authentication

Include this header in ALL requests:

\`\`\`
Authorization: Bearer {authToken}
\`\`\`

`;
  }

  content += `## API Reference

### Check Service Status

\`\`\`
GET {baseURL}/api/{webId}/mcp/config
\`\`\`

Returns service configuration and confirms the service is online.

### List Available Tools

\`\`\`
GET {baseURL}/api/{webId}/mcp/tools/list
\`\`\`

Returns a list of all available tools with their input schemas.

### Execute a Tool

\`\`\`
POST {baseURL}/api/{webId}/mcp/{toolName}
Content-Type: application/json

{"argName": "value"}
\`\`\`

Execute a tool with arguments as JSON body.

`;

  if (skillConfig.usageNotes?.trim()) {
    content += `## Usage Notes

${skillConfig.usageNotes}
`;
  }

  return content;
}

export function SkillPanel({ state, actions }: SkillPanelProps) {
  const { t } = useLocale();
  const theme = useCurrentTheme();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<SkillConfig>(() => {
    const config = state.skillConfig || defaultSkillConfig;
    return {
      ...config,
      name: config.name || state.mcpConfig?.name || '',
    };
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const config = state.skillConfig || defaultSkillConfig;
    const configToUse = {
      ...config,
      name: config.name || state.mcpConfig?.name || '',
    };
    setFormData(configToUse);
    setHasChanges(false);
  }, [state.skillConfig, state.mcpConfig?.name]);

  const skillContent = useMemo(() => {
    return generateSkillContent(
      formData,
      state.mcpConfig?.name || '',
      state.webId,
      state.workerDomain,
      state.authEnabled,
      state.authToken
    );
  }, [formData, state.mcpConfig?.name, state.webId, state.workerDomain, state.authEnabled, state.authToken]);

  const handleSave = async () => {
    await actions.saveSkillConfig(formData);
    setHasChanges(false);
    toast({
      title: t('toast.saveSuccess'),
      description: t('skill.configSaved'),
      variant: 'success',
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(skillContent);
      toast({
        title: t('toast.copySuccess'),
        description: t('skill.contentCopied'),
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

  const handleDownload = () => {
    const blob = new Blob([skillContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SKILL.md';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t('toast.exportSuccess'),
      description: t('skill.fileDownloaded'),
      variant: 'success',
    });
  };

  const updateField = (field: keyof SkillConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const resolvedName = formData.name || state.mcpConfig?.name || '';

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4" />
          <span className="text-sm font-medium">{t('skill.title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" />
            {t('common.copy')}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            {t('skill.download')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            {t('common.save')}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 border-r flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>{t('skill.name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder={state.mcpConfig?.name || t('skill.namePlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('skill.nameHint')} {state.mcpConfig?.name && !formData.name && (
                    <span className="text-primary">{t('skill.usingDefault', { name: state.mcpConfig.name })}</span>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('skill.description')}</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={t('skill.descriptionPlaceholder')}
                  className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md resize-y bg-background"
                />
                <p className="text-xs text-muted-foreground">{t('skill.descriptionHint')}</p>
              </div>

              <div className="space-y-2">
                <Label>{t('skill.usageNotes')}</Label>
                <textarea
                  value={formData.usageNotes}
                  onChange={(e) => updateField('usageNotes', e.target.value)}
                  placeholder={t('skill.usageNotesPlaceholder')}
                  className="w-full min-h-[120px] px-3 py-2 text-sm border rounded-md resize-y bg-background"
                />
                <p className="text-xs text-muted-foreground">{t('skill.usageNotesHint')}</p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-2">
                <div className="font-medium flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {t('skill.guide.title')}
                </div>
                <ul className="space-y-1 text-muted-foreground pl-1">
                  <li>• {t('skill.guide.usage')}</li>
                  <li>• {t('skill.guide.example')}</li>
                </ul>
                <div className="flex items-start gap-1 text-amber-600 dark:text-amber-500 pt-1">
                  <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{t('skill.guide.tip')}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="w-2/3 flex flex-col">
          <div className="px-4 py-2 border-b bg-muted/50 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">SKILL.md</span>
            {resolvedName && (
              <span className="text-xs text-muted-foreground">name: {resolvedName}</span>
            )}
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="markdown"
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              value={skillContent}
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
      </div>
    </div>
  );
}
