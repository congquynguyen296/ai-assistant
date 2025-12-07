/**
 * Validation utilities - Các hàm validation có thể tái sử dụng
 */

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {{isValid: boolean, error: string|null, field: string|null}}
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return {
      isValid: false,
      error: "Tên đăng nhập không được để trống",
      field: "username",
    };
  }

  if (username.trim().length < 3) {
    return {
      isValid: false,
      error: "Tên đăng nhập phải có ít nhất 3 ký tự",
      field: "username",
    };
  }

  return { isValid: true, error: null, field: null };
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {{isValid: boolean, error: string|null, field: string|null}}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: "Email không được để trống",
      field: "email",
    };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return {
      isValid: false,
      error: "Email không hợp lệ",
      field: "email",
    };
  }

  return { isValid: true, error: null, field: null };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default: 6)
 * @returns {{isValid: boolean, error: string|null, field: string|null}}
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return {
      isValid: false,
      error: "Mật khẩu không được để trống",
      field: "password",
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Mật khẩu phải có ít nhất ${minLength} ký tự`,
      field: "password",
    };
  }

  return { isValid: true, error: null, field: null };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} rePassword - Password confirmation
 * @returns {{isValid: boolean, error: string|null, field: string|null}}
 */
export const validatePasswordConfirmation = (password, rePassword) => {
  if (!rePassword) {
    return {
      isValid: false,
      error: "Vui lòng xác nhận mật khẩu",
      field: "rePassword",
    };
  }

  if (password !== rePassword) {
    return {
      isValid: false,
      error: "Mật khẩu không khớp",
      field: "rePassword",
    };
  }

  return { isValid: true, error: null, field: null };
};

/**
 * Validate login form (email + password)
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {{isValid: boolean, error: string|null, field: string|null}}
 */
export const validateLogin = (email, password) => {
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true, error: null, field: null };
};

/**
 * Validate register form (username + email + password + rePassword)
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} rePassword - Password confirmation
 * @returns {{isValid: boolean, error: string|null, field: string|null}}
 */
export const validateRegister = (username, email, password, rePassword) => {
  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return usernameValidation;
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  // Validate password confirmation
  const rePasswordValidation = validatePasswordConfirmation(
    password,
    rePassword
  );
  if (!rePasswordValidation.isValid) {
    return rePasswordValidation;
  }

  return { isValid: true, error: null, field: null };
};

/**
 * Validate change password form
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {{isValid: boolean, error: string|null, field: string|null}}
 */
export const validateChangePassword = (
  oldPassword,
  newPassword,
  confirmPassword
) => {
  // Validate old password
  const oldPasswordValidation = validatePassword(oldPassword);
  if (!oldPasswordValidation.isValid) {
    return { ...oldPasswordValidation, field: "oldPassword" };
  }

  // Validate new password
  const newPasswordValidation = validatePassword(newPassword);
  if (!newPasswordValidation.isValid) {
    return { ...newPasswordValidation, field: "newPassword" };
  }

  // Check if new password is different from old password
  if (oldPassword === newPassword) {
    return {
      isValid: false,
      error: "Mật khẩu mới phải khác mật khẩu cũ",
      field: "newPassword",
    };
  }

  // Validate password confirmation
  const confirmPasswordValidation = validatePasswordConfirmation(
    newPassword,
    confirmPassword
  );
  if (!confirmPasswordValidation.isValid) {
    return { ...confirmPasswordValidation, field: "confirmPassword" };
  }

  return { isValid: true, error: null, field: null };
};

