"use client";

import { cn } from "@/lib/utils";
import { X, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, KeyboardEvent } from "react";

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface TagInputProps {
    tags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    suggestions?: Tag[];
    placeholder?: string;
    maxTags?: number;
}

const tagColors = [
    "#10b981", "#f43f5e", "#8b5cf6", "#f59e0b", "#3b82f6",
    "#ec4899", "#14b8a6", "#6366f1", "#84cc16", "#06b6d4",
];

function getRandomColor() {
    return tagColors[Math.floor(Math.random() * tagColors.length)];
}

export function TagInput({
    tags,
    onTagsChange,
    suggestions = [],
    placeholder = "Add tag...",
    maxTags = 10,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = suggestions.filter(
        s => s.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.find(t => t.id === s.id)
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue.trim());
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1].id);
        }
    };

    const addTag = (name: string) => {
        if (tags.length >= maxTags) return;

        const existingSuggestion = suggestions.find(
            s => s.name.toLowerCase() === name.toLowerCase()
        );

        const newTag: Tag = existingSuggestion || {
            id: crypto.randomUUID(),
            name,
            color: getRandomColor(),
        };

        if (!tags.find(t => t.name.toLowerCase() === name.toLowerCase())) {
            onTagsChange([...tags, newTag]);
        }
        setInputValue("");
        setShowSuggestions(false);
    };

    const removeTag = (id: string) => {
        onTagsChange(tags.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-input bg-background min-h-[42px]">
                {tags.map(tag => (
                    <Badge
                        key={tag.id}
                        variant="secondary"
                        className="gap-1 px-2 py-1 rounded-lg"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
                    >
                        <Hash className="h-3 w-3" />
                        {tag.name}
                        <button
                            onClick={() => removeTag(tag.id)}
                            className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[100px] bg-transparent text-sm outline-none"
                    disabled={tags.length >= maxTags}
                />
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 rounded-xl border border-border glass ios-shadow max-h-48 overflow-y-auto">
                    {filteredSuggestions.map(suggestion => (
                        <button
                            key={suggestion.id}
                            onClick={() => addTag(suggestion.name)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 ios-transition first:rounded-t-xl last:rounded-b-xl"
                        >
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: suggestion.color }}
                            />
                            {suggestion.name}
                        </button>
                    ))}
                </div>
            )}

            {tags.length >= maxTags && (
                <p className="text-xs text-muted-foreground">
                    Maximum {maxTags} tags allowed
                </p>
            )}
        </div>
    );
}

interface TagDisplayProps {
    tags: Tag[];
    size?: "sm" | "md";
    onClick?: (tag: Tag) => void;
}

export function TagDisplay({ tags, size = "sm", onClick }: TagDisplayProps) {
    if (tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
                <Badge
                    key={tag.id}
                    variant="secondary"
                    className={cn(
                        "gap-1 rounded-md cursor-pointer ios-transition hover:scale-105",
                        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
                    )}
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    onClick={() => onClick?.(tag)}
                >
                    <Hash className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
                    {tag.name}
                </Badge>
            ))}
        </div>
    );
}

// Tag filter component for transaction lists
interface TagFilterProps {
    availableTags: Tag[];
    selectedTags: string[];
    onSelectionChange: (tagIds: string[]) => void;
}

export function TagFilter({ availableTags, selectedTags, onSelectionChange }: TagFilterProps) {
    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onSelectionChange(selectedTags.filter(id => id !== tagId));
        } else {
            onSelectionChange([...selectedTags, tagId]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                    <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs ios-transition",
                            "border",
                            isSelected
                                ? "border-current"
                                : "border-transparent hover:border-current"
                        )}
                        style={{
                            backgroundColor: isSelected ? `${tag.color}30` : `${tag.color}10`,
                            color: tag.color,
                        }}
                    >
                        <Hash className="h-3 w-3" />
                        {tag.name}
                    </button>
                );
            })}
            {selectedTags.length > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectionChange([])}
                    className="text-xs h-7"
                >
                    Clear all
                </Button>
            )}
        </div>
    );
}
