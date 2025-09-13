import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import AppRoutes from './routes/AppRoutes';
import ApiStatusGuard from "./components/ApiStatusGuard.tsx";
import {store} from "./store/slices";
import {Provider} from "react-redux";

const App: React.FC = () => {
    return (
        <Router>
            <ApiStatusGuard>
                <Provider store={store}>
                    <AppRoutes />
                </Provider>
            </ApiStatusGuard>
        </Router>
    );
};

export default App;
