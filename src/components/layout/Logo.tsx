export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-lg text-white shadow-[var(--shadow-card)]"
        style={{ background: "var(--gradient-brand)" }}
        aria-hidden="true"
      >
        Z
      </div>
      <span className="text-xl font-extrabold tracking-tight text-primary">ZENTY</span>
    </div>
  );
}
