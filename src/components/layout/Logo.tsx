export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground font-bold text-lg shadow-md"
        style={{ background: "var(--gradient-brand)" }}
        aria-hidden="true"
      >
        Z
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">ZENTY</span>
    </div>
  );
}
