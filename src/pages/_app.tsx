import '../styles/globals.css'
import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import axios from 'axios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,//restAPIのfetchに失敗した場合デフォルトで３回りトライする
      refetchOnWindowFocus: false,//デフォルトでブラウザにフォーカスが当たった時restAPIへのfetchが走る
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  axios.defaults.withCredentials = true//フロントサイドとサーバーサイドでcookieのやり取りをする場合-true
  useEffect(() => {
    const getCsrfToken = async () => {
      console.log('csrfcheck');
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/csrf`
      )
      axios.defaults.headers.common['csrf-token'] = data.csrfToken//headerにtoken設定
    }
    getCsrfToken()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: 'dark',
          fontFamily: 'Verdana, sans-serif',
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default MyApp