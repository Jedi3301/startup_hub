"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  ButtonGroup,
} from "@nextui-org/react";
import { Search, SlidersHorizontal, ArrowUpDown, Check, X } from "lucide-react";

interface FilterPanelProps {
  onSearchChange: (search: string) => void;
  onTechChange: (tags: string[]) => void;
  onSortChange: (sort: "votes" | "newest") => void;
}

const AVAILABLE_TECHS = [
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Next.js",
  "Prisma",
  "PostgreSQL",
  "AI",
  "Machine Learning",
  "FinTech",
  "SaaS",
  "Web3",
  "Healthcare",
];

export function FilterPanel({
  onSearchChange,
  onTechChange,
  onSortChange,
}: FilterPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes");

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search, onSearchChange]);

  const handleTechSelect = (key: React.Key) => {
    const tech = String(key);
    const updated = new Set(selectedTechs);
    if (updated.has(tech)) {
      updated.delete(tech);
    } else {
      updated.add(tech);
    }
    setSelectedTechs(updated);
    onTechChange(Array.from(updated));
  };

  const clearTech = (tech: string) => {
    const updated = new Set(selectedTechs);
    updated.delete(tech);
    setSelectedTechs(updated);
    onTechChange(Array.from(updated));
  };

  const handleSort = (sortType: "votes" | "newest") => {
    setSortBy(sortType);
    onSortChange(sortType);
  };

  return (
    <div className="w-full bg-background/50 backdrop-blur-md border border-divider p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Debounced Search bar */}
        <div className="w-full md:max-w-md">
          <Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search startups by name, description..."
            startContent={<Search className="text-default-400 w-4 h-4" />}
            variant="bordered"
            classNames={{
              inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary",
            }}
          />
        </div>

        {/* Filters and sorting */}
        <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap gap-3 items-center justify-end">
          {/* Tech dropdown */}
          <Dropdown closeOnSelect={false}>
            <DropdownTrigger>
              <Button
                variant="bordered"
                startContent={<SlidersHorizontal className="w-4 h-4" />}
                className="border-divider text-default-600 hover:text-foreground font-semibold"
              >
                Technologies
                {selectedTechs.size > 0 && (
                  <Chip size="sm" color="primary" variant="solid" className="ml-1">
                    {selectedTechs.size}
                  </Chip>
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter technologies"
              selectionMode="multiple"
              selectedKeys={selectedTechs}
              onAction={handleTechSelect}
              className="max-h-60 overflow-y-auto"
            >
              {AVAILABLE_TECHS.map((tech) => (
                <DropdownItem
                  key={tech}
                  className="font-medium"
                  endContent={
                    selectedTechs.has(tech) ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : null
                  }
                >
                  {tech}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Sort By Toggle */}
          <div className="flex items-center gap-2 border border-divider rounded-xl p-1 bg-default-100/50">
            <Button
              size="sm"
              variant={sortBy === "votes" ? "solid" : "light"}
              color={sortBy === "votes" ? "primary" : "default"}
              onClick={() => handleSort("votes")}
              className="font-semibold text-xs rounded-lg"
              startContent={<ArrowUpDown className="w-3 h-3" />}
            >
              Most Upvoted
            </Button>
            <Button
              size="sm"
              variant={sortBy === "newest" ? "solid" : "light"}
              color={sortBy === "newest" ? "primary" : "default"}
              onClick={() => handleSort("newest")}
              className="font-semibold text-xs rounded-lg"
            >
              Newest
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Tags Display */}
      {selectedTechs.size > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-divider items-center">
          <span className="text-xs font-semibold text-default-400">
            Active Filters:
          </span>
          {Array.from(selectedTechs).map((tech) => (
            <Chip
              key={tech}
              size="sm"
              onClose={() => clearTech(tech)}
              variant="flat"
              color="secondary"
              className="font-semibold"
            >
              {tech}
            </Chip>
          ))}
          <Button
            size="sm"
            variant="light"
            onClick={() => {
              setSelectedTechs(new Set());
              onTechChange([]);
            }}
            className="text-danger hover:underline h-7 text-xs font-semibold px-2"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
