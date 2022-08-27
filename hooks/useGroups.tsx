import { useEffect, useState } from "react"
import { readData } from "../services/realtimeDB"

export default function useGroups() {
  const [groups, setGroups] = useState([])
  useEffect(() => {
    readData("groups", (data: any) => { setGroups(data) })
  }, [])
  return groups
}