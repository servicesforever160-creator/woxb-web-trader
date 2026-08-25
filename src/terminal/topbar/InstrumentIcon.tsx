type InstrumentIconProps = {
  type: string;
};

export function InstrumentIcon({ type }: InstrumentIconProps) {
  if (type === "eu") return <span className="instrument-icon flag-eu">••••••</span>;
  if (type === "gb") return <span className="instrument-icon flag-gb">+</span>;
  if (type === "gold") return <span className="instrument-icon icon-gold">◆</span>;
  return <span className="instrument-icon icon-coin">◈</span>;
}
