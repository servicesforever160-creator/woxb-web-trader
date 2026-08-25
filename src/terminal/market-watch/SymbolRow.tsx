type SymbolRowProps = {
  Pair: string;
  PairSymbol: string;
  CurrentPrice: number;
  PercentageChange: number;
  Spread: number;
};

export default function SymbolRow(prop: SymbolRowProps) {

    const isUp = prop.PercentageChange >= 0;
    const color = isUp ? "up" : "down";
  return (
    <div className="symbol-row">

      <div className="symbol-left">

        <div className="symbol-avatar">
          {prop.PairSymbol}
        </div>

        <div className="symbol-info">
          <h4>{prop.Pair}</h4>
          <span>Spread: {prop.Spread}</span>
        </div>

      </div>

      <div className={`symbol-price ${color}`}>
        <h4>{prop.CurrentPrice}</h4>
        <span>{prop.PercentageChange}</span>
      </div>

    </div>
  );
}
