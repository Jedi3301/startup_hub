"use client";

import React, { useState } from "react";
import { Button, Switch, Divider, Select, SelectItem, cn } from "@nextui-org/react";
import { ArrowUp, ArrowDown, Palette, Sparkles, LayoutGrid, Eye, Check } from "lucide-react";
import { CustomizationLayout } from "@/lib/types/startup";

interface LayoutBuilderProps {
  initialLayout: CustomizationLayout;
  onSaveAction: (updatedLayout: CustomizationLayout) => Promise<void>;
}

const COLOR_PRESETS = [
  { name: "Emerald Green", value: "#10b981" },
  { name: "Sleek Indigo", value: "#6366f1" },
  { name: "Classic Blue", value: "#3b82f6" },
  { name: "Modern Purple", value: "#8b5cf6" },
  { name: "Amber Warning", value: "#f59e0b" },
  { name: "Rose Hot", value: "#f43f5e" },
];

export function LayoutBuilder({ initialLayout, onSaveAction }: LayoutBuilderProps) {
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "glass">(
    initialLayout.theme || "dark"
  );
  const [primaryColor, setPrimaryColor] = useState(initialLayout.primaryColor || "#3b82f6");
  const [layoutStyle, setLayoutStyle] = useState<"classic" | "modern" | "minimal">(
    initialLayout.layoutStyle || "modern"
  );
  const [showMetrics, setShowMetrics] = useState(initialLayout.showMetrics !== false);
  
  // Section block order state
  const [sections, setSections] = useState<string[]>(["Product Overview", "Performance Metrics", "Team Bio"]);
  const [isSaving, setIsSaving] = useState(false);

  const moveSection = (index: number, direction: "up" | "down") => {
    const updated = [...sections];
    if (direction === "up" && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === "down" && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setSections(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: CustomizationLayout = {
        theme: themeMode,
        primaryColor,
        accentColor: primaryColor + "dd", // Subtle variance
        layoutStyle,
        showMetrics,
      };
      await onSaveAction(payload);
    } catch (error) {
      console.error("Save config error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background/60 backdrop-blur-md border border-divider rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Header title */}
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" style={{ color: primaryColor }} />
        <h3 className="font-bold text-lg">Customization Layout Editor</h3>
      </div>

      <Divider />

      {/* Theme customization */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-default-400 uppercase tracking-wider">
          Theme Preset Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["light", "dark", "glass"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setThemeMode(t)}
              className={cn(
                "py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-all",
                themeMode === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-divider hover:border-foreground/30 bg-default-50"
              )}
              style={{
                borderColor: themeMode === t ? primaryColor : undefined,
                color: themeMode === t ? primaryColor : undefined,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Colors customization */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-default-400 uppercase tracking-wider block">
          Primary Accent Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setPrimaryColor(preset.value)}
              className="w-8 h-8 rounded-full border border-divider flex items-center justify-center transition-all hover:scale-105"
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            >
              {primaryColor === preset.value && (
                <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Style dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-default-400 uppercase tracking-wider block">
          Page Layout Template
        </label>
        <Select
          size="sm"
          variant="bordered"
          selectedKeys={[layoutStyle]}
          onChange={(e) => setLayoutStyle(e.target.value as any)}
          classNames={{ trigger: "border-divider hover:border-foreground/30" }}
        >
          <SelectItem key="modern" textValue="Modern (Metrics Focus First)">
            Modern (Metrics Focus First)
          </SelectItem>
          <SelectItem key="classic" textValue="Classic (Overview First)">
            Classic (Overview First)
          </SelectItem>
          <SelectItem key="minimal" textValue="Minimal (Overview & Bio Only)">
            Minimal (Overview & Bio Only)
          </SelectItem>
        </Select>
      </div>

      {/* Toggle controls */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">Show Funding Metrics</span>
            <span className="text-xs text-default-400">Display stage, MRR, and growth publicly.</span>
          </div>
          <Switch
            isSelected={showMetrics}
            onValueChange={setShowMetrics}
            color="primary"
            style={{ "--primary": primaryColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Dynamic Section Ordering */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-default-400 uppercase tracking-wider block">
          Page Section Ordering
        </label>
        <div className="space-y-2">
          {sections.map((section, idx) => (
            <div
              key={section}
              className="flex items-center justify-between p-3 bg-default-100/50 border border-divider rounded-xl"
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-default-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground">{section}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, "up")}
                  className={cn(idx === 0 ? "opacity-30 cursor-not-allowed" : "text-default-500")}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  disabled={idx === sections.length - 1}
                  onClick={() => moveSection(idx, "down")}
                  className={cn(
                    idx === sections.length - 1 ? "opacity-30 cursor-not-allowed" : "text-default-500"
                  )}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action triggers */}
      <Button
        onClick={handleSave}
        isLoading={isSaving}
        color="primary"
        className="w-full font-bold shadow-md shadow-primary/20 text-white"
        style={{ backgroundColor: primaryColor }}
        endContent={<Sparkles className="w-4 h-4" />}
      >
        Update Layout Configuration
      </Button>
    </div>
  );
}
