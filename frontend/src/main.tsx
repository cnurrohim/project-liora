import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // <- ini penting!

import { loadPlugins } from "./utils/plugin/pluginLoader.ts";
import { pluginList } from "./plugin.config.ts";

loadPlugins(pluginList);

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
