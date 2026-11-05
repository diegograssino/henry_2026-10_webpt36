import type { LoginFormValues, LoginFormErrors, LoginFormTouched } from "../../../types/types";

export const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

export const INITIAL_ERRORS: LoginFormErrors = {
  email: null,
  password: null,
};

export const INITIAL_TOUCHED: LoginFormTouched = {
  email: false,
  password: false,
};
