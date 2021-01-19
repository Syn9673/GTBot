import Head from 'next/head'
import '../public/css/argon.min.css'
import '../public/css/index.css'

const App = ({ Component, props }) => (
  <>
    <Head>
      <title>Growtopia Bot | By: Alexander#6398</title>
    </Head>
    <Component {...props} />
  </>
)

export default App