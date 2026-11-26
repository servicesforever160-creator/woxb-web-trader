import "./AccountCard.css";
import { UserRound } from "lucide-react";
import type { AccountDetail } from "./accountDetails";

type AccountCardProps = {
  details: AccountDetail[];
};

export default function AccountCard({ details }: AccountCardProps) {
  if (details.length === 0) return null;

  const name = details.find(({ label }) => label === "Account");
  const number = details.find(({ label }) => label === "Account number");
  const mode = details.find(({ label }) => label === "Mode");
  const metrics = details.filter(
    (detail) => detail !== name && detail !== number && detail !== mode,
  );

  return (
    <div
      className="topbar-account"
      role="region"
      aria-label="Trading account details"
      tabIndex={0}
    >
      <div className="account-card-identity">
        <span className="account-card-icon">
          <UserRound size={17} aria-hidden="true" />
        </span>

        <div className="account-card-profile">
          <strong className="account-card-name" title={name?.value}>
            {name?.value ?? "Trading account"}
          </strong>

          {(number || mode) && (
            <div className="account-card-meta">
              {number && (
                <span>
                  <span className="sr-only">Account number </span>
                  <span aria-hidden="true">#</span>
                  {number.value}
                </span>
              )}
              {mode && <span className="account-card-mode">{mode.value}</span>}
            </div>
          )}
        </div>
      </div>

      {metrics.length > 0 && (
        <dl className="account-card-metrics">
          {metrics.map(({ label, value }) => (
            <div className="account-card-metric" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
