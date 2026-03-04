import { useState, useEffect, useCallback } from 'react';

export interface Command {
    id: string;
    name: string;
    icon?: string;
    action: () => void;
    shortcut?: string;
    category?: string;
}

export function useCommandPalette(commands: Command[]) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const toggle = useCallback(() => setIsOpen(prev => !prev), []);
    const close = useCallback(() => {
        setIsOpen(false);
        setQuery('');
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+Shift+P or Ctrl+Shift+P
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
                e.preventDefault();
                toggle();
            }

            if (e.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle, close]);

    const filteredCommands = query === ''
        ? commands
        : commands.filter(cmd =>
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            cmd.category?.toLowerCase().includes(query.toLowerCase())
        );

    return {
        isOpen,
        setIsOpen,
        query,
        setQuery,
        toggle,
        close,
        filteredCommands
    };
}
