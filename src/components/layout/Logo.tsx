import logoAsset from "@/assets/afrisell-logo.png.asset.json";

type LogoProps = {
  /** Render the wordmark next to the mark (default true). */
  withText?: boolean;
  /** Tailwind height class for the mark (default h-9). */
  size?: string;
  /** Kept for API compatibility (wordmark colors are part of the logo image). */
  textClassName?: string;
  className?: string;
};

/**
 * AFRISELL brand logo — official HD logo image (mark + wordmark).
 * When `withText` is false, only the circular "A" mark is shown.
 */
export function Logo({ withText = true, size = "h-9", className = "" }: LogoProps) {
  if (!withText) {
    // Crop the left circular mark out of the full horizontal logo.
    return (
      <div className={`${size} aspect-square overflow-hidden ${className}`}>
        <img
          src={logoAsset.url}
          alt="AFRISELL"
          className="h-full w-auto max-w-none object-cover object-left"
        />
      </div>
    );
  }

  return (
    <img
      src={logoAsset.url}
      alt="AFRISELL"
      className={`${size} w-auto ${className}`}
    />
  );
}
