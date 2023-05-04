import '@/styles/globals.css'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

// it give us time like just now , 2 minute ago etc
import TimeAgo from 'javascript-time-ago' 
import en from 'javascript-time-ago/locale/en.json'  
TimeAgo.addDefaultLocale(en)


export default function App({ Component, pageProps }) {

  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )

  // return <Component {...pageProps} />
}
