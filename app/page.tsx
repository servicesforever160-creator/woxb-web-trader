import { cookies } from "next/headers";

import TerminalApp from "../src/terminal/TerminalApp";
import { readAccountDetails, readTraderAccount } from "../src/terminal/topbar/accountDetails";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const account = readTraderAccount(cookieStore.get("trader_account")?.value);
  const accountId = typeof account?.id === "string" ? account.id : undefined;

  return (
    <TerminalApp
      accessToken={accessToken}
      accountId={accountId}
      accountDetails={readAccountDetails(account)}
    />
  );
}
