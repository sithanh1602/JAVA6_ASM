import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AuthForm from "../components/account/AuthForm";
import HomePage from "../pages/home";
import Register from "../components/account/Register";

const App = () => {
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Routes>
                    <Route path="/*" element={<HomePage/>}/>
                    <Route path="/admin/*" element={<AdminLayout/>}/>
                    <Route path="/login" element={<AuthForm/>}/>
                </Routes>
            </div>
        </Router>
    );
};

export default App;
