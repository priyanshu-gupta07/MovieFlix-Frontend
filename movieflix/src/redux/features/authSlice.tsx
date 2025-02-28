import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import {jwtDecode} from "jwt-decode";

const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

const logout = () => {
  localStorage.removeItem("user");
  return {
    user: null,
    userId: null,
    hasLoginError: null,
    hasSignupError: null,
  };
};

export const retriveToken = createAsyncThunk("auth/retrive-token", () => {
  const userData = localStorage.getItem("user");
  if (!userData) {
    return logout();
  }

  const user: UserType = JSON.parse(userData);
  if (!user) {
    return logout();
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (user.expirationTime < currentTimestamp + 300) {
    return logout();
  }

  return {
    user: user,
  };
});

export const fetchLogin = createAsyncThunk(
  "auth/Login",
  async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${baseApiUrl}/user/login/`, {
        email,
        password,
      });

      const token = response.data.token;
      const decodedToken: {
        name: string;
        user_type: string;
        sub: string;
        aud: string;
        exp: number;
        iat: number;
        iss: number;
        nbf: number;
      } = jwtDecode(token);

      const user: UserType = {
        token,
        name: decodedToken.name,
        role: decodedToken.user_type,
        id: decodedToken.sub,
        expirationTime: decodedToken.exp,
      };

      localStorage.setItem("user", JSON.stringify(user));
      return {
        user,
        userId: null,
        hasLoginError: null,
        hasSignupError: null,
      };
    } catch (err) {
      const error: AxiosError<CustomAxiosErrorType | any> = err as any;
      let errMsg = "Something went wrong. Please try again.";
      const errResponse = error.response?.data;
      if (errResponse) {
        errMsg = errResponse.message;
      }

      return { hasLoginError: errMsg, hasSignupError: null };
    }
  }
);

export const fetchSignup = createAsyncThunk(
  "auth/sign-up",
  async (userPayload: UserSignupDataType) => {
    try {
      const response = await axios.post(
        `${baseApiUrl}/user/signup/`,
        userPayload
      );

      return {
        userId: response.data.id || 1,
        hasLoginError: null,
        hasSignupError: null,
      };
    } catch (err) {
      const error: AxiosError<CustomAxiosErrorType | any> = err as any;
      // Handle errors from the API without throwing an error
      const errorResponse = error.response?.data;
      let errorMsg = "Something went wrong. Please try again.";

      if (errorResponse.errors) {
        const objArr = Object.keys(errorResponse.errors);
        errorMsg = errorResponse.errors[objArr[0]];
      } else if (errorResponse.error.message) {
        errorMsg = errorResponse.error.message;
      }

      return {
        userId: null,
        hasLoginError: null,
        hasSignupError: errorMsg,
      };
    }
  }
);

// Handle the fetchSignup action in your slice or reducer

const initialState: AuthStateType = {
  user: null,
  userId: null,
  hasLoginError: null,
  hasSignupError: null,
};

const authSlice = createSlice({
  name: "auth-slice",
  initialState,
  reducers: {
    logoutAction() {
      localStorage.removeItem("user");
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSignup.fulfilled, (state, { payload }) => {
      if (payload.userId) {
        return {
          ...state,
          userId: payload.userId,
          hasLoginError: null,
          hasSignupError: null,
        };
      }
      return {
        ...initialState,
        hasLoginError: payload.hasLoginError,
        hasSignupError: payload.hasSignupError,
      };
    });

    builder.addCase(fetchLogin.fulfilled, (state, { payload }) => {
      if (payload?.user) {
        const updatedState: AuthStateType = {
          ...state,
          user: payload.user,
          userId: payload.userId,
          hasLoginError: null,
          hasSignupError: null,
        };

        return updatedState;
      }

      return {
        ...initialState,
        hasLoginError: payload.hasLoginError,
        hasSignupError: null,
      };
    });

    builder.addCase(retriveToken.fulfilled, (state, { payload }) => {
      if (payload?.user) {
        return {
          ...state,
          user: payload.user,
          userId: null,
          hasLoginError: null,
          hasSignupError: null,
        };
      }

      return initialState;
    });
  },
});

export const { logoutAction } = authSlice.actions;
export const selectAuthToken = (state: { auth: AuthStateType }) =>
  state.auth.user?.token;

export default authSlice.reducer;
