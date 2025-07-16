"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePromocode } from "@/context/promocode-context";
import { PromocodeRule, Promocode } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const RULE_TYPES = [
  { value: "gender", label: "Gender" },
  { value: "expiration", label: "Expiration Date" },
  { value: "maxUses", label: "Max Uses (Global)" },
  { value: "maxUsesPerUser", label: "Max Uses Per User" },
  { value: "timeOfDay", label: "Time of Day" },
] as const;

type RuleType = (typeof RULE_TYPES)[number]["value"];

type RuleDraft =
  | { type: "gender"; gender: "male" | "female" }
  | { type: "expiration"; expiresAt: string }
  | { type: "maxUses"; maxUses: number }
  | { type: "maxUsesPerUser"; maxUses: number }
  | { type: "timeOfDay"; from: string; to: string };

function emptyRule(type: RuleType): RuleDraft {
  switch (type) {
    case "gender":
      return { type, gender: "male" };
    case "expiration":
      return { type, expiresAt: "" };
    case "maxUses":
      return { type, maxUses: 1 };
    case "maxUsesPerUser":
      return { type, maxUses: 1 };
    case "timeOfDay":
      return { type, from: "00:00", to: "23:59" };
    default:
      throw new Error("Unknown rule type");
  }
}

export function CreatePromocodeButton() {
  const { create } = usePromocode();
  const [open, setOpen] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"amount" | "percent">(
    "amount",
  );
  const [discountValue, setDiscountValue] = useState<number>(1);
  const [active, setActive] = useState(true);
  const [rules, setRules] = useState<RuleDraft[]>([]);
  const [addingRuleType, setAddingRuleType] = useState<RuleType | "">("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setCode("");
    setDescription("");
    setDiscountType("amount");
    setDiscountValue(1);
    setActive(true);
    setRules([]);
    setAddingRuleType("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!code.trim()) {
        toast({ title: "Code is required", variant: "destructive" });
        return;
      }
      if (!discountValue || discountValue <= 0) {
        toast({
          title: "Discount value must be positive",
          variant: "destructive",
        });
        return;
      }
      const promocode: Omit<
        Promocode,
        "id" | "createdAt" | "usageCount" | "usagePerUser"
      > = {
        code: code.trim(),
        description: description.trim() || undefined,
        discountType,
        discountValue,
        active,
        createdBy: undefined,
        rules: rules.length > 0 ? rules : undefined,
      };
      await create(promocode);
      toast({ title: "Promocode created" });
      setOpen(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  }

  function handleAddRule() {
    if (addingRuleType) {
      setRules((prev) => [...prev, emptyRule(addingRuleType as RuleType)]);
      setAddingRuleType("");
    }
  }

  function handleRuleChange(idx: number, updated: Partial<RuleDraft>) {
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        // Type-safe merge based on rule type
        switch (r.type) {
          case "gender":
            return {
              ...r,
              ...(updated as Partial<Extract<RuleDraft, { type: "gender" }>>),
            };
          case "expiration":
            return {
              ...r,
              ...(updated as Partial<
                Extract<RuleDraft, { type: "expiration" }>
              >),
            };
          case "maxUses":
            return {
              ...r,
              ...(updated as Partial<Extract<RuleDraft, { type: "maxUses" }>>),
            };
          case "maxUsesPerUser":
            return {
              ...r,
              ...(updated as Partial<
                Extract<RuleDraft, { type: "maxUsesPerUser" }>
              >),
            };
          case "timeOfDay":
            return {
              ...r,
              ...(updated as Partial<
                Extract<RuleDraft, { type: "timeOfDay" }>
              >),
            };
          default:
            return r;
        }
      }),
    );
  }

  function handleRemoveRule(idx: number) {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex justify-end my-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="flex">
            Create <PlusCircle className="ms-2 h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="max-w-md w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
            <SheetHeader>
              <SheetTitle>Create Promocode</SheetTitle>
              <SheetDescription>
                Configure a new promocode with flexible rules.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoFocus
                  required
                  className="tracking-widest font-mono"
                  maxLength={16}
                  placeholder="E.g. SAVE20"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Discount Type</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant={
                        discountType === "amount" ? "default" : "outline"
                      }
                      onClick={() => setDiscountType("amount")}
                      size="sm"
                    >
                      Amount
                    </Button>
                    <Button
                      type="button"
                      variant={
                        discountType === "percent" ? "default" : "outline"
                      }
                      onClick={() => setDiscountType("percent")}
                      size="sm"
                    >
                      Percent
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="discountValue">Value</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min={1}
                    max={discountType === "percent" ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                    placeholder={
                      discountType === "percent" ? "e.g. 10" : "e.g. 5"
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active">{active ? "Active" : "Inactive"}</Label>
              </div>
              <div>
                <Label>Rules</Label>
                <div className="flex flex-col gap-2 mt-2">
                  {rules.length === 0 && (
                    <span className="text-muted-foreground text-xs">
                      No rules added
                    </span>
                  )}
                  {(rules as RuleDraft[]).map((rule, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-2 border rounded px-2 py-2 bg-muted",
                        "flex-wrap",
                      )}
                    >
                      <Badge variant="secondary" className="mr-2">
                        {(() => {
                          switch (rule.type) {
                            case "gender":
                              return "Gender";
                            case "expiration":
                              return "Expiration";
                            case "maxUses":
                              return "Max Uses";
                            case "maxUsesPerUser":
                              return "Max/User";
                            case "timeOfDay":
                              return "Time of Day";
                            default:
                              return (rule as any).type;
                          }
                        })()}
                      </Badge>
                      {/* Rule-specific fields */}
                      {rule.type === "gender" && (
                        <>
                          <select
                            className="border rounded px-2 py-1"
                            value={rule.gender}
                            onChange={(e) =>
                              handleRuleChange(idx, {
                                gender: e.target.value as "male" | "female",
                              })
                            }
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </>
                      )}
                      {rule.type === "expiration" && (
                        <>
                          <Input
                            type="date"
                            value={
                              rule.expiresAt ? rule.expiresAt.slice(0, 10) : ""
                            }
                            onChange={(e) =>
                              handleRuleChange(idx, {
                                expiresAt: e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : "",
                              })
                            }
                            className="w-auto"
                          />
                        </>
                      )}
                      {rule.type === "maxUses" && (
                        <>
                          <Input
                            type="number"
                            min={1}
                            value={rule.maxUses}
                            onChange={(e) =>
                              handleRuleChange(idx, {
                                maxUses: Number(e.target.value),
                              })
                            }
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">
                            total
                          </span>
                        </>
                      )}
                      {rule.type === "maxUsesPerUser" && (
                        <>
                          <Input
                            type="number"
                            min={1}
                            value={rule.maxUses}
                            onChange={(e) =>
                              handleRuleChange(idx, {
                                maxUses: Number(e.target.value),
                              })
                            }
                            className="w-20"
                          />
                          <span className="text-xs text-muted-foreground">
                            per user
                          </span>
                        </>
                      )}
                      {rule.type === "timeOfDay" && (
                        <>
                          <span className="text-xs">From</span>
                          <Input
                            type="time"
                            value={rule.from}
                            onChange={(e) =>
                              handleRuleChange(idx, { from: e.target.value })
                            }
                            className="w-24"
                          />
                          <span className="text-xs">To</span>
                          <Input
                            type="time"
                            value={rule.to}
                            onChange={(e) =>
                              handleRuleChange(idx, { to: e.target.value })
                            }
                            className="w-24"
                          />
                        </>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleRemoveRule(idx)}
                        tabIndex={-1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={addingRuleType}
                      onChange={(e) =>
                        setAddingRuleType(e.target.value as RuleType | "")
                      }
                    >
                      <option value="">Add rule...</option>
                      {RULE_TYPES.filter(
                        (rt) =>
                          !rules.some(
                            (r) => (r as RuleDraft).type === rt.value,
                          ),
                      ).map((rt) => (
                        <option key={rt.value} value={rt.value}>
                          {rt.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!addingRuleType}
                      onClick={handleAddRule}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
