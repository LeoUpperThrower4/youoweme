import { useEffect, useState } from "react"
import { readData, writeData } from "../services/realtimeDB"

type Group = {
  name: string
}

export default function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  
  useEffect(() => {
    readData("groups", (data: any) => { setGroups(data) })
  }, [])

  const addGroup = (group: Group) => {
    setGroups((oldGroups) => [...oldGroups, group])
    writeData("groups", [...groups, group])
  }

  return { groups, addGroup }
}