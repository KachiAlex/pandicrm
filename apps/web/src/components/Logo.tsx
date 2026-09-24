import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "color" | "white";
  mode?: "full" | "icon";
  alt?: string;
}

const logos = {
  full: { src: "/pandacrm-logo-horizontal.svg", width: 440, height: 120 },
  icon: { src: "/pandacrm-logo-icon.svg", width: 120, height: 120 },
};

export default function Logo({
  className = "h-8 w-auto",
  variant = "color",
  mode = "full",
  alt = "Pandacrm",
}: LogoProps) {
  const filter = variant === "white" ? "brightness-0 invert" : "";
  const { src, width, height } = logos[mode];

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`${filter} ${className}`}
      style={{ objectFit: "contain", objectPosition: "left center" }}
      unoptimized
      priority
    />
  );
}
