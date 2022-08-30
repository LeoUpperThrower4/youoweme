import { useEffect, useState } from "react"
import { readData, writeData } from "../services/realtimeDB"

type Transaction = {
  from: string,
  to: string,
  value: number,
  description: string,
  datetime: string,
}

type Group = {
  name: string,
  creator: string,
  participants: string[],
  transactions: Transaction[],
  allGroupDebts: Debt[]
}

type Debt = {
  debtor: string,
  creditor: string,
  total: number,
}

export default function useGroups() {

  function GetUpdatedDebt(currDebt: Debt, newTransaction: Transaction): Debt {
    const { debtor, creditor, total } = currDebt
    if (debtor === newTransaction.to) {
      return {
        debtor,
        creditor,
        total: total + newTransaction.value,
      }
    } else {
      const newTotal = total - newTransaction.value
      if (newTotal < 0) {
        return {
          creditor: newTransaction.from,
          debtor: newTransaction.to,
          total: Math.abs(newTotal),
        }
      } else {
        return {
          debtor: newTransaction.from,
          creditor: newTransaction.to,
          total: newTotal,
        }
      }
    }
  }

  const [ groups, setGroups ] = useState<Group[]>([])

  useEffect(() => {
    console.log(groups)
  }, [groups])
  
  useEffect(() => {
    readData("groups", (data: Group[]) => { 
      let updatedGroups: Group[] = []
      for (const group of data) {
        for (const transaction of group.transactions) {
          let newDebt: Debt
          let currDebt = group.allGroupDebts?.find(debt => (debt.debtor === transaction.to && debt.creditor === transaction.from) || (debt.debtor === transaction.from && debt.creditor === transaction.to))
          if (currDebt) {
            group.allGroupDebts.splice(group.allGroupDebts.indexOf(currDebt), 1)
            newDebt = GetUpdatedDebt(currDebt, transaction)
          } else {
            newDebt = {
              creditor: transaction.from,
              debtor: transaction.to,
              total: transaction.value,
            }
            group.allGroupDebts = []
          }
          if (newDebt.total > 0) {
            group.allGroupDebts.push(newDebt)
          }
        }
        updatedGroups.push(group)
      }
      setGroups(updatedGroups)
     })
  }, [])

  const addGroup = (group: Group) => {
    setGroups((oldGroups) => [...oldGroups, group])
    writeData("groups", [...groups, group])
  }

  return { groups, addGroup }
}