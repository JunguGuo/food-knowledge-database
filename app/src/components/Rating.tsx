"use client";

export function RatingDisplay({ value, showValue = false }: { value: number | null; showValue?: boolean }) {
  if (value === null) return null;
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star${i > value ? " empty" : ""}`}>
          ★
        </span>
      ))}
      {showValue && <span className="rating-value">{value.toFixed(1)}</span>}
    </div>
  );
}

export function RatingInput({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="rating-input">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={value !== null && i <= value ? "filled" : ""}
          onClick={() => onChange(value === i ? null : i)}
        >
          ★
        </button>
      ))}
      {value !== null && (
        <button
          type="button"
          style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: 6 }}
          onClick={() => onChange(null)}
        >
          Clear
        </button>
      )}
    </div>
  );
}
