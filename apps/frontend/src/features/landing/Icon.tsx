type IconProps = {
    name: string;
    className?: string;
    filled?: boolean;
  };
  
  // Material Symbols Outlined (font is loaded in app/layout.tsx)
  export default function Icon({ name, className = "", filled = false }: IconProps) {
    return (
      <span
        aria-hidden="true"
        className={`material-symbols-outlined ${className}`}
        style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {name}
      </span>
    );
  }