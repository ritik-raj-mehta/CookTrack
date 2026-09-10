import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { Provider } from 'react-redux'
import { persistor, store } from './stores/store.tsx'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </BrowserRouter>

)
