export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-lg text-white"
        style={{ background: "var(--brand-orange)" }}
        aria-hidden="true"
      >
        A
      </div>
      <span className="text-xl font-extrabold tracking-tight text-primary">AFRISELL</span>
    </div>
  );
}
