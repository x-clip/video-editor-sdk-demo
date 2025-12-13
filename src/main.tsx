import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.less';
import { BrowserRouter } from 'react-router-dom'; // 导入 Router

// 黑色主题
// document.body.setAttribute('theme-mode', 'dark');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
