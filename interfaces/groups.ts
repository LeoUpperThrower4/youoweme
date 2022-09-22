import { Debt } from "./debt";
import { Transaction } from "./transactions";

export interface Group {
  name: string,
  transactions: Transaction[],
  participants: string[],
}
export interface GroupsSummary extends Group {
  allGroupDebts: Debt[]
}