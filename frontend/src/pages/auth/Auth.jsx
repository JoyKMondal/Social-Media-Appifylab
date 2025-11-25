// src/pages/Auth.jsx
import { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { authWithGoogle } from "../../shared/components/firebase/firebase";
import Input from "../../shared/components/FormElements/Input";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

import logo from "../../assets/images/logo.svg";
import googleIcon from "../../assets/images/google.svg";
import shape1 from "../../assets/images/shape1.svg";
import shape2 from "../../assets/images/shape2.svg";
import shape3 from "../../assets/images/shape3.svg";
import loginImg from "../../assets/images/login.png";
import registerImg from "../../assets/images/registration.png";
// import registerDark from "../../assets/images/registration1.png";

const Auth = () => {
  const { isLoggedIn, login } = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const authMode = useSearchParams()[0].get("mode");

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          firstName: undefined,
          lastName: undefined,
          repeatPassword: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          firstName: {
            value: "",
            isValid: false,
          },
          lastName: {
            value: "",
            isValid: false,
          },
          repeatPassword: {
            value: "",
            isValid: false,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  // useEffect(() => {
  //   const mode = searchParams.get("mode");
  //   setIsLoginMode(mode !== "signup");
  // }, [searchParams]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!isLoginMode && !isTermsAccepted) {
      alert("You must agree to the Terms & Conditions to sign up.");
      return;
    }

    if (
      !isLoginMode &&
      formState.inputs.password.value !== formState.inputs.repeatPassword.value
    ) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const endpoint = isLoginMode ? "/api/users/login" : "/api/users/signup";
      const body = isLoginMode
        ? {
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }
        : {
            firstName: formState.inputs.firstName.value,
            lastName: formState.inputs.lastName.value,
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          };

      const data = await sendRequest(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}${endpoint}`,
        "POST",
        JSON.stringify(body),
        { "Content-Type": "application/json" }
      );

      login(data.userId, data.token);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const googleAuthHandler = async () => {
    try {
      const user = await authWithGoogle();
      const data = await sendRequest(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/users/google-auth`,
        "POST",
        JSON.stringify({ access_token: user.accessToken }),
        { "Content-Type": "application/json" }
      );

      login(data.userId, data.token);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (authMode === "sign-in") {
      setIsLoginMode(true);
    }
    if (authMode === "sign-up") {
      setIsLoginMode(false);
    }
  }, [authMode]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {/* {isLoading && <LoadingSpinner asOverlay />} */}
      {isLoggedIn && <Navigate to="/" replace={true} />}

      <div className="min-h-screen bg-neutral-200 from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden flex items-center justify-center py-[100px] z-10">
        {/* Decorative Shapes */}
        <img
          src={shape1}
          alt=""
          className="absolute top-0 left-0 w-64 -z-10 opacity-70"
        />
        <img
          src={shape2}
          alt=""
          className="absolute top-0 right-[20px] w-80 -z-10 opacity-60"
        />
        <img
          src={shape3}
          alt=""
          className="absolute bottom-0 right-[327px] w-96 -z-10 opacity-70 hidden lg:block"
        />

        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <div className="hidden lg:flex justify-center">
              <img
                src={isLoginMode ? loginImg : registerImg}
                alt={isLoginMode ? "Login" : "Register"}
                className="w-full h-full object-cover rounded-2xl"
              />
              {/* {!isLoginMode && (
                <img
                  src={registerDark}
                  alt="Dark mode"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 rounded-2xl"
                />
              )} */}
            </div>

            {/* Right Form */}
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl max-w-md mx-auto">
              {/* Logo */}
              <div className="text-center mb-8">
                <img src={logo} alt="Logo" className="h-12 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {isLoginMode ? "Welcome back" : "Get Started Now"}
                </p>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {isLoginMode
                    ? "Login to your account"
                    : "Create your account"}
                </h2>
              </div>

              {/* Google Button */}
              <button
                onClick={googleAuthHandler}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-6 text-gray-700 dark:text-gray-200 font-medium hover:shadow-md transition"
              >
                <img src={googleIcon} alt="Google" className="w-5 h-5" />
                {isLoginMode ? "Continue with Google" : "Sign up with Google"}
              </button>

              <div className="my-8 flex items-center">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="px-4 text-gray-500 dark:text-gray-400 text-sm">
                  Or
                </span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* Form */}
              <form onSubmit={submitHandler} className="">
                {!isLoginMode && (
                  <>
                    <Input
                      element="input"
                      id="firstName"
                      type="text"
                      label="First Name"
                      placeholder=""
                      validators={[VALIDATOR_REQUIRE()]}
                      errorText="First name is required"
                      onInput={inputHandler}
                      // className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Input
                      element="input"
                      id="lastName"
                      type="text"
                      label="Last Name"
                      placeholder=""
                      validators={[VALIDATOR_REQUIRE()]}
                      errorText="Last name is required"
                      onInput={inputHandler}
                      // className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </>
                )}

                <Input
                  element="input"
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder=""
                  validators={[VALIDATOR_EMAIL()]}
                  errorText="Please enter a valid email"
                  onInput={inputHandler}
                  // className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <Input
                  element="input"
                  id="password"
                  type="password"
                  label="Password"
                  placeholder=""
                  validators={[VALIDATOR_MINLENGTH(6)]}
                  errorText="Password must be at least 6 characters"
                  onInput={inputHandler}
                  // className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {!isLoginMode && (
                  <Input
                    element="input"
                    id="repeatPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder=""
                    validators={[VALIDATOR_MINLENGTH(6)]}
                    errorText="Please confirm your password"
                    onInput={inputHandler}
                    // className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}

                {/* Terms / Remember */}
                <div className="flex items-center justify-between text-sm">
                  {!isLoginMode && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTermsAccepted}
                        onChange={(e) => setIsTermsAccepted(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        I agree to terms & conditions
                      </span>
                    </label>
                  )}
                  {isLoginMode && (
                    <a href="#" className="text-blue-600 hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!formState.isValid || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition shadow-lg"
                >
                  {isLoginMode ? "Login Now" : "Create Account"}
                </button>
              </form>

              {/* Switch Mode */}
              <div className="text-center mt-8 text-gray-600 dark:text-gray-300">
                {isLoginMode
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <span
                  onClick={switchModeHandler}
                  className="underline capitalize text-blue-600 font-semibold cursor-pointer"
                >
                  {isLoginMode ? "Sign up" : "Log in"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
