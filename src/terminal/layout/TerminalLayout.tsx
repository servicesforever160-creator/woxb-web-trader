import TerminalGrid from "./TerminalGrid";
import type { AccountDetail } from "../topbar/accountDetails";

export default function TerminalLayout({
  accountDetails,
}: {
  accountDetails: AccountDetail[];
}) {
  return <TerminalGrid accountDetails={accountDetails} />;
}
