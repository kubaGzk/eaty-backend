interface ValidationResult {
  valid: boolean;
  errors: object;
}

const usernameRegex = /^(?=.*[A-Za-z])[A-Za-z\d]{6,16}$/;
const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%_*#?&]{8,32}$/;
const mailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const nameRegex = /^[A-Za-z\s\d]{3,32}$/;
const sizeRegex = /^[A-Za-z\s\d]{1,16}$/;
const uniqueRegex = /^[A-Za-z\d]{3,16}$/;
const descriptionRegex = /^[A-Za-z\d]{1,64}$/;

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
    if (!email.match(mailRegex)) {
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

export const validateSizeInput = (
  name: string,
  values: string[],
): ValidationResult => {
  const errors: { name?: string; values?: string } = {};

  if (!name.match(nameRegex)) {
    errors.name =
      'Name should contain minimum 3 and max 32 characters. Only letters, numbers and spaces are allowed.';
  }

  const valuesReduced = values.reduce((acc: string[], val) => {
    if (!val.match(sizeRegex)) {
      acc.push(`${val} is incorrect.`);
    }

    return acc;
  }, []);

  if (valuesReduced.length > 0) {
    errors.values =
      valuesReduced.join(' ') +
      'Size should contain minimum 1 and max 16 characters. Only letters, numbers and spaces are allowed.';
  }

  return { valid: Object.keys(errors).length < 1, errors };
};

export const validateIngredientInput = (
  name: string,
  uniqueName: string,
): ValidationResult => {
  const errors: { name?: string; uniqueName?: string } = {};

  if (!name.match(nameRegex)) {
    errors.name =
      'Name should contain minimum 3 and max 32 characters. Only letters, numbers and spaces are allowed.';
  }

  if (!uniqueName.match(uniqueRegex)) {
    errors.uniqueName =
      'Name should contain minimum 3 and max 16 characters. Only letters and number are allowed.';
  }

  return { valid: Object.keys(errors).length < 1, errors };
};

export const validateCategoryInput = (
  name: string,
  options?: any[],
): ValidationResult => {
  const errors: { name?: string; options?: string } = {};

  if (!name.match(nameRegex)) {
    errors.name =
      'Name should contain minimum 3 and max 32 characters. Only letters, numbers and spaces are allowed.';
  }

  if (options) {
    const optionsReduced = options.reduce((acc: string[], opt) => {
      if (!opt.match(nameRegex)) {
        acc.push(`${opt} is incorrect.`);
      }

      for (const val of opt.values) {
        if (!val.value.match(sizeRegex)) {
          acc.push(`${val} is incorrect.`);
        }
      }

      return acc;
    }, []);

    if (optionsReduced.length > 0) {
      errors.options =
        optionsReduced.join(' ') +
        'Option should contain minimum 1 and max 32 characters, Values minimum 1 and max 16. Only letters, numbers and spaces are allowed.';
    }
  }

  return { valid: Object.keys(errors).length < 1, errors };
};

export const validateCustomCompositionInput = (
  name: string,
  groups: any[],
): ValidationResult => {
  const errors: { name?: string; options?: string } = {};

  if (!name.match(nameRegex)) {
    errors.name =
      'Name should contain minimum 3 and max 32 characters. Only letters, numbers and spaces are allowed.';
  }

  const groupsReduced = groups.reduce((acc: string[], gr) => {
    if (!gr.match(sizeRegex)) {
      acc.push(`${gr} is incorrect.`);
    }

    return acc;
  }, []);

  if (groupsReduced.length > 0) {
    errors.options =
      groupsReduced.join(' ') +
      'Group should contain minimum 1 and max 16 characters. Only letters, numbers and spaces are allowed.';
  }

  return { valid: Object.keys(errors).length < 1, errors };
};

export const validateItemInput = (
  name: string,
  description?: string,
  itemOptions?: any[],
): ValidationResult => {
  const errors: {
    name?: string;
    description?: string;
    itemOptions?: string;
  } = {};

  if (!name.match(nameRegex)) {
    errors.name =
      'Name should contain minimum 3 and max 32 characters. Only letters, numbers and spaces are allowed.';
  }

  if (description && !description.match(descriptionRegex)) {
    errors.description =
      'Name should contain max 64 characters. Only letters, numbers and spaces are allowed.';
  }

  if (itemOptions) {
    const optionsReduced = itemOptions.reduce((acc: string[], opt) => {
      if (!opt.match(nameRegex)) {
        acc.push(`${opt} is incorrect.`);
      }

      for (const val of opt.values) {
        if (!val.value.match(sizeRegex)) {
          acc.push(`${val} is incorrect.`);
        }
      }

      return acc;
    }, []);

    if (optionsReduced.length > 0) {
      errors.itemOptions =
        optionsReduced.join(' ') +
        'Option should contain minimum 1 and max 32 characters, Values minimum 1 and max 16. Only letters, numbers and spaces are allowed.';
    }
  }

  return { valid: Object.keys(errors).length < 1, errors };
};
