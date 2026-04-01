import { createContext, useContext, useState, useMemo } from 'react';

const CursorContext = createContext();

export const CursorProvider = ({ children }) => {
    const [cursorType, setCursorType] = useState('default');
    const [cursorText, setCursorText] = useState('');

    const value = useMemo(() => ({
        cursorType,
        setCursorType,
        cursorText,
        setCursorText
    }), [cursorType, cursorText]);

    return (
        <CursorContext.Provider value={value}>
            {children}
        </CursorContext.Provider>
    );
};

export const useCursor = () => {
    const context = useContext(CursorContext);
    if (!context) {
        throw new Error('useCursor must be used within a CursorProvider');
    }
    return context;
};
