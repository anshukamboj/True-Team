const TZ = process.env.TIMEZONE || 'Asia/Kolkata';

// "2026-10-13" format, organization ke timezone mein
const todayStr = (d = new Date()) => d.toLocaleDateString('en-CA', { timeZone: TZ });

// 9:30 ke baad clock-in = late
const isLate = (d) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === 'hour').value);
  const m = Number(parts.find((p) => p.type === 'minute').value);
  return h * 60 + m > 9 * 60 + 30;
};

module.exports = { todayStr, isLate };