import { useEffect, useState } from "react"
import { readData, writeData } from "../services/realtimeDB"

type Group = {
  name: string
}

export default function useGroups() {
  const [groups, setGroups] = useState<Group[]>([] as Group[])
  useEffect(() => {
    readData("groups", (data: any) => { setGroups(data) })
  }, [])

  const addGroup = (group: Group) => {
    writeData("groups", [...groups, group])
  }

  return { groups, addGroup }
}