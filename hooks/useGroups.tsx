import { useEffect, useState } from "react"
import { readData, writeData } from "../services/realtimeDB"

type Group = {
  name: string,
  creator: string,
}

export default function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  
  useEffect(() => {
    readData("groups", (data: Group[]) => { setGroups(data) })
  }, [])

  const addGroup = (group: Group) => {
    setGroups((oldGroups) => [...oldGroups, group])
    writeData("groups", [...groups, group])
  }

  return { groups, addGroup }
}