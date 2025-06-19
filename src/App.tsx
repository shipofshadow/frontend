import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import './assets/css/styles.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
