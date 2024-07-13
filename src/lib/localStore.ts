// src/lib/localStore.ts

export interface Card {
    id: number;
    name: string;
}

export interface Column {
    id: number;
    name: string;
    items: Card[];
}

function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getLocalData(key: string): any {
    if (!isBrowser()) return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

export function setLocalData(key: string, value: any): void {
    if (!isBrowser()) return;
    localStorage.setItem(key, JSON.stringify(value));
}
