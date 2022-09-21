import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { GroupsProvider } from '../hooks/useGroups'

function MyApp({ Component, pageProps: {session, ...pageProps} }: AppProps) {
  return (
    <GroupsProvider>
      <Component {...pageProps} />
    </GroupsProvider>
  )
}

export default MyApp
