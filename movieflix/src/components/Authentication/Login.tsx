import { FormEvent } from 'react';
import Input from '../../Design/Input';
import Button from '../../Design/Button';
import { Link } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../utils/Validator';
import useInput from '../../hooks/userInput'; // Import the useInput hook
import { useAppSelector } from '../../hooks/typeHooks';

type PropsType = {
  onSubmitHandler: (email: string, password: string) => void;
  redirectUrl: string | null;
};

const LoginForm = ({ onSubmitHandler, redirectUrl }: PropsType) => {

  const hasLoginErr = useAppSelector((state) => state.auth.hasLoginError)

  // Define validation functions for email and password
  const validateEmailInput = (value: string) => {
    const isEmail = validateEmail(value);
    return isEmail.isValid ? null : isEmail.errorMsg || 'Invalid Email!';
  };

  const validatePasswordInput = (value: string) => {
    const isPassword = validatePassword(value);
    return isPassword.isValid ? null : isPassword.errorMsg || 'Invalid Password!';
  };

  // Initialize useInput for email and password
  const {
    value: email,
    errorMsg: emailError,
    isTouched: isEmailTouched,
    valueChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
  } = useInput(validateEmailInput);

  const {
    value: password,
    errorMsg: passwordError,
    isTouched: isPasswordTouched,
    valueChangeHandler: passwordChangeHandler,
    inputBlurHandler: passwordBlurHandler,
  } = useInput(validatePasswordInput);

  let formIsValid = false

  if(!emailError && !passwordError) {
    formIsValid = true
  }

  const formSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if the form is valid
    if (formIsValid) {
      onSubmitHandler(email, password);
    }
  };

  return (
    <form
      className="w-full max-w-[400px] flex flex-col gap-4 bg-gradient-to-br from-black to-red-900 text-gray-200 p-8 rounded-2xl shadow-2xl border border-red-800"
      onSubmit={formSubmitHandler}
    >
      <h3 className="text-center text-red-500 text-3xl font-bold mb-6">
        Login
      </h3>
      {hasLoginErr && <p className="text-red-400 text-center p-3 bg-red-900/30 rounded-lg">{hasLoginErr}</p>}
      <Input
        name="email"
        label="Email Address"
        inputError={isEmailTouched ? emailError : null}
        type="email"
        value={email}
        onChange={emailChangeHandler}
        onBlur={emailBlurHandler}
        placeholder="Enter your email"
        className="bg-black/50 text-gray-200 rounded-lg border-red-700 focus:border-red-500 focus:ring-red-500"
      />
      <Input
        type="password"
        label="Password"
        name="password"
        inputError={isPasswordTouched ? passwordError : null}
        value={password}
        onChange={passwordChangeHandler}
        onBlur={passwordBlurHandler}
        placeholder="Enter your password"
        className="bg-black/50 text-gray-200 rounded-lg border-red-700 focus:border-red-500 focus:ring-red-500"
      />
      <Button 
        type="submit" 
        btnClass="mt-6 text-lg bg-red-600 hover:bg-red-700 transition-colors duration-300 rounded-lg py-3 font-semibold" 
        disabled={!formIsValid}
      >
        Sign In
      </Button>
      <p className="text-center mt-6 text-sm">
        New user?{' '}
        <Link 
          className="text-red-400 font-semibold hover:text-red-300 transition-colors duration-300" 
          to={`${redirectUrl ? `/auth?signup=true&callback=${redirectUrl}` : '/auth?signup=true'}`}
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
