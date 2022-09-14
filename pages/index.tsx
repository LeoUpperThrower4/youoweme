import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import useGroups from '../hooks/useGroups'

const Home: NextPage = () => {
  const { groups } = useGroups();
  const router = useRouter()

  function handleGroupBoxClick(group: any) {
    router.push(group.name)
  }

  return (
    <>
      <Header />
      <div className='flex justify-center'>
        <div className='w-full max-w-md mt-2'>
          {groups && groups.map((group: any) => (
              <div onClick={(e) => { handleGroupBoxClick(group) }} className='px-4 py-6 flex justify-center border border-black rounded cursor-pointer mb-1 hover:bg-slate-300' key={group.name}>
                <h1>{group.name}</h1>
              </div>
          ))}
        </div>
      </div>
    </>
)}

export default Home;

