import {
  INVALID_ERROR_MESSAGE,
  REQUIRED_ERROR_MESSAGE,
  validateEmail,
} from "./validations";

const MOCKED_EMAIL = "pepe@pepe.com";
const MOCKED_INVALID_EMAIL = "wrong";
const MOCKED_EMPTY_EMAIL = "";

describe("validateEmail helper", () => {
  it("should return null for a valid email", () => {
    expect(validateEmail(MOCKED_EMAIL)).toBe(null);
  });

  it("should return an error messge for an invalid email", () => {
    expect(validateEmail(MOCKED_INVALID_EMAIL)).toBe(INVALID_ERROR_MESSAGE);
  });

  it("should return an error messge for an empty email", () => {
    expect(validateEmail(MOCKED_EMPTY_EMAIL)).toBe(REQUIRED_ERROR_MESSAGE);
  });
});
