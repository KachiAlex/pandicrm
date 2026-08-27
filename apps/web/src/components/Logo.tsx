interface LogoProps {
  className?: string;
  variant?: "color" | "white";
  alt?: string;
}

export default function Logo({
  className = "h-8 w-auto",
  variant = "color",
  alt = "Pandacrm",
}: LogoProps) {
  const filter = variant === "white" ? "brightness-0 invert" : "";
  return (
    <img
      src="/pandacrm-logo-horizontal.svg"
      alt={alt}
      className={`${filter} ${className}`}
      style={{ objectFit: "contain", objectPosition: "left center" }}
    />
  );
}
