import { cookies } from "next/headers";

import TerminalApp from "../src/terminal/TerminalApp";
import { readAccountDetails } from "../src/terminal/topbar/accountDetails";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const accountDetails = readAccountDetails(
    cookieStore.get("trader_account")?.value,
  );

  return <TerminalApp accessToken={accessToken} accountDetails={accountDetails} />;
}
