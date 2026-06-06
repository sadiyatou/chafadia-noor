export const now = () => new Date();

/* =========================================================
   TIMESTAMPS
========================================================= */

export const getTimestamp = () => Date.now();

export const getUnixTimestamp = () =>
  Math.floor(Date.now() / 1000);

/* =========================================================
   DATE FORMATTING
========================================================= */

export const formatDate = (
  date,
  locale = 'en-US'
) => {
  if (!date) return '';

  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (
  date,
  locale = 'en-US'
) => {
  if (!date) return '';

  return new Date(date).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (
  date,
  locale = 'en-US'
) => {
  if (!date) return '';

  return new Date(date).toLocaleString(locale);
};

export const formatShortDate = date => {
  if (!date) return '';

  return new Date(date).toLocaleDateString();
};

export const formatShortTime = date => {
  if (!date) return '';

  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* =========================================================
   RELATIVE TIME
========================================================= */

export const timeAgo = timestamp => {
  if (!timestamp) return '';

  const now = Date.now();
  const time = new Date(timestamp).getTime();

  const seconds = Math.floor((now - time) / 1000);

  if (seconds < 60)
    return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60)
    return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24)
    return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7)
    return `${days}d ago`;

  const weeks = Math.floor(days / 7);

  if (weeks < 4)
    return `${weeks}w ago`;

  const months = Math.floor(days / 30);

  if (months < 12)
    return `${months}mo ago`;

  const years = Math.floor(days / 365);

  return `${years}y ago`;
};

/* =========================================================
   CHAT TIME
========================================================= */

export const formatChatTime = timestamp => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const today = new Date();

  const isToday =
    date.toDateString() === today.toDateString();

  if (isToday) {
    return formatShortTime(date);
  }

  return formatShortDate(date);
};

/* =========================================================
   DIFFERENCE
========================================================= */

export const differenceInMinutes = (
  start,
  end
) => {
  return Math.floor(
    (new Date(end) - new Date(start)) /
      (1000 * 60)
  );
};

export const differenceInHours = (
  start,
  end
) => {
  return Math.floor(
    (new Date(end) - new Date(start)) /
      (1000 * 60 * 60)
  );
};

export const differenceInDays = (
  start,
  end
) => {
  return Math.floor(
    (new Date(end) - new Date(start)) /
      (1000 * 60 * 60 * 24)
  );
};

/* =========================================================
   ADD TIME
========================================================= */

export const addMinutes = (
  date,
  minutes
) => {
  const result = new Date(date);
  result.setMinutes(
    result.getMinutes() + minutes
  );
  return result;
};

export const addHours = (
  date,
  hours
) => {
  const result = new Date(date);
  result.setHours(
    result.getHours() + hours
  );
  return result;
};

export const addDays = (
  date,
  days
) => {
  const result = new Date(date);
  result.setDate(
    result.getDate() + days
  );
  return result;
};

/* =========================================================
   IS TODAY / YESTERDAY
========================================================= */

export const isToday = date => {
  const today = new Date();

  return (
    new Date(date).toDateString() ===
    today.toDateString()
  );
};

export const isYesterday = date => {
  const yesterday = new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  return (
    new Date(date).toDateString() ===
    yesterday.toDateString()
  );
};

/* =========================================================
   PRAYER TIMES
========================================================= */

export const getNextPrayer = prayers => {
  if (!prayers) return null;

  const now = new Date();

  const prayerNames = [
    'fajr',
    'dhuhr',
    'asr',
    'maghrib',
    'isha',
  ];

  for (const prayer of prayerNames) {
    const prayerTime = new Date(
      prayers[prayer]
    );

    if (prayerTime > now) {
      return {
        name: prayer,
        time: prayerTime,
      };
    }
  }

  return null;
};

/* =========================================================
   CALL DURATION
========================================================= */

export const formatDuration = seconds => {
  if (!seconds) return '00:00';

  const hrs = Math.floor(seconds / 3600);

  const mins = Math.floor(
    (seconds % 3600) / 60
  );

  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs
      .toString()
      .padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  return `${mins
    .toString()
    .padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

/* =========================================================
   EXPORT
========================================================= */

export default {
  now,

  getTimestamp,
  getUnixTimestamp,

  formatDate,
  formatTime,
  formatDateTime,
  formatShortDate,
  formatShortTime,

  timeAgo,
  formatChatTime,

  differenceInMinutes,
  differenceInHours,
  differenceInDays,

  addMinutes,
  addHours,
  addDays,

  isToday,
  isYesterday,

  getNextPrayer,

  formatDuration,
};