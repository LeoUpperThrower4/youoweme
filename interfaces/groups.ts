import { Debt } from "./debt";
import { Transaction } from "./transactions";

export interface Group {
  name: string,
  participants: string[],
  transactions: Transaction[],
  
}
export interface GroupsSummary extends Group {
  allGroupDebts: Debt[]
}