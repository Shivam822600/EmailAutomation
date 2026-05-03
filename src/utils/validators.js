const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => {
  return typeof email === 'string' && emailRegex.test(email.trim().toLowerCase());
};

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

module.exports = {
  isValidEmail,
  normalizeEmail,
};
