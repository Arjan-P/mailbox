import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-messages";
import type { ErrorResponse } from "@/types/api";

export function ProfileError({ error }: { error: ErrorResponse["error"] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-sm text-destructive">{getErrorMessage(error.code)}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh
      </Button>
    </div>
  );
}
