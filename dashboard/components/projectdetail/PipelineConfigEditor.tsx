"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineConfigEditorProps {
  config: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function PipelineConfigEditor({
  config,
  readOnly = true,
  onChange,
}: PipelineConfigEditorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>.innodeploy.yml</span>
          <span className="text-xs font-normal text-muted-foreground">
            {readOnly ? "Read-only" : "Editable"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          value={config}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className="w-full min-h-[300px] rounded-md border bg-muted/50 p-4 font-mono text-xs leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed"
          disabled={readOnly}
        />
      </CardContent>
    </Card>
  );
}
