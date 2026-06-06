
/* =========================================================
   BASIC VALIDATORS
========================================================= */

export const isEmpty = value => {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  );
};

export const isNotEmpty = value => {
  return !isEmpty(value);
};

export const isString = value => {
  return typeof value === 'string';
};

export const isNumber = value => {
  return typeof value === 'number' && !Number.isNaN(value);
};

/* =========================================================
   AUTH VALIDATORS
========================================================= */

export const isValidEmail = email => {
  if (isEmpty(email)) return false;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(String(email).trim());
};

export const isValidPassword = password => {
  return String(password || '').length >= 6;
};

export const isStrongPassword = password => {
  const value = String(password || '');

  const hasMinLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  return (
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSymbol
  );
};

export const passwordsMatch = (password, confirmPassword) => {
  return String(password || '') === String(confirmPassword || '');
};

export const isValidName = name => {
  return String(name || '').trim().length >= 2;
};

export const isValidPhone = phone => {
  if (isEmpty(phone)) return false;

  const regex = /^[0-9+\-\s()]{7,20}$/;

  return regex.test(String(phone).trim());
};

/* =========================================================
   TEXT VALIDATORS
========================================================= */

export const minLength = (value, length = 1) => {
  return String(value || '').trim().length >= length;
};

export const maxLength = (value, length = 100) => {
  return String(value || '').trim().length <= length;
};

export const betweenLength = (value, min = 1, max = 100) => {
  const length = String(value || '').trim().length;

  return length >= min && length <= max;
};

export const hasOnlyLetters = value => {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(String(value || '').trim());
};

export const hasOnlyNumbers = value => {
  return /^[0-9]+$/.test(String(value || '').trim());
};

/* =========================================================
   URL / LINK VALIDATORS
========================================================= */

export const isValidUrl = url => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidImageUrl = url => {
  return (
    isValidUrl(url) &&
    /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
  );
};

/* =========================================================
   ISLAMIC APP VALIDATORS
========================================================= */

export const isValidDuaText = text => {
  return betweenLength(text, 3, 2000);
};

export const isValidPost = ({ title, body }) => {
  return isNotEmpty(title) && isNotEmpty(body);
};

export const isValidComment = text => {
  return betweenLength(text, 1, 500);
};

export const isValidMessage = text => {
  return betweenLength(text, 1, 4000);
};

export const isValidGroupName = name => {
  return betweenLength(name, 2, 60);
};

export const isValidChannelName = name => {
  return betweenLength(name, 2, 80);
};

/* =========================================================
   FILE VALIDATORS
========================================================= */

export const isValidFileSize = (
  size,
  maxSizeMB = 20
) => {
  if (!size) return false;

  const maxBytes = maxSizeMB * 1024 * 1024;

  return size <= maxBytes;
};

export const isAllowedFileType = (
  fileName,
  allowedTypes = []
) => {
  if (!fileName || allowedTypes.length === 0) return true;

  const extension = String(fileName)
    .split('.')
    .pop()
    .toLowerCase();

  return allowedTypes.includes(extension);
};

export const isImageFile = fileName => {
  return isAllowedFileType(fileName, [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
  ]);
};

export const isVideoFile = fileName => {
  return isAllowedFileType(fileName, [
    'mp4',
    'mov',
    'avi',
    'mkv',
    'webm',
  ]);
};

export const isAudioFile = fileName => {
  return isAllowedFileType(fileName, [
    'mp3',
    'm4a',
    'wav',
    'aac',
  ]);
};

export const isDocumentFile = fileName => {
  return isAllowedFileType(fileName, [
    'pdf',
    'doc',
    'docx',
    'txt',
    'ppt',
    'pptx',
    'xls',
    'xlsx',
  ]);
};

/* =========================================================
   FORM VALIDATORS
========================================================= */

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = ({
  fullName,
  email,
  password,
  confirmPassword,
  phone,
}) => {
  const errors = {};

  if (!isValidName(fullName)) {
    errors.fullName = 'Full name is required.';
  }

  if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!passwordsMatch(password, confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (phone && !isValidPhone(phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validatePostForm = ({ title, body }) => {
  const errors = {};

  if (isEmpty(title)) {
    errors.title = 'Title is required.';
  }

  if (isEmpty(body)) {
    errors.body = 'Post content is required.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateMessageForm = text => {
  const errors = {};

  if (!isValidMessage(text)) {
    errors.message = 'Please type a message.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  isEmpty,
  isNotEmpty,
  isString,
  isNumber,

  isValidEmail,
  isValidPassword,
  isStrongPassword,
  passwordsMatch,
  isValidName,
  isValidPhone,

  minLength,
  maxLength,
  betweenLength,
  hasOnlyLetters,
  hasOnlyNumbers,

  isValidUrl,
  isValidImageUrl,

  isValidDuaText,
  isValidPost,
  isValidComment,
  isValidMessage,
  isValidGroupName,
  isValidChannelName,

  isValidFileSize,
  isAllowedFileType,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,

  validateLoginForm,
  validateRegisterForm,
  validatePostForm,
  validateMessageForm,
};