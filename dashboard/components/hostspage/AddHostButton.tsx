"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";
import { t } from "@/lib/settingsI18n";

interface AddHostButtonProps {
  onClick: () => void;
}

export default function AddHostButton({ onClick }: AddHostButtonProps) {
  const language = useLanguagePreference();
  return (
    <Button onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      {t(language, "hosts.add")}
    </Button>
  );
}
