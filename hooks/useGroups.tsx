import { createContext, useContext, useEffect, useState } from "react"
import { readDataFromDB, writeDataToDB } from "../services/database"
import { Debt } from "../interfaces/debt"
import { Group, GroupsSummary } from "../interfaces/groups"
import { Transaction } from "../interfaces/transactions"
import uuid4 from "uuid4"

interface GroupContextProps {
  children: React.ReactNode
}

interface GroupContextData {
  groupsSummary: GroupsSummary[],
  addGroup: (groupName: string) => boolean,
  updateGroup: (oldGroup: Group, newGroup: Group) => boolean,
  addTransaction: (groupName: string, transaction: Transaction) => void
  removeTransaction: (groupName: string, transactionId: string) => void
  createBackup: () => void,
  loadBackup: () => void
}

const GroupsContext = createContext({} as GroupContextData)

export function GroupsProvider({ children }: GroupContextProps) {
  const [ groups, setGroups ] = useState([] as Group[])
  const [ groupsSummary, setGroupsSummary ] = useState([] as GroupsSummary[])
  const [firstReadDB, setFirstReadDB] = useState(true)

  function createBackup() {
    const backup = JSON.stringify(groups)
    localStorage.setItem("backup", backup)
  }

  function loadBackup() {
    const backup = localStorage.getItem("backup")
    if (backup) {
      const groups = JSON.parse(backup)
      setGroups(groups)
    }
  }

  useEffect(() => {
    if (!firstReadDB) {
      writeDataToDB('groups', groups)
      
      updateGroupsSummary()
    } else {
      setGroups(readDataFromDB('groups') || [])
      setFirstReadDB(false)
    }
  }, [groups, firstReadDB])
  
  function calculateAllGroupDebts(group: Group): Debt[] {
    const debts: Debt[] = []
    group.transactions.forEach(transaction => {
      let debt = debts.find(d => d.creditor === transaction.from && d.debtor === transaction.to)
      if (debt) {
        debts.splice(debts.indexOf(debt), 1)
        debt.total += transaction.value
        debts.push(debt)
      } else {
        debt = debts.find(d => d.debtor === transaction.from && d.creditor === transaction.to)
        if (debt) {
          debts.splice(debts.indexOf(debt), 1)   
          debt.total -= transaction.value  
          if (debt.total < 0) {
            debt.debtor = debt.creditor
            debt.creditor = transaction.from
            debt.total = Math.abs(debt.total)
          }
          debts.push(debt)
        } else {            
          debts.push({
            id: uuid4(),
            creditor: transaction.from,
            debtor: transaction.to,
            total: Math.abs(transaction.value),
          })
        }}
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
    const newGroup: GroupsSummary = {
      name: groupName,
      participants: [],
      transactions: [],
      allGroupDebts: []
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
        if (!group.participants.includes(transaction.from)) {
          group.participants.push(transaction.from)
        }
        if (!group.participants.includes(transaction.to)) {
          group.participants.push(transaction.to)
        }
        return {
          ...group,
          transactions: [...group.transactions, transaction]
        }
      }
      return group
    }))
    updateGroupsSummary()
  }
  function removeTransaction(groupName: string, transactionId: string) {
    setGroups(groups.map(group => {
      if (group.name === groupName) {
        return {
          ...group,
          transactions: group.transactions.filter(t => t.id !== transactionId)
        }
      }
      return group
    }))
    updateGroupsSummary()
  }

  return (
    <GroupsContext.Provider value={{groupsSummary, updateGroup, addGroup, addTransaction, removeTransaction, createBackup, loadBackup}}>
      {children}
    </GroupsContext.Provider>
  )
}

export default function useGroups() {
  const context = useContext(GroupsContext);

  return context;
}