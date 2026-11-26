import TerminalGrid from "./TerminalGrid";
import type { AccountDetail } from "../topbar/accountDetails";

export default function TerminalLayout({
  accountId,
  accountDetails,
}: {
  accountId?: string;
  accountDetails: AccountDetail[];
}) {
  return <TerminalGrid accountId={accountId} accountDetails={accountDetails} />;
}
