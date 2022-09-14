import Modal from 'react-modal';
import { useState } from 'react';
import useGroups from '../hooks/useGroups';
import { writeData } from '../services/realtimeDB';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

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

type HeaderProps = {
  update: Boolean
}

export default function Header({ update }: HeaderProps) {
  const { addGroup, groups, updateGroups } = useGroups();
  const { username } = useAuth();
  const router = useRouter();

  // Estados da modal de criação de grupo
  const [ groupModalIsOpen, setGroupModalIsOpen ] = useState(false);
  const [ groupName, setGroupName ] = useState('');

  // Estados da modal de criação de transação
  const [ transactionModalIsOpen, setTransactionModalIsOpen ] = useState(false);
  const [ transactionFrom, setTransactionFrom ] = useState('');
  const [ transactionTo, setTransactionTo ] = useState('');
  const [ transactionValue, setTransactionValue ] = useState(0);
  const [ transactionDescription, setTransactionDescription ] = useState('');

  function handleCreateGroupClick() {
    openGroupModal()
  }
  function openGroupModal() {
    setGroupModalIsOpen(true);
    setTransactionModalIsOpen(false);
  }
  function openTransactionModal() {
    setGroupModalIsOpen(false);
    setTransactionModalIsOpen(true);
  }
  function handleCloseModal() {
    if (groupModalIsOpen) {
      setGroupModalIsOpen(false);
      setGroupName('');
    }
    if (transactionModalIsOpen) {
      setTransactionModalIsOpen(false);
      setTransactionFrom('');
      setTransactionTo('');
      setTransactionValue(0);
      setTransactionDescription('');
    }
  }

  function createGroup(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    if (!update) {
      if (addGroup({
        name: groupName,
        participants: [username || ''],
        transactions: [], // { from: '', to: '', value: 0, description: 'initial' , datetime: new Date().toISOString() }
        allGroupDebts: [],
      })) {
        // toast.success('Group created successfully!', {
        //   position: toast.POSITION.TOP_RIGHT,
        // });
      } else {
        // toast.error('Group with this name already exists!', {
          //   position: toast.POSITION.TOP_RIGHT,
          // });
        }
      router.push(`/${groupName}`);
    } else {
      const groupId = groups.findIndex(group => group.name === router.query.groupName);
      if (groupId !== -1) {
        const newGroup = groups[groupId];
        newGroup.name = groupName;
        groups.splice(groupId, 1, newGroup);
        writeData('groups', groups);
        router.push(`/${groupName}`);
      // toast.success('Group updated successfully!', {
      //   position: toast.POSITION.TOP_RIGHT,
      // });
      }
    }
    handleCloseModal();
  }

  function createTransaction() {
    const groupId = groups.findIndex(group => group.name === router.query.groupName);
    if (groupId !== -1) {
      const transaction = {
        from: transactionFrom,
        to: transactionTo,
        value: transactionValue,
        description: transactionDescription,
        datetime: new Date().toISOString(),
      };
      groups[groupId].transactions.push(transaction);
      // Deve haver uma validação aqui
      writeData('groups', groups)
      updateGroups()
    }
    // toast.success('Transaction created successfully!', {
    //   position: toast.POSITION.TOP_RIGHT,
    // });
    handleCloseModal();
  }

  return (
    <>
      <header className="bg-cyan-600">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex justify-center">
            <button onClick={handleCreateGroupClick} className="rounded border-2 border-cyan-700 px-4 py-2 my-4 text-slate-100">{update? 'Atualizar': 'Criar'} Grupo</button>
            { router.query.groupName &&
            <button onClick={() => openTransactionModal()} className='rounded border-2 border-cyan-700 px-4 py-2 my-4 ml-2 bg-amber-200 hover:bg-amber-400'>Adicionar transação</button>}
          </div>
        </nav>
      </header>
      <Modal
        isOpen={groupModalIsOpen || transactionModalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel={transactionModalIsOpen? "Adicionar Transação": "Criar Grupo"}
        style={customModalStyles}
      >
        {transactionModalIsOpen?(
          <div>
          <div className='flex justify-between border-b mb-1 py-2'>
            <h1>Adicione uma transação!</h1>
            <button onClick={handleCloseModal} className='ml-4'>X</button>
          </div>
          <form className='flex flex-col mt-2'>
            <input type="text" placeholder='De' className='border p-2 rounded' onChange={(e) => { setTransactionFrom(e.target.value) }} /> 
            <input type="text" placeholder='Para' className='border p-2 rounded' onChange={(e) => { setTransactionTo(e.target.value) }} />
            <input type="text" placeholder='Valor (ex: 15.50)' className='border p-2 rounded' onChange={(e) => { setTransactionValue(Number(e.target.value)) }} />
            <input type="text" placeholder='Descrição' className='border p-2 rounded' onChange={(e) => { setTransactionDescription(e.target.value) }} />
            <button className='border p-2 rounded mt-2 bg-cyan-600 text-white hover:bg-cyan-700' onClick={() => createTransaction()}>
              Criar
            </button>
          </form>
        </div>
        ):(
          <div>
            <div className='flex justify-between border-b mb-1 py-2'>
              <h1>{update? 'Atualize': 'Crie'} seu grupo!</h1>
              <button onClick={handleCloseModal} className='ml-4'>X</button>
            </div>
            <form className='flex flex-col mt-2'>
              <input type="text" placeholder='Nome do grupo' className='border p-2 rounded' onChange={(e) => { setGroupName(e.target.value) }} />
              <button onClick={(event) => createGroup(event)} className='border p-2 rounded mt-2 bg-cyan-600 text-white hover:bg-cyan-700'>
              {update? 'Atualizar': 'Criar'}
              </button>
            </form>
          </div>
        )}

      </Modal>
    </>
  )
}

Header.defaultProps = {
  update: false
}
