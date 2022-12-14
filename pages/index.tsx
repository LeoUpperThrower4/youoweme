import Modal from 'react-modal';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Header from '../components/Header'
import useGroups from '../hooks/useGroups'
import { useRef, useState } from 'react';
import { Group } from '../interfaces/groups';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#__next');

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const Home: NextPage = () => {
  const { groupsSummary, addGroup } = useGroups();
  const router = useRouter()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const groupNameInput = useRef<HTMLInputElement>(null)

  function handleGroupBoxClick(group: Group) {
    router.push(group.name)
  }

  function handleCreateGroupClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    const groupName = groupNameInput.current?.value
    if (groupName) {
      if (addGroup(groupName)) {
        toast.success('Grupo criado com sucesso!')
      } else {
        toast.error('Ocorreu um erro ao criar o grupo\nO nome do grupo deve ser único.')
      }
      setModalIsOpen(false)
    } else {
      toast.error('O nome do grupo não pode ser vazio')
    }
  }

  return (
    <>
      <Header>
        <button onClick={() => {setModalIsOpen(true)}} className="rounded border-2 border-cyan-700 px-4 py-2 my-4 text-slate-100">Criar Grupo</button>
      </Header>
      <div className='flex justify-center'>
        <div className='w-full max-w-md mt-2 rounded'>
          {groupsSummary && groupsSummary.map((group: Group) => (
              <div onClick={() => { handleGroupBoxClick(group) }} className='border-2 m-2 px-4 py-6 flex justify-center cursor-pointer hover:bg-slate-300' key={group.name}>
                <h1>{group.name}</h1>
              </div>
          ))}
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => {setModalIsOpen(false)}}
        contentLabel="Criar Grupo"
        style={customModalStyles}
      > 
        <div>
          <div className='flex justify-between border-b mb-1 py-2'>
            <h1>Crie seu grupo!</h1>
            <XMarkIcon onClick={() => {setModalIsOpen(false)}} className='w-4 mt-1 cursor-pointer' />
          </div>
          <form className='flex flex-col mt-2'>
            <input ref={groupNameInput} type="text" placeholder='Nome do grupo' className='border p-2 rounded' />
            <button onClick={(e) => {handleCreateGroupClick(e)}} className='border p-2 rounded mt-2 bg-cyan-600 text-white hover:bg-cyan-700'>
            Criar
            </button>
          </form>
        </div>
      </Modal>
      <ToastContainer />
    </>
)}

export default Home;
