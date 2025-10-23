export const formatTime = (date, locale = 'en-US') => {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const formatDate = (date, locale = 'en-US') => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatISODate = (date) => {
  return date.toISOString().split('T')[0];
};

export const formatDuration = (milliseconds) => {
  if (milliseconds < 0) milliseconds = 0;
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const calculateDuration = (log) => {
    if (log.type !== 'work' || !log.startTime || !log.endTime) return 0;
    const start = new Date(log.startTime).getTime();
    const end = new Date(log.endTime).getTime();
    const breakMs = log.breakMinutes * 60 * 1000;
    return end - start - breakMs;
};

export const calculateOvertime = (durationMs, profile) => {
    const requiredMs = profile.workHoursPerDay * 60 * 60 * 1000;
    const overtimeMs = durationMs - requiredMs;
    return overtimeMs > 0 ? overtimeMs : 0;
};
