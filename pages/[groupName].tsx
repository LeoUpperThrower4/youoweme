import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import Header from '../components/Header';
import InfoBox from '../components/InfoBox';
import useGroups from '../hooks/useGroups';

const GroupPage: NextPage = () => {
  const { groups } = useGroups();
  const groupName = useRouter().query.groupName;
  const group = groups.find(group => group.name === groupName);
  return (
    <>
      <Header update />
      {group && (
        <>
          <div className='flex justify-center my-2'>
            <h1 className='font-bold text-2xl'>{group.name}</h1>
          </div>
          <div className='flex justify-end m-2'>
            <button className='mr-5 px-4 py-2 border rounded bg-green-400 text-slate-100'>Adicionar transação</button>
          </div>
          <div className='flex flex-col items-center'>
            <InfoBox title='Informações do grupo'>
              <div>
                <span className='font-bold'>Criador: </span>
                <span className='italic'>{group.creator}</span>
              </div>
              <div>
                <span className='font-bold'>Participantes: </span>
                <span className='italic'>{group.participants && group.participants.map(participant => (participant))}</span>
              </div>
            </InfoBox>
            <InfoBox title='Devedores' className='mt-2'>
              {group.allGroupDebts && group.allGroupDebts.map(debt => (
                <div key={debt.creditor}>
                  <span className='font-bold'>{debt.debtor}</span> deve <span className='italic'>R$ {debt.total}</span> para <span className='font-bold'>{debt.creditor}</span> devido essas transações:
                  <div className='flex flex-col items-center mt-2'>
                    {group.transactions.filter(transaction => (transaction.to === debt.creditor && transaction.from === debt.debtor) || (transaction.to === debt.debtor && transaction.from === debt.creditor)).map(transaction => (
                      <div key={transaction.datetime}>
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
    </>
  );
}

export default GroupPage;   