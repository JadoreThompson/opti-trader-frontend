import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'


// Local
import App from './App.tsx'
import Dashboard from './pages/Dashboard.tsx';


createRoot(document.getElementById('root')!).render(
  <App />
)
