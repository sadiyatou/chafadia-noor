// src/utils/helpers.js

import {
  Alert,
  Linking,
  Platform,
} from 'react-native';

/* =========================================================
   DATE & TIME
========================================================= */

export const formatDate = date => {
  if (!date) return '';

  const newDate = new Date(date);

  return newDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = date => {
  if (!date) return '';

  const newDate = new Date(date);

  return newDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = date => {
  if (!date) return '';

  return `${formatDate(date)} • ${formatTime(date)}`;
};

export const timeAgo = timestamp => {
  if (!timestamp) return '';

  const now = new Date();
  const past = new Date(timestamp);

  const seconds = Math.floor(
    (now - past) / 1000
  );

  const minutes = Math.floor(seconds / 60);

  const hours = Math.floor(minutes / 60);

  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(timestamp);
};

/* =========================================================
   STRING HELPERS
========================================================= */

export const capitalize = text => {
  if (!text) return '';

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
};

export const truncateText = (
  text,
  limit = 100
) => {
  if (!text) return '';

  return text.length > limit
    ? `${text.substring(0, limit)}...`
    : text;
};

export const generateInitials = name => {
  if (!name) return '';

  const names = name.split(' ');

  if (names.length === 1) {
    return names[0][0]?.toUpperCase();
  }

  return (
    names[0][0] +
    names[1][0]
  ).toUpperCase();
};

export const removeSpaces = text => {
  if (!text) return '';

  return text.replace(/\s/g, '');
};

export const slugify = text => {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

/* =========================================================
   VALIDATION
========================================================= */

export const validateEmail = email => {
  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email);
};

export const validatePassword =
  password => {
    return password?.length >= 6;
  };

export const validatePhone =
  phone => {
    const regex =
      /^[0-9+\-\s()]+$/;

    return regex.test(phone);
  };

/* =========================================================
   RANDOM HELPERS
========================================================= */

export const randomId = () => {
  return Math.random()
    .toString(36)
    .substring(2, 12);
};

export const randomNumber = (
  min,
  max
) => {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
};

/* =========================================================
   ARRAY HELPERS
========================================================= */

export const uniqueArray = array => {
  return [...new Set(array)];
};

export const shuffleArray = array => {
  return [...array].sort(
    () => Math.random() - 0.5
  );
};

/* =========================================================
   FILE HELPERS
========================================================= */

export const getFileExtension =
  filename => {
    if (!filename) return '';

    return filename
      .split('.')
      .pop()
      .toLowerCase();
  };

export const isImageFile =
  filename => {
    const ext =
      getFileExtension(filename);

    return [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
    ].includes(ext);
  };

export const isVideoFile =
  filename => {
    const ext =
      getFileExtension(filename);

    return [
      'mp4',
      'mov',
      'avi',
      'mkv',
      'webm',
    ].includes(ext);
  };

/* =========================================================
   URL HELPERS
========================================================= */

export const openURL = async url => {
  try {
    const supported =
      await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Error',
        'Cannot open this link.'
      );
    }
  } catch (error) {
    console.log(
      'OPEN URL ERROR:',
      error
    );
  }
};

/* =========================================================
   SHARE MESSAGE
========================================================= */

export const createShareMessage =
  ({
    title = '',
    message = '',
    url = '',
  }) => {
    return `${title}\n\n${message}\n\n${url}`;
  };

/* =========================================================
   PLATFORM
========================================================= */

export const isIOS =
  Platform.OS === 'ios';

export const isAndroid =
  Platform.OS === 'android';

/* =========================================================
   PRAYER HELPERS
========================================================= */

export const getPrayerGreeting =
  () => {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return 'Assalamu Alaikum ☀️';
    }

    if (hour < 18) {
      return 'Good Afternoon 🌿';
    }

    return 'Good Evening 🌙';
  };

export const getIslamicGreeting =
  () => {
    const greetings = [
      'السلام عليكم ورحمة الله وبركاته',
      'May Allah bless your day',
      'May Allah grant you peace',
      'Remember Allah often',
      'May your prayers be accepted',
    ];

    return greetings[
      Math.floor(
        Math.random() *
          greetings.length
      )
    ];
  };

/* =========================================================
   COMMUNITY HELPERS
========================================================= */

export const formatLikes = count => {
  if (!count) return '0';

  if (count >= 1000000) {
    return `${(
      count / 1000000
    ).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(
      count / 1000
    ).toFixed(1)}K`;
  }

  return count.toString();
};

export const formatFollowers =
  formatLikes;

/* =========================================================
   COLORS
========================================================= */

export const randomColor = () => {
  const colors = [
    '#0F6B50',
    '#F4C95D',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#10B981',
  ];

  return colors[
    Math.floor(
      Math.random() * colors.length
    )
  ];
};

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  formatDate,
  formatTime,
  formatDateTime,
  timeAgo,

  capitalize,
  truncateText,
  generateInitials,
  removeSpaces,
  slugify,

  validateEmail,
  validatePassword,
  validatePhone,

  randomId,
  randomNumber,

  uniqueArray,
  shuffleArray,

  getFileExtension,
  isImageFile,
  isVideoFile,

  openURL,
  createShareMessage,

  isIOS,
  isAndroid,

  getPrayerGreeting,
  getIslamicGreeting,

  formatLikes,
  formatFollowers,

  randomColor,
};