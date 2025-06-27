import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import AppRoutes from './routes/AppRoutes';
import ApiStatusGuard from "./components/ApiStatusGuard.tsx";

const App: React.FC = () => {
  return (
    <Router>
        <AppRoutes />
    </Router>
  );
};

export default App;
