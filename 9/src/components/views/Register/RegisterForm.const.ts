import type { RegisterFormValues, RegisterFormErrors, RegisterFormTouched } from "../../../types/types";

export const INITIAL_VALUES: RegisterFormValues = {
  email: "",
  password: "",
};

export const INITIAL_ERRORS: RegisterFormErrors = {
  email: null,
  password: null,
};

export const INITIAL_TOUCHED: RegisterFormTouched = {
  email: false,
  password: false,
};
