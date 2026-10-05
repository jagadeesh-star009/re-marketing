import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  hoverEffect = true,
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      style={style}
      className={`marketplace-card ${glow ? "glow-card" : ""} ${hoverEffect ? "hover-card" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
