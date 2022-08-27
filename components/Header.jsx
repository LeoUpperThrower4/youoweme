export default function Example() {

  function handleCreateGroup() {
    alert('You clicked me');
  }

  return (
    <header className="bg-cyan-600">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex justify-center">
          <button onClick={handleCreateGroup} className="rounded border-2 border-cyan-700 px-4 py-2 my-4 text-slate-100">Criar Grupo</button>
        </div>
      </nav>
    </header>
  )
}
