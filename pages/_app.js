import { CssBaseline, GeistProvider, Page } from '@geist-ui/core'
import '../styles/globals.css'

function Stake({ Component, pageProps }) {
  return (
    <GeistProvider themeType='dark'>
      <CssBaseline />
      <Page id="page">
        <Component {...pageProps} />
      </Page>
    </GeistProvider>
  )
}

export default Stake
