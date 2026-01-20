import { useState, useMemo } from 'react';

export function useTableSearch<T>(data: T[], searchKeys: (keyof T)[]) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) {
            return data;
        }

        const lowerQuery = searchQuery.toLowerCase();

        return data.filter((item) => {
            return searchKeys.some((key) => {
                const value = item[key];
                if (value == null) return false;
                return String(value).toLowerCase().includes(lowerQuery);
            });
        });
    }, [data, searchQuery, searchKeys]);

    return {
        searchQuery,
        setSearchQuery,
        filteredData
    };
}
