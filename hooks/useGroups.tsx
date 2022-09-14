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

  const [ groups, setGroups ] = useState([] as Group[])

  function updateGroups() {
    setGroups(readData("groups") as Group[])
  }
  
  useEffect(() => {
    const groups = readData("groups") as Group[]
    let updatedGroups: Group[] = []
    if (groups) {
      for (const group of groups) {
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
          }
          if (newDebt.total > 0) {
            if (!(group.allGroupDebts?.length > 0)) {
              group.allGroupDebts = [] 
            }

            // Verificação de existência de todos os participante, mesmo que não tenham sido citados na hora da criação ou adicionados posteriormente
            group.allGroupDebts.push(newDebt)
            if (group.participants.indexOf(newDebt.creditor) < 0) {
              group.participants.push(newDebt.creditor)
            }
            if (group.participants.indexOf(newDebt.debtor) < 0) {
              group.participants.push(newDebt.debtor)
            }
          }
        }
        updatedGroups.push(group)
      }
    }
    setGroups(updatedGroups)
  }, [])

  const addGroup = (group: Group) => {
    const groupExists = groups.find(g => g.name === group.name)
    if (groupExists) {
      return false
    }
    setGroups((oldGroups) => [...oldGroups, group])
    writeData("groups", [...groups, group])
    return true
  }

  return { groups, addGroup, updateGroups }
}