/**
 * Formats a date to a local ISO string. It is the format used by the backend and the database.
 * @param date
 */
export function formatDateToLocalISO(date: Date) {
    const pad = (num: number) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function formatDateToTimeString(date: Date | string, showTime: boolean = true, showSeconds: boolean = false) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    let str = date.toLocaleString('en-US', {day: "numeric", month: 'short', year: 'numeric'});
    if (showTime) {
        str += ` ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined})}`;
    }
    return str;
}

export const formatCoordinate = (value: number) => {
    const absValue = Math.abs(value);
    const degrees = Math.floor(absValue);
    const minutes = Math.floor((absValue - degrees) * 60);
    const seconds = Math.round((absValue - degrees - minutes / 60) * 3600);
    return `${degrees}°${minutes}'${seconds}"`;
};
export const formatLat = (lat: number | null) => {
    if (lat === null) return '∅';
    return `${formatCoordinate(lat)}${lat >= 0 ? 'N' : 'S'}`;
};
export const formatLong = (long: number | null) => {
    if (long === null) return '∅';
    return `${formatCoordinate(long)}${long >= 0 ? 'E' : 'W'}`;
};
