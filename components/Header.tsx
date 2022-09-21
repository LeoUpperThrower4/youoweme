type HeaderProps = {
  update: Boolean
  children: React.ReactNode
}

export default function Header({ children }: HeaderProps): JSX.Element {
  return (
    <>
      <header className="bg-cyan-600">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex justify-center">
            {children}
          </div>
        </nav>
      </header>
    </>
  )
}

Header.defaultProps = {
  update: false
}
