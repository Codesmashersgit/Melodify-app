import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [historyStack, setHistoryStack] = useState([location.pathname]);
    const [pointer, setPointer] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (isNavigating) {
            setIsNavigating(false);
            return;
        }

        // New navigation
        const newStack = historyStack.slice(0, pointer + 1);
        if (newStack[newStack.length - 1] !== location.pathname) {
            newStack.push(location.pathname);
            setHistoryStack(newStack);
            setPointer(newStack.length - 1);
        }
    }, [location, isNavigating]);

    const goBack = () => {
        if (pointer > 0) {
            setIsNavigating(true);
            setPointer(pointer - 1);
            navigate(-1);
        }
    };

    const goForward = () => {
        if (pointer < historyStack.length - 1) {
            setIsNavigating(true);
            setPointer(pointer + 1);
            navigate(1);
        }
    };

    const canGoBack = pointer > 0;
    const canGoForward = pointer < historyStack.length - 1;

    return (
        <HistoryContext.Provider value={{ goBack, goForward, canGoBack, canGoForward }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useAppHistory = () => useContext(HistoryContext);
