import React from 'react';
import { Routes, Route } from 'react-router';
import PrivateComponent from '../components/PrivateComponent';
import HistoryView from '../views/HistoryView';
import PreferencesView from '../views/PreferencesView';
import DashboardView from '../views/DashboardView';
import ConsoleView from '../views/ConsoleView';
import UserGuide from '../views/UserGuide';
import CountdownView from '../views/CountdownView';

const routes = [
  { path: '/', element: <DashboardView /> },
  { path: '/home', element: <DashboardView /> },
  { path: '/user-guides', element: <UserGuide /> },
  { path: '/history', element: <HistoryView /> },
  { path: '/console', element: <ConsoleView /> },
  { path: '/preferences', element: <PreferencesView /> },
  { path: '/countdown', element: <CountdownView /> },
];

function MyRoutes() {
  return (
    <Routes>
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={<PrivateComponent>{element}</PrivateComponent>} />
      ))}
    </Routes>
  );
}

export default MyRoutes;
