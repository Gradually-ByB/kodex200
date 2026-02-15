export function isMarketOpen(): boolean {
    // Korean Market Hours: Mon-Fri, 09:00 - 15:30 KST
    const now = new Date();
    const kstOffset = 9 * 60; // KST is UTC+9
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kst = new Date(utc + (kstOffset * 60000));

    const day = kst.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const hour = kst.getHours();
    const minute = kst.getMinutes();

    const isWeekday = day >= 1 && day <= 5;
    const timeInMinutes = hour * 60 + minute;
    const isOpenTime = timeInMinutes >= 9 * 60 && timeInMinutes <= 15 * 60 + 30;

    return isWeekday && isOpenTime;
}
