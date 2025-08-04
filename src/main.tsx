import * as React from 'react';
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster theme="dark" />
  </>
);