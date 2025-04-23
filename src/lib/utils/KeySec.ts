export function secKey(key: string | undefined): string {
    if (!key) {
        return '[undefined or empty key]';
    }
    const toShow = 2;
    return key.slice(0, toShow) + '******' + key.slice(-toShow) + '-' + key.length;
}
