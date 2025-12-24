import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider - Manages both light/dark theme and Christmas decorations
 * 
 * CHRISTMAS MODE:
 * - Enabled by default (localStorage key: 'christmas_mode')
 * - To disable: localStorage.setItem('christmas_mode', 'false')
 * - To enable: localStorage.setItem('christmas_mode', 'true')
 * - CSS decorations only in /public/christmas.css
 * - Does not change light/dark color scheme
 * - Easy to toggle via useTheme().toggleChristmasMode(boolean)
 */
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [christmasMode, setChristmasMode] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Load Christmas mode (ALWAYS enabled by default - only disabled if explicitly set to 'false')
        const christmasEnabled = localStorage.getItem('christmas_mode') !== 'false';
        setChristmasMode(christmasEnabled);
        document.documentElement.setAttribute('data-christmas', christmasEnabled ? 'true' : 'false');
    }, []);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleChristmasMode = (enabled) => {
        setChristmasMode(enabled);
        localStorage.setItem('christmas_mode', enabled.toString());
        document.documentElement.setAttribute('data-christmas', enabled ? 'true' : 'false');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, christmasMode, toggleChristmasMode, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
