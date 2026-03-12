"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2, Pencil, Plus, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Secret } from "@/types";

interface SecretsListProps {
  secrets: Secret[];
  onAdd: (key: string, value: string) => void;
  onEdit: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}

export default function SecretsList({ secrets, onAdd, onEdit, onDelete }: SecretsListProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEdit = (secret: Secret) => {
    setEditingId(secret.id);
    setEditValue(secret.value);
  };

  const saveEdit = (id: string) => {
    onEdit(id, editValue);
    setEditingId(null);
    setEditValue("");
  };

  const handleAdd = () => {
    if (newKey.trim() && newValue.trim()) {
      onAdd(newKey.trim(), newValue.trim());
      setNewKey("");
      setNewValue("");
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Secrets & Environment Variables</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {adding && (
          <div className="flex gap-2 items-center pb-2 border-b">
            <Input
              placeholder="KEY"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="font-mono text-xs h-8"
            />
            <Input
              placeholder="value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="font-mono text-xs h-8"
            />
            <Button size="sm" variant="ghost" onClick={handleAdd}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {secrets.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground py-2">No secrets configured.</p>
        )}

        {secrets.map((secret) => (
          <div
            key={secret.id}
            className="flex items-center gap-2 py-1.5 border-b last:border-0"
          >
            <span className="font-mono text-xs font-semibold min-w-[120px]">
              {secret.key}
            </span>

            {editingId === secret.id ? (
              <div className="flex-1 flex gap-2 items-center">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="font-mono text-xs h-7"
                />
                <Button size="sm" variant="ghost" onClick={() => saveEdit(secret.id)}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1 font-mono text-xs text-muted-foreground truncate">
                  {revealed.has(secret.id) ? secret.value : "••••••••••••"}
                </span>
                <button
                  onClick={() => toggleReveal(secret.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={revealed.has(secret.id) ? "Hide" : "Reveal"}
                >
                  {revealed.has(secret.id) ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={() => startEdit(secret)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(secret.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
