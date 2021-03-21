interface ValidationResult {
  valid: boolean;
  errors: object;
}

const usernameRegex = /^(?=.*[A-Za-z])[A-Za-z\d]{6,16}$/;
const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%_*#?&]{8,32}$/;

export const validateLoginInput = (
  username: string,
  password: string,
): ValidationResult => {
  const errors: { username?: string; password?: string } = {};

  if (username.trim() === '') {
    errors.username = 'Username must be provided.';
  }
  if (password.trim() === '') {
    errors.password = 'Password cannot be empty.';
  }

  return { valid: Object.keys(errors).length < 1, errors };
};

export const validateCreateUserInput = (
  firstname: string,
  lastname: string,
  email: string,
): ValidationResult => {
  const errors: { firstname?: string; lastname?: string; email?: string } = {};

  if (firstname.trim() === '') {
    errors.firstname = 'First name must not be empty';
  }

  if (lastname.trim() === '') {
    errors.lastname = 'Last name must not be empty';
  }

  if (email.trim() === '') {
    errors.email = 'Email must not be empty';
  } else {
    const regEx = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email.match(regEx)) {
      errors.email = 'Email must be a valid email address';
    }
  }

  return { valid: Object.keys(errors).length < 1, errors };
};

export const validateRegisterInput = (
  username: string,
  password: string,
): ValidationResult => {
  const errors: { username?: string; password?: string } = {};

  if (!username.match(usernameRegex)) {
    errors.username =
      'Username should contain at least one letter, minimum 6 and max 16 characters. No special characters allowed.';
  }
  if (!password.match(passRegex)) {
    errors.password =
      'Password should contain at least one number and letter, minimum 8 and max 32 characters.';
  }

  return { valid: Object.keys(errors).length < 1, errors };
};

export const validatePasswordInput = (password: string): ValidationResult => {
  const errors: { password?: string } = {};

  if (!password.match(passRegex)) {
    errors.password =
      'Password should contain at least one number and letter, minimum 8 and max 32 characters.';
  }

  return { valid: Object.keys(errors).length < 1, errors };
};
