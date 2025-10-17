import { useState } from 'react'
import './App.css'
import ProductoList from './components/inventario/ProductoList';
import Header from './components/header.jsx';
function App() {
  return (
    <>
      <Header />
      <div className="container">
        <ProductoList />
      </div>
    </>
  );
}

export default App;