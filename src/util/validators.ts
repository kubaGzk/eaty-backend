interface ValidationResult {
  valid: boolean;
  errors: object;
}

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
