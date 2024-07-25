import { ConfigProvider } from "antd"
import ptBR from "antd/es/locale/pt_BR"
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { App } from './App.tsx'
import DPEmptyData from "./components/DPEmptyData/index.tsx"
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerBg: "cadetblue",
          }
        }
      }}
      renderEmpty={DPEmptyData}
      locale={ptBR}>
      <App />
    </ConfigProvider>
  </BrowserRouter>
)
