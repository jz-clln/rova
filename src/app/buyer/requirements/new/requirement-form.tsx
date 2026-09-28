// src/app/buyer/requirements/new/requirement-form.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { createRequirement, type RequirementState } from "../actions";

interface Props {
  commodities: { id: string; name: string }[];
  today: string;
  defaults: { receiver_name: string; receiver_phone: string };
}

// "Save as draft" comes first in the DOM on purpose: pressing Enter inside a text
// field submits the first submit button, and an accidental Enter must never publish.
function SubmitButtons({ disabled }: { disabled: boolean }) {
  const { pending, data } = useFormStatus();
  const intent = data?.get("intent");
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="submit" name="intent" value="draft" variant="secondary" disabled={pending || disabled}>
        {pending && intent === "draft" ? "Saving…" : "Save as draft"}
      </Button>
      <Button type="submit" name="intent" value="open" disabled={pending || disabled}>
        {pending && intent === "open" ? "Publishing…" : "Publish requirement"}
      </Button>
    </div>
  );
}

export function RequirementForm({ commodities, today, defaults }: Props) {
  const [state, action] = useActionState<RequirementState, FormData>(createRequirement, { error: "" });
  const v = state.values;
  const noCommodities = commodities.length === 0;

  return (
    <form action={action} className="space-y-6">
      {noCommodities ? (
        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          No produce types have been set up yet. Ask a Rova admin to add them before you post a requirement.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="commodity_id">Produce</Label>
          {/* Keyed so a failed submit restores the choice: React doesn't re-apply a changed defaultValue to a select. */}
          <NativeSelect
            key={v?.commodity_id ?? "new"}
            id="commodity_id"
            name="commodity_id"
            required
            defaultValue={v?.commodity_id ?? ""}
            disabled={noCommodities}
          >
            <option value="" disabled>Choose produce…</option>
            {commodities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="required_quantity_kg">Quantity needed (kg)</Label>
          <Input
            id="required_quantity_kg"
            name="required_quantity_kg"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            required
            placeholder="1000"
            defaultValue={v?.required_quantity_kg}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="delivery_date">Delivery date</Label>
          <Input id="delivery_date" name="delivery_date" type="date" min={today} required defaultValue={v?.delivery_date} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="window_start">Receiving opens</Label>
          <Input id="window_start" name="window_start" type="time" required defaultValue={v?.window_start} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="window_end">Receiving closes</Label>
          <Input id="window_end" name="window_end" type="time" required defaultValue={v?.window_end} />
        </div>
        <p className="text-xs text-[#8a988f] sm:col-span-3">
          Trucks must arrive inside this window. Times are Philippine time.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination_address">Delivery address</Label>
        <Textarea
          id="destination_address"
          name="destination_address"
          required
          maxLength={500}
          rows={2}
          placeholder="Warehouse or market name, street, city"
          defaultValue={v?.destination_address}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="receiver_name">Receiver name</Label>
          <Input
            id="receiver_name"
            name="receiver_name"
            required
            maxLength={200}
            defaultValue={v?.receiver_name ?? defaults.receiver_name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="receiver_phone">
            Receiver phone <span className="font-normal text-[#8a988f]">(optional)</span>
          </Label>
          <Input
            id="receiver_phone"
            name="receiver_phone"
            type="tel"
            maxLength={30}
            placeholder="09XX XXX XXXX"
            defaultValue={v?.receiver_phone ?? defaults.receiver_phone}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">
          Product notes <span className="font-normal text-[#8a988f]">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          name="notes"
          maxLength={500}
          rows={3}
          placeholder="Grade, size, ripeness, packaging…"
          defaultValue={v?.notes}
        />
      </div>

      <div aria-live="polite" aria-atomic="true">
        {state.error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
            {state.error}
          </p>
        ) : null}
      </div>

      <SubmitButtons disabled={noCommodities} />
    </form>
  );
}