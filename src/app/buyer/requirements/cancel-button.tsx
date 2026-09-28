// src/app/buyer/requirements/cancel-button.tsx
"use client";

import { cancelRequirement } from "./actions";

// Cancelling is final (there's no reopen), so ask first.
export function CancelRequirementButton({ id }: { id: string }) {
  return (
    <form
      action={cancelRequirement}
      onSubmit={(event) => {
        if (!window.confirm("Cancel this requirement? This can't be undone.")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs font-semibold text-[#b5533f] hover:underline">
        Cancel
      </button>
    </form>
  );
}