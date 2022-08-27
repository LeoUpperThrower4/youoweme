import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import Header from '../components/Header'
import useGroups from '../hooks/useGroups'
import { writeData } from '../services/realtimeDB.js'

const Home: NextPage = () => {
  const groups = useGroups();
  // writeData("groups", [{ name: "Group 1" }, { name: "Group 2" }]);
  console.log(groups);
  return (
    <>
      <Header />
      <div className='flex justify-center'>
        <div className='w-full max-w-md mt-2'>
          {groups.map((group: any) => (
              <div className='px-4 py-6 flex justify-center border border-black cursor-pointer mb-1 hover:bg-slate-300' key={group.name}>
                <h1>{group.name}</h1>
              </div>
          ))}
        </div>
      </div>
    </>
)}

export default Home
