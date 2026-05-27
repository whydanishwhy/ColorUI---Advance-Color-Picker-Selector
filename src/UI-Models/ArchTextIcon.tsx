import React from 'react';

type ArchTextIconProps = {
  text: string;
  icon?: React.ReactNode;
  radius?: number; // curve radius
  startAngle?: number; // degrees
  endAngle?: number; // degrees
  fontSize?: number;
  letterSpacing?: number;
  clockwise?: boolean;
  color?: string;
  gap?: number; // gap after icon in degrees
  className?: string;
  style?: React.CSSProperties;
};

export default function ArchTextIcon({
  text,
  icon,
  radius = 90,
  startAngle = -110,
  endAngle = 20,
  fontSize = 18,
  letterSpacing = 0,
  clockwise = true,
  color = '#111',
  gap = 12,
  className,
  style,
}: ArchTextIconProps) {
  const chars = text.split('');
  const totalSlots = chars.length + (icon ? 1 : 0);
  const span = endAngle - startAngle;
  const step = totalSlots > 1 ? span / (totalSlots - 1) : 0;
  const dir = clockwise ? 1 : -1;
  const size = radius * 2 + fontSize * 3;
  const center = size / 2;

  const pointAt = (deg:number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: center + Math.cos(rad) * radius,
      y: center + Math.sin(rad) * radius,
    };
  };

  const items: React.ReactNode[] = [];
  let slot = 0;

  if (icon) {
    const angle = startAngle;
    const p = pointAt(angle);
    items.push(
      <div key="icon" style={{position:'absolute', left:p.x, top:p.y, transform:`translate(-50%,-50%) rotate(${angle + 90 * dir}deg)`, color}}>
        {icon}
      </div>
    );
    slot += 1;
  }

  chars.forEach((ch, i) => {
    const angle = startAngle + (slot * step) + (icon ? gap : 0);
    const p = pointAt(angle);
    items.push(
      <span
        key={i}
        style={{
          position:'absolute',
          left:p.x,
          top:p.y,
          transform:`translate(-50%,-50%) rotate(${angle + 90 * dir}deg)`,
          fontSize,
          letterSpacing,
          color,
          whiteSpace:'pre'
        }}
      >
        {ch}
      </span>
    );
    slot += 1;
  });

  return (
    <div className={className} style={{position:'relative', width:size, height:size, ...style}}>
      {items}
    </div>
  );
}

// Example:
// <ArchTextIcon text="Design Studio" icon={<span>⭐</span>} radius={110} startAngle={-140} endAngle={10} fontSize={20} color="#7c3aed" />
