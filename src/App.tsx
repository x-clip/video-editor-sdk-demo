import './App.less';
// import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate  } from 'react-router-dom';
import Editor from './Editor';
import Export from './Export';

// 开发模式下直接加载js文件，生产模式下使用 txt 文件
function App() {
  return (
    <Routes>
      <Route path="/editor/:id" element={<Editor />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/export" element={<Export />} />
      <Route path="/" element={<Navigate to="/editor" />} />
    </Routes>
  );
}

export default App;
