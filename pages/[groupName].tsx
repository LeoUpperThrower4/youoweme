import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
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
  const { groupsSummary, addTransaction, removeTransaction } = useGroups();
  const [transactionModalIsOpen, setTransactionModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  const fromInput = useRef<HTMLInputElement>(null);
  const toInput = useRef<HTMLInputElement>(null);
  const valueInput = useRef<HTMLInputElement>(null);
  const descriptionInput = useRef<HTMLInputElement>(null);

  const groupName = useRouter().query.groupName?.toString() || '';
  const group = groupsSummary.find(group => group.name === groupName);

  const [debtsCollapsed, setDebtsCollapsed] = useState<boolean[]>([]); 

  const [toBeDeletedTransaction, setToBeDeletedTransaction] = useState<Transaction>();

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
    const from = fromInput.current?.value;
    const to = toInput.current?.value;
    const value = valueInput.current?.value;
    const description = descriptionInput.current?.value;

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
      setTransactionModalIsOpen(false);
    }
  }

  function setDebtIsCollapsed(debt: Debt, debtIsCollapsed: boolean): void {    
    const debtIndex = group?.allGroupDebts.indexOf(debt);

    if (debtIndex !== -1 ) {
      setDebtsCollapsed(
        debtsCollapsed.map((_, index) => index === debtIndex ? debtIsCollapsed : debtsCollapsed[index])
      )
    }
  }

  function toggleCollapse(debt: Debt): void {    
    const debtIndex = group?.allGroupDebts.indexOf(debt);

    if (debtIndex !== undefined && debtIndex !== -1) {
      const currentCollapseState = debtsCollapsed[debtIndex];
      setDebtIsCollapsed(debt, !currentCollapseState);
    }
  }

  function collapseDebt(debt: Debt): void {    
    setDebtIsCollapsed(debt, true);
  }

  function uncollapseDebt(debt: Debt): void {    
    setDebtIsCollapsed(debt, false);
  }

  function debtIsCollapsed(debt: Debt): boolean {
    if (group) {
      const debtIndex = group.allGroupDebts.indexOf(debt);
      return debtsCollapsed[debtIndex];
    } 
    return true
  }

  function handleRemoveTransactionClick(transaction: Transaction) {
    setToBeDeletedTransaction(transaction);
    setDeleteModalIsOpen(true);
  }

  function confirmRemoveTransaction(shouldRemove: boolean) {
    if (shouldRemove && toBeDeletedTransaction) {
      removeTransaction(groupName, toBeDeletedTransaction?.id);
    }
    setToBeDeletedTransaction(undefined);
    setDeleteModalIsOpen(false);
  }

  return (
    <>
      <Header update>
        <button className='rounded border-2 border-cyan-700 px-4 py-2 my-4 text-slate-100 hover:bg-cyan-700' onClick={() => {setTransactionModalIsOpen(true)}}>Criar Transação</button>
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
                <div className='flex-col cursor-pointer border rounded m-2 p-4 hover:bg-slate-300' onClick={() => {toggleCollapse(debt)}} key={debt.id}>
                  <div className='flex items-center justify-between' onClick={() => {collapseDebt(debt)}}>
                    <div>
                      <span className='font-bold'>{debt.debtor}</span> deve <span className='italic'>R$ {debt.total}</span> para <span className='font-bold'>{debt.creditor} </span>
                    </div>
                      {debtIsCollapsed(debt) ? (
                        <ArrowDownIcon className='h-5'  />
                      ) : (
                        <ArrowUpIcon className='h-5' />
                      )}
                  </div>
                  <div className='cursor-default' onClick={(e) => {e.stopPropagation()}}>
                    <div className={`ml-3 flex flex-col mt-2 ${debtIsCollapsed(debt)? 'hidden': ''}`}>
                      {group.transactions.filter(transaction => (transaction.to === debt.creditor && transaction.from === debt.debtor) || (transaction.to === debt.debtor && transaction.from === debt.creditor)).map(transaction => (
                      <div key={transaction.id} className='border-b-2 p-4 flex items-center justify-between'>
                        <div>{transaction.from} enviou <span className='italic'>R$ {transaction.value}</span> por causa de: {transaction.description}</div>
                        <XMarkIcon onClick={() => {handleRemoveTransactionClick(transaction)}} className='h-6 cursor-pointer' />
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
        isOpen={transactionModalIsOpen}
        onRequestClose={() => setTransactionModalIsOpen(false)}
        style={customModalStyles}
      >
        <div>
          <div className='flex justify-between border-b mb-1 py-2'>
            <h1>Adicione uma transação!</h1>
            <XMarkIcon onClick={() => {setTransactionModalIsOpen(false)}} className='cursor-pointer w-4 mt-1'/>
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
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={() => setDeleteModalIsOpen(false)}
        style={customModalStyles}
      >
        <div>
          <div className='flex justify-between border-b mb-1 py-2'>
            <h1>Excluir a transação de R$ {toBeDeletedTransaction?.value} enviada pelo(a) {toBeDeletedTransaction?.from} do grupo {groupName}?</h1>
            <XMarkIcon onClick={() => {setDeleteModalIsOpen(false)}} className='cursor-pointer w-4 mt-1'/>
          </div>
          <div className='flex justify-center mt-2'>
            <button className='border border-cyan-600 p-2 rounded text-slate-600 hover:bg-cyan-700 hover:text-slate-100 px-10' onClick={() => { confirmRemoveTransaction(true) }}>
              Sim
            </button>
            <button className='border p-2 rounded bg-cyan-600 text-slate-100 hover:bg-cyan-700 ml-2 px-10' onClick={() => { confirmRemoveTransaction(false) }}>
              Não
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default GroupPage;   