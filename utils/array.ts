export function hasDuplicatesById<T extends { id: any }>(array: T[]) {
    return new Set(array.map(v => v.id)).size !== array.length;
}

export function hasDuplicatesByKey<T>(
    array: T[],
    key: (item: T) => any
) {
    return new Set(array.map(key)).size !== array.length;
}