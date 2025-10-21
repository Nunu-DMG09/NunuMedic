import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Header from '../components/header.jsx';

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div>
      
     
      <main style={{ padding: 12 }}>
        <Outlet />
      </main>
    </div>
  );
}