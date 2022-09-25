import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import uuid4 from 'uuid4';
import Header from '../components/Header';
import InfoBox from '../components/InfoBox';
import useGroups from '../hooks/useGroups';
import { Debt } from '../interfaces/debt';
import { Transaction } from '../interfaces/transactions';
import { ArrowDownIcon, ArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'

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

const GroupPage: NextPage = () => {
  const { groupsSummary, addTransaction } = useGroups();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const fromInput = useRef(null);
  const toInput = useRef(null);
  const valueInput = useRef(null);
  const descriptionInput = useRef(null);

  const groupName = useRouter().query.groupName;
  const group = groupsSummary.find(group => group.name === groupName);

  const [debtsCollapsed, setDebtsCollapsed] = useState<boolean[]>([]); 

  useEffect(() => {
    if (group) {
      setDebtsCollapsed(Array(group.allGroupDebts.length).fill(true));
    }
  }, [group])
  
  function handleCreateTransactionClick(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    createTransaction();
  }

  function createTransaction() {
    const from = fromInput.current.value;
    const to = toInput.current.value;
    const value = valueInput.current.value;
    const description = descriptionInput.current.value;

    if (group && from && to && value && description) {      
      const transaction: Transaction = {
        id: uuid4(),
        from: from.trim(),
        to: to.trim(),
        value: Number(value),
        description: description.trim(),
        datetime: new Date().toISOString(),
      }
      addTransaction(group.name, transaction);
      setModalIsOpen(false);
    }
  }

  function toggleCollapse(debt: Debt): void {    
    const debtIndex = group?.allGroupDebts.indexOf(debt);

    if (debtIndex >= 0 ) {
      setDebtsCollapsed(
        debtsCollapsed.map((_, index) => index === debtIndex ? !debtsCollapsed[index] : debtsCollapsed[index])
      )
    }
  }

  function debtIsCollapsed(debt: Debt): boolean {
    if (group) {
      const debtIndex = group.allGroupDebts.indexOf(debt);
      return debtsCollapsed[debtIndex];
    } 
    return true
  }

  return (
    <>
      <Header update>
        <button className='rounded border-2 border-cyan-700 px-4 py-2 my-4 text-slate-100 hover:bg-cyan-700' onClick={(e) => {setModalIsOpen(true)}}>Criar Transação</button>
      </Header>
      {group && (
        <>
          <div className='flex justify-center my-2'>
            <h1 className='font-bold text-2xl'>{group.name}</h1>
          </div>
          <div className='flex flex-col items-center mb-4'>
            <InfoBox title='Informações do grupo'>
              <div>
                <span className='font-bold'>Participantes: </span>
                { group.participants && group.participants.map(participant => 
                (<><span className='italic' key={participant}>{participant}{group.participants.indexOf(participant) + 1 == group.participants.length? '': ', '}</span></>))}
              </div>
            </InfoBox>
            <InfoBox title='Devedores' className='mt-2'>
              {group.allGroupDebts && group.allGroupDebts.map(debt => (
                <div className='flex-col cursor-pointer border rounded m-2 p-4 hover:bg-slate-300' onClick={() => toggleCollapse(debt)} key={debt.id}>
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='font-bold'>{debt.debtor}</span> deve <span className='italic'>R$ {debt.total}</span> para <span className='font-bold'>{debt.creditor} </span>
                    </div>
                      {debtIsCollapsed(debt) ? (
                        <ArrowDownIcon className='h-5'  />
                      ) : (
                        <ArrowUpIcon className='h-5' />
                      )}
                  </div>
                  <div>
                    <div className={`ml-3 flex flex-col mt-2 ${debtIsCollapsed(debt)? 'hidden': ''}`}>
                      {group.transactions.filter(transaction => (transaction.to === debt.creditor && transaction.from === debt.debtor) || (transaction.to === debt.debtor && transaction.from === debt.creditor)).map(transaction => (
                      <div key={transaction.id}>
                        {transaction.from} emprestou <span className='italic'>R$ {transaction.value}</span> por causa de: {transaction.description}
                      </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </InfoBox>
          </div>
        </>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={customModalStyles}
      >
        <div>
          <div className='flex justify-between border-b mb-1 py-2'>
            <h1>Adicione uma transação!</h1>
            <XMarkIcon onClick={() => {setModalIsOpen(false)}} className='cursor-pointer w-4 mt-1'/>
          </div>
          <form className='flex flex-col mt-2'>
            <input type="text" placeholder='De' className='border p-2 rounded' ref={fromInput}/> 
            <input type="text" placeholder='Para' className='border p-2 rounded' ref={toInput} />
            <input type="text" placeholder='Valor (ex: 15.50)' className='border p-2 rounded' ref={valueInput} />
            <input type="text" placeholder='Descrição' className='border p-2 rounded' ref={descriptionInput} />
            <button className='border p-2 rounded mt-2 bg-cyan-600 text-white hover:bg-cyan-700' onClick={(e) => {handleCreateTransactionClick(e)}}>
              Criar
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default GroupPage;   