interface LogoProps {
  className?: string;
  variant?: "color" | "white";
  mode?: "full" | "icon";
  alt?: string;
}

export default function Logo({
  className = "h-8 w-auto",
  variant = "color",
  mode = "full",
  alt = "Pandacrm",
}: LogoProps) {
  const filter = variant === "white" ? "brightness-0 invert" : "";
  const src = mode === "icon" ? "/pandacrm-logo-icon.svg" : "/pandacrm-logo-horizontal.svg";
  return (
    <img
      src={src}
      alt={alt}
      className={`${filter} ${className}`}
      style={{ objectFit: "contain", objectPosition: "left center" }}
    />
  );
}
