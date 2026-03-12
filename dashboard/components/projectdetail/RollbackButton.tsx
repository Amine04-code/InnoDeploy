"use client";

import { RotateCcw, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RollbackButtonProps {
  onRollback: () => Promise<void>;
}

export default function RollbackButton({ onRollback }: RollbackButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    performRollback();
  };

  const performRollback = async () => {
    setLoading(true);
    try {
      await onRollback();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={confirming ? "destructive" : "outline"}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4 mr-2" />
        )}
        {loading ? "Rolling back…" : confirming ? "Confirm Rollback?" : "Rollback"}
      </Button>
      {confirming && !loading && (
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      )}
    </div>
  );
}
