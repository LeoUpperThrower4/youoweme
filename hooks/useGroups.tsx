import { createContext, useContext, useEffect, useState } from "react"
import { readDataFromDB, writeDataToDB } from "../services/database"
import { Debt } from "../interfaces/debt"
import { Group, GroupsSummary } from "../interfaces/Groups"
import { Transaction } from "../interfaces/transactions"

interface GroupContextProps {
  children: React.ReactNode
}
interface GroupContextData {
  groupsSummary: GroupsSummary[],
  addGroup: (groupName: string) => boolean,
  updateGroup: (oldGroup: Group, newGroup: Group) => boolean,
  addTransaction: (groupName: string, transaction: Transaction) => void
}

const GroupsContext = createContext({} as GroupContextData)

export function GroupsProvider({ children }: GroupContextProps) {
  const [ groups, setGroups ] = useState([] as Group[])
  const [ groupsSummary, setGroupsSummary ] = useState([] as GroupsSummary[])

  useEffect(() => {
    setGroups(readDataFromDB('groups') || [])
  }, []) 

  useEffect(() => {
    updateGroupsSummary()
  }, [groups])
  
  function calculateAllGroupDebts(group: Group): Debt[] {
    const debts: Debt[] = []
    group.participants.forEach(participant => {
      group.transactions.forEach(transaction => {
        if (transaction.from === participant) {
          const debt = debts.find(d => d.debtor === participant && d.creditor === transaction.to)
          if (debt) {
            debt.total += transaction.value
          } else {
            debts.push({
              debtor: participant,
              creditor: transaction.to,
              total: transaction.value,
            })
          }
        }
        if (transaction.to === participant) {
          const debt = debts.find(d => d.debtor === transaction.from && d.creditor === participant)
          if (debt) {
            debt.total -= transaction.value
          } else {
            debts.push({
              debtor: transaction.from,
              creditor: participant,
              total: -transaction.value,
            })
          }
        }
      })
    })
    return debts
  }
  function updateGroupsSummary() {
    setGroupsSummary(
      groups.map(group => {
        const allGroupDebts = calculateAllGroupDebts(group)
        return {
          ...group,
          allGroupDebts
        }
      })
    )
  }
  function addGroup(groupName: string): boolean {
    const groupExists = groups.find(g => g.name === groupName)
    if (groupExists) {
      return false
    }
    const newGroup = {
      name: groupName,
      participants: [],
      transactions: [],
      allGroupDebts: [],
    }
    setGroups([...groups, newGroup])    
    writeDataToDB('groups', [...groups, newGroup])
    updateGroupsSummary()
    return true
  }
  function updateGroup(oldGroup: Group, newGroup: Group): boolean {
    const groupExists = groups.find(g => g.name === newGroup.name)
    if (groupExists) {
      return false
    }
    const newGroups = groups.map(group => {
      if (group.name === oldGroup.name) {
        return newGroup
      }
      return group
    })
    setGroups(newGroups)
    writeDataToDB('groups', newGroups)
    updateGroupsSummary()
    return true
  }
  function addTransaction(groupName: string, transaction: Transaction) {
    setGroups(groups.map(group => {
      if (group.name === groupName) {
        return {
          ...group,
          transactions: [...group.transactions, transaction]
        }
      }
      return group
    }))
    updateGroupsSummary()
  }

  return (
    <GroupsContext.Provider value={{groupsSummary, updateGroup, addGroup, addTransaction}}>
      {children}
    </GroupsContext.Provider>
  )
}

export default function useGroups() {
  const context = useContext(GroupsContext);

  return context;
}