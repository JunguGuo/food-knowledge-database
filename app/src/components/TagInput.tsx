"use client";

import { useState, KeyboardEvent, useRef } from "react";

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableSuggestions = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const showDropdown = focused && availableSuggestions.length > 0;

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
    setHighlightIdx(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, availableSuggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (highlightIdx >= 0 && availableSuggestions[highlightIdx]) {
        addTag(availableSuggestions[highlightIdx]);
      } else if (input.trim()) {
        addTag(input);
      }
      return;
    }
    if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="tag-input-wrapper">
      <div
        className="tag-input-container"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span key={tag} className="tag-input-tag">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-input-field"
          value={input}
          onChange={(e) => { setInput(e.target.value); setHighlightIdx(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={value.length === 0 ? placeholder : ""}
        />
      </div>
      {showDropdown && (
        <div className="tag-suggestions">
          {availableSuggestions.map((s, i) => (
            <div
              key={s}
              className={`tag-suggestion-item${i === highlightIdx ? " highlighted" : ""}`}
              onMouseDown={() => addTag(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
