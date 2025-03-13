import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for theme management
export const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
    // Check if a theme preference exists in localStorage
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('darkMode');
        return savedTheme ? JSON.parse(savedTheme) : false;
    });

    // Update localStorage when theme changes
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));

        // Apply theme to document
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Toggle function
    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook for easier usage
export const useTheme = () => useContext(ThemeContext);