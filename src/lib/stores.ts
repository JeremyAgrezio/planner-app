// src/lib/stores.ts
import { writable } from 'svelte/store';
import { getLocalData, setLocalData, type Column } from './localStore';

const storedColumns: Column[] = getLocalData('columns') || [];
export const columns = writable<Column[]>(storedColumns);

columns.subscribe((value) => {
    setLocalData('columns', value);
});
