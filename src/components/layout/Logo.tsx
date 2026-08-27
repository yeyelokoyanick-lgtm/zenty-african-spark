type LogoProps = {
  /** Render the wordmark next to the mark (default true). */
  withText?: boolean;
  /** Tailwind height class for the mark (default h-9). */
  size?: string;
  /** Text color utility for the wordmark (default text-primary). */
  textClassName?: string;
  className?: string;
};

/**
 * AFRISELL brand logo — a vector mark plus wordmark.
 *
 * The mark is a stylised "A" shaped like a storefront / shopping bag, with a
 * small leaf accent (African origin). Gradient stays on the Alibaba-derived
 * brand palette: #FF6A00 → #E52F07.
 */
export function Logo({ withText = true, size = "h-9", textClassName = "text-primary", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className={size}
        role="img"
        aria-label="AFRISELL"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="afrisell-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6A00" />
            <stop offset="1" stopColor="#E52F07" />
          </linearGradient>
        </defs>

        {/* Storefront / bag silhouette forming an "A" */}
        <path
          d="M24 4.5 7.2 40.2a2.6 2.6 0 0 0 2.36 3.7h29.08a2.6 2.6 0 0 0 2.36-3.7L24 4.5Z"
          fill="url(#afrisell-grad)"
        />
        {/* Inner negative-space "A" counter */}
        <path
          d="M24 16.2 16.1 34.5h3.9l1.7-3.9h4.6l1.7 3.9h3.9L24 16.2Zm-1.5 11 1.5-3.4 1.5 3.4h-3Z"
          fill="#fff"
        />
        {/* African leaf / growth accent */}
        <path
          d="M33.2 13.1c1.7-1 4-1 5.2-.2-1.4 1.2-3.4 1.6-5.1 1.4-.8 1.5-2.3 2.6-4.1 2.7.4-1.7 1.7-3.2 3.4-4 .2 0 .4 0 .6.1Z"
          fill="#2E8B57"
        />
      </svg>

      {withText && (
        <span className={`text-xl font-extrabold tracking-tight ${textClassName}`}>
          AFRI<span style={{ color: "var(--brand-orange, #FF6A00)" }}>SELL</span>
        </span>
      )}
    </div>
  );
}
