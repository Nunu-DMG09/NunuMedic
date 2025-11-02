import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Icon = {
  Dashboard: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Sales: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Inventory: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Movimientos: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-3-6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Users: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  History: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Settings: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5"/></svg>
};

export default function DashboardLayout() {
  const menuItems = [
    { to: '/dashboard', icon: Icon.Dashboard, label: 'Dashboard' },
    { to: '/ventas', icon: Icon.Sales, label: 'Ventas' },
    { to: '/ventas/historial', icon: Icon.History, label: 'Historial' },
    { to: '/inventario', icon: Icon.Inventory, label: 'Inventario' },
    { to: '/movimientos', icon: Icon.Movimientos, label: 'Movimientos' },
    { to: '/admins', icon: Icon.Users, label: 'Usuarios' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* SIDEBAR */}
      <nav className="w-28 bg-white shadow-xl border-r border-slate-200/60 flex flex-col items-center py-8 relative">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
        
        {/* Logo */}
        <div className="mb-10">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">NU</span>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="flex flex-col gap-3 w-full px-3">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                }`
              }
            >
              {item.icon}
              <div className="absolute left-full ml-6 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 min-w-max">
                {item.label}
              </div>
            </NavLink>
          ))}
        </div>

        {/* Version */}
        <div className="mt-auto text-xs text-slate-400 font-medium">v2.0</div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  NUNUMEDIC - Dashboard
                </h1>
                <p className="text-slate-600 text-base mt-1">Panel de control administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Notifications */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L13 8l6 1-4.5 4.5L16 20l-6-3-6 3 1.5-6.5L1 9l6-1 3-6z"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</div>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">DM</span>
                </div>
                <span className="font-semibold text-slate-700 text-base">L. David Mesta</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA - Aquí se renderiza el contenido de cada página */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// import React from 'react';
// import { NavLink, Outlet } from 'react-router-dom';
// import { useTheme } from '../context/ThemeContext';

// const Icon = {
//   Dashboard: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" stroke="currentColor" strokeWidth="1.5"/></svg>,
//   Sales: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="1.5"/></svg>,
//   Inventory: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.5"/></svg>,
//   Movimientos: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-3-6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5"/></svg>,
//   Users: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5"/></svg>,
//   History: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
//   Settings: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5"/></svg>,
//   Sun: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/></svg>,
//   Moon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/></svg>
// };

// export default function DashboardLayout() {
//   const { isDark, toggleTheme } = useTheme();

//   const menuItems = [
//     { to: '/dashboard', icon: Icon.Dashboard, label: 'Dashboard' },
//     { to: '/ventas', icon: Icon.Sales, label: 'Ventas' },
//     { to: '/ventas/historial', icon: Icon.History, label: 'Historial' },
//     { to: '/inventario', icon: Icon.Inventory, label: 'Inventario' },
//     { to: '/movimientos', icon: Icon.Movimientos, label: 'Movimientos' },
//     { to: '/admins', icon: Icon.Users, label: 'Usuarios' }
//   ];

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
//       {/* SIDEBAR */}
//       <nav className="w-28 bg-white dark:bg-slate-800 shadow-xl border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center py-8 relative transition-all duration-300">
//         <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
        
//         {/* Logo */}
//         <div className="mb-10">
//           <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
//             <span className="text-white font-bold text-xl">NU</span>
//           </div>
//         </div>
        
//         {/* Menu Items */}
//         <div className="flex flex-col gap-3 w-full px-3">
//           {menuItems.map(item => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               title={item.label}
//               className={({ isActive }) =>
//                 `group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
//                   isActive 
//                     ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
//                     : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:scale-105'
//                 }`
//               }
//             >
//               {item.icon}
//               <div className="absolute left-full ml-6 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 min-w-max">
//                 {item.label}
//               </div>
//             </NavLink>
//           ))}
//         </div>

//         {/* Version */}
//         <div className="mt-auto text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors duration-300">v2.0</div>
//       </nav>

//       {/* MAIN CONTENT AREA */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* TOP HEADER */}
//         <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 dark:border-slate-700/50 px-12 py-6 transition-all duration-300">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-6">
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent transition-all duration-300">
//                   NUNUMEDIC - Dashboard
//                 </h1>
//                 <p className="text-slate-600 dark:text-slate-400 text-base mt-1 transition-colors duration-300">Panel de control administrativo</p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-6">
//               {/* BOTÓN DE CAMBIO DE TEMA - MEJORADO */}
//               <button
//                 onClick={() => {
//                   console.log('🎨 Cambiando tema:', isDark ? 'OSCURO → CLARO' : 'CLARO → OSCURO');
//                   toggleTheme();
                  
//                   // Mostrar feedback visual
//                   setTimeout(() => {
//                     console.log('✅ Tema cambiado a:', !isDark ? 'OSCURO' : 'CLARO');
//                     console.log('📱 HTML tiene clase dark:', document.documentElement.classList.contains('dark'));
//                   }, 100);
//                 }}
//                 className={`
//                   group relative p-4 rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-110 active:scale-95
//                   ${isDark 
//                     ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 text-slate-900 hover:from-yellow-300 hover:via-amber-300 hover:to-orange-400' 
//                     : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-yellow-400 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800'
//                   }
//                   before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r 
//                   ${isDark 
//                     ? 'before:from-yellow-300 before:to-orange-400' 
//                     : 'before:from-slate-600 before:to-slate-800'
//                   } 
//                   before:opacity-0 hover:before:opacity-20 before:transition-opacity before:duration-300
//                 `}
//                 title={isDark ? '☀️ Cambiar a modo claro' : '🌙 Cambiar a modo oscuro'}
//               >
//                 <div className="relative z-10 flex items-center justify-center">
//                   {isDark ? Icon.Sun : Icon.Moon}
//                 </div>
                
//                 {/* Tooltip mejorado */}
//                 <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
//                   {isDark ? 'Modo Claro ☀️' : 'Modo Oscuro 🌙'}
//                   <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45"></div>
//                 </div>
//               </button>

//               {/* Notifications */}
//               <div className="relative">
//                 <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
//                   <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M10 2L13 8l6 1-4.5 4.5L16 20l-6-3-6 3 1.5-6.5L1 9l6-1 3-6z"/>
//                   </svg>
//                 </div>
//                 <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">3</div>
//               </div>
              
//               {/* User Profile */}
//               <div className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-full border border-blue-200/50 dark:border-slate-600/50 transition-all duration-300 hover:shadow-lg">
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
//                   <span className="text-white font-semibold">DM</span>
//                 </div>
//                 <span className="font-semibold text-slate-700 dark:text-slate-200 text-base transition-colors duration-300">Luis David Mesta Gonzales</span>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* CONTENT AREA */}
//         <main className="flex-1 overflow-auto bg-transparent transition-all duration-300">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }