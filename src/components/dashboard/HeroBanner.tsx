export function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-lg sm:p-10"
      style={{ background: "var(--gradient-brand)" }}
    >
      <div
        className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 blur-2xl"
        style={{ background: "white" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full opacity-15 blur-3xl"
        style={{ background: "white" }}
        aria-hidden="true"
      />
      <div className="relative max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">Tableau de bord</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          Bienvenue sur AFRISELL, Karim <span aria-hidden>👋</span>
        </h1>
        <p className="mt-3 text-base opacity-90 sm:text-lg">
          Voici un aperçu de ton activité aujourd'hui.
        </p>
      </div>
    </section>
  );
}
