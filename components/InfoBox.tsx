type InfoBoxProps = {
  title: string,
  children: React.ReactNode,
  className?: string,
}

export default function InfoBox({ title, children, className }: InfoBoxProps): JSX.Element {
  return ( 
    <div className={`w-screen p-4 border-2 rounded max-w-md ${className}`}>
      <div className='flex justify-center'>
        <h1 className='font-bold text-lg'>{ title }</h1>
      </div>
      {children}
  </div>
  )
}
