"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import type {
  SignupDto,
  SigninDto,
  CreateUserSecretDto,
  ValidateUserSecretDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  AuthDto,
} from "./Api";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import http from "./Http";
import { useAuth } from "@/contexts/AuthContext";

type ApiError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};

const extractErrorMessage = (error: unknown) => {
  const fallback = "Something went wrong. Please try again.";
  if (!error) return fallback;
  const apiError = error as ApiError;
  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    (error as Error).message ||
    fallback
  );
};

export const useRegisterMutation = () => {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation<AuthDto, unknown, SignupDto>({
    mutationFn: async (data: SignupDto) => {
      const res = await http.auth.authControllerSignup(data);
      return res.data;
    },
    onSuccess: (data) => {
      // Automatically log the user in after successful registration
      login(data.access_token, data.user);

      notifications.show({
        title: "Account created",
        message: `Welcome, ${data.user.first_name}! Your account has been created and you're now logged in.`,
        color: "green",
      });

      // Redirect based on role (assuming new users are customers by default)
      const roles = data.user?.roles ?? [];
      const isAdmin = roles.some(role =>
        role.toLowerCase().includes("admin") ||
        role.toLowerCase() === "admin" ||
        role.toLowerCase() === "super admin"
      );
      router.push(isAdmin ? "/admin/dashboard" : "/customer/dashboard");
    },
    onError: (error) => {
      notifications.show({
        title: "Registration failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useLoginMutation = () => {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation<AuthDto, unknown, SigninDto>({
    mutationFn: async (data: SigninDto) => {
      const res = await http.auth.authControllerLogin(data);
      return res.data;
    },
    onSuccess: (data) => {
      // Use auth context to handle login
      login(data.access_token, data.user);

      // Redirect based on role
      const roles = data.user?.roles ?? [];
      const isAdmin = roles.some(role =>
        role.toLowerCase().includes("admin") ||
        role.toLowerCase() === "admin" ||
        role.toLowerCase() === "super admin"
      );
      router.push(isAdmin ? "/admin/dashboard" : "/customer/dashboard");
    },
    onError: (error) => {
      notifications.show({
        title: "Login failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: CreateUserSecretDto) => {
      const res = await http.userSecret.userSecretControllerCreate(data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "OTP sent",
        message: "Check your email for the verification code.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Request failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: async (data: ValidateUserSecretDto) => {
      const res = await http.userSecret.userSecretControllerValidate(data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Code verified",
        message: "OTP verified successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Verification failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordDto) => {
      const res = await http.auth.authControllerResetPassword(data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message:
          "Password reset successfully! Please log in with your new password.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Reset failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useUpdatePasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: UpdatePasswordDto) => {
      const res = await http.auth.authControllerUpdatePassword(data);
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Password updated successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Password update failed",
        message: extractErrorMessage(error),
        color: "red",
      });
    },
  });
};

export const useLogout = () => {
  const { logout: authLogout } = useAuth();

  return useCallback(() => {
    // Clear password reset session data
    sessionStorage.removeItem("resetEmail");
    sessionStorage.removeItem("resetOtp");

    // Use auth context logout (which handles notifications and redirect)
    authLogout();
  }, [authLogout]);
};
