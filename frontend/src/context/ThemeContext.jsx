import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
 
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
   
    return false; 
  });

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    
    html.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    if (isDark) {
      html.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('MODO OSCURO ACTIVADO');
    } else {
      
      html.classList.add('light');
      body.classList.add('light');
      localStorage.setItem('theme', 'light');
      console.log('MODO CLARO ACTIVADO');
    }
    
    console.log('HTML classes:', html.className);
    console.log('Tema guardado:', localStorage.getItem('theme'));
    
  }, [isDark]);

  const toggleTheme = () => {
    console.log('🔄 CAMBIANDO TEMA - Actual:', isDark ? 'OSCURO' : 'CLARO');
    setIsDark(prev => {
      const newValue = !prev;
      console.log('🔄 NUEVO TEMA:', newValue ? 'OSCURO' : 'CLARO');
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}