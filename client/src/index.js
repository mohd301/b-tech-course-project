import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import Store from "./store/Store"

import { Provider } from 'react-redux'
import { ThemeProvider } from "next-themes"

import './styles/globals.css'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Provider store={Store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)
