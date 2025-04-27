import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import HomePage from "../pages/home";
import ResetPassword from "../components/account/ResetPassword";
import WebSocketNotification from "../components/account/WebSocketNotification";
import { NextUIProvider } from "@nextui-org/react";
import SmoothScroll from "../services/SmoothScroll";
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './ThemeContext';
import ProtectedRoute from '../components/account/ProtectedRoute'; // Import ProtectedRoute

const App = () => {
    return (
        <ThemeProvider>
            <SmoothScroll>
                <NextUIProvider>
                    <Router>
                        <WebSocketNotification />
                        <div className="min-h-screen flex flex-col">
                            <Routes>
                                <Route
                                    path="/*"
                                    element={
                                        <ProtectedRoute allowedRoles={[]}>
                                            <HomePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN']}>
                                            <AdminLayout />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/reset-password"
                                    element={
                                        <ProtectedRoute allowedRoles={[]}>
                                            <ResetPassword />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </div>
                    </Router>
                </NextUIProvider>
            </SmoothScroll>
        </ThemeProvider>
    );
};

export default App;