import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import Header from '../components/Header';
import InfoBox from '../components/InfoBox';
import useGroups from '../hooks/useGroups';
import { Debt } from '../interfaces/debt';
import { Transaction } from '../interfaces/transactions';

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
    setDebtsCollapsed(Array(group?.allGroupDebts.length).fill(true))
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
        from,
        to,
        value: Number(value),
        description,
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

  return (
    <>
      <Header update>
        <button className='rounded border-2 border-cyan-700 px-4 py-2 my-4 text-slate-100' onClick={(e) => {setModalIsOpen(true)}}>Criar Transação</button>
      </Header>
      {group && (
        <>
          <div className='flex justify-center my-2'>
            <h1 className='font-bold text-2xl'>{group.name}</h1>
          </div>
          <div className='flex flex-col items-center'>
            <InfoBox title='Informações do grupo'>
              <div>
                <span className='font-bold'>Participantes: </span>
                { group.participants && group.participants.map(participant => 
                (<><br/><span className='italic' key={participant}>{participant}</span></>))}
              </div>
            </InfoBox>
            <InfoBox title='Devedores' className='mt-2'>
              {group.allGroupDebts && group.allGroupDebts.map(debt => (
                <div key={debt.id}>
                  <span className='font-bold'>{debt.debtor}</span> deve <span className='italic'>R$ {debt.total}</span> para <span className='font-bold'>{debt.creditor}</span> devido essas transações <span className='italic text-sm cursor-pointer' onClick={() => toggleCollapse(debt)}>Collapse</span>
                  <div className={` transition-transform flex flex-col items-center mt-2 ${debtsCollapsed[group?.allGroupDebts.indexOf(debt)]? 'hidden': ''}`}>
                    {/* adicionar um dropdown para permitir esconder as transações */}
                    {group.transactions.filter(transaction => (transaction.to === debt.creditor && transaction.from === debt.debtor) || (transaction.to === debt.debtor && transaction.from === debt.creditor)).map(transaction => (
                      <div key={transaction.id}>
                        {transaction.from} emprestou para {transaction.to} <span className='italic'>R$ {transaction.value}</span> por causa de: {transaction.description}
                      </div>
                    ))}
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
            <button onClick={() => {setModalIsOpen(false)}} className='ml-4'>X</button>
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