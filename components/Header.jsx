import Modal from 'react-modal';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import useGroups from '../hooks/useGroups';

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

export default function Header() {
  const { data: session, status } = useSession();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const { addGroup } = useGroups();

  function handleCreateGroupClick() {
    if (status != 'authenticated') {
      signIn('github');
    } else {
      openModal()
    }
  }

  function openModal() {
    setModalIsOpen(true);
  }

  function handleCloseModal() {
    setModalIsOpen(false);
  }

  function createGroup(event) {
    // toast.success('Group created successfully!', {
    //   position: toast.POSITION.TOP_RIGHT,
    // });
    event.preventDefault();
    addGroup({
      name: groupName,
      creator: session.user.email,
  });
    handleCloseModal();
  }

  return (
    <>
      <header className="bg-cyan-600">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex justify-center">
            <button onClick={handleCreateGroupClick} className="rounded border-2 border-cyan-700 px-4 py-2 my-4 text-slate-100">Criar Grupo</button>
            {status == 'authenticated' && <button onClick={signOut} className="rounded border-2 border-cyan-700 px-4 py-2 my-4 ml-2 text-slate-100">Logout</button>}
            {status == 'unauthenticated' && <button onClick={() => signIn('github')} className="rounded border-2 border-cyan-700 px-4 py-2 my-4 ml-2 text-slate-100">Icone GitHub</button>}
            {status == 'unauthenticated' && <button disabled onClick={() => signIn('google')} className="rounded border-2 border-cyan-700 px-4 py-2 my-4 ml-2 text-slate-100">Icone Google</button>}
          </div>
        </nav>
      </header>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Criar Grupo"
        style={customModalStyles}
      >
        <div>
          <div className='flex justify-between border-b mb-1 py-2'>
            <h1>Crie seu grupo!</h1>
            <button onClick={handleCloseModal} className='ml-4'>X</button>
          </div>
          <form className='flex flex-col mt-2'>
            <input type="text" placeholder='Nome do grupo' className='border p-2 rounded' onChange={(e) => { setGroupName(e.target.value) }} />
            <button className='border p-2 rounded mt-2 bg-cyan-600 text-white hover:bg-cyan-700' onClick={(e) => createGroup(e)}>
              Criar
            </button>
          </form>
        </div>
      </Modal>
    </>
  )
}
