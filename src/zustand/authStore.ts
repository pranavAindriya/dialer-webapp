import { create } from "zustand";
import axios from "axios";
import { persist } from "zustand/middleware";

interface User {
  user_id: number;
  email: string;
  f_name: string;
  l_name: string;
  phone: string;
  // Add any other user properties returned from your API
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      phone: null,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
          };

          const formData = new URLSearchParams();
          formData.append("email", email);
          formData.append("password", password);

          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/login`,
            formData,
            { headers }
          );

          console.log("response", response);

          if (response.data?.success) {
            set({
              token: response.data.token,
              user: {
                user_id: response.data?.user_id,
                email,
                f_name: response.data?.f_name,
                l_name: response.data?.l_name,
                phone: response?.data?.phone,
              },
              isAuthenticated: true,
              isLoading: false,
              error: response?.data?.errorMsg,
            });
          } else {
            set({
              isLoading: false,
              error: response?.data?.errorMsg,
            });
          }
        } catch (error) {
          let errorMessage = "An unknown error occurred";
          if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },
      logout: () => {
        // Remove Authorization header
        delete axios.defaults.headers.common["Authorization"];

        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: "auth-storage", // Name for the persisted storage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // Only persist these fields
    }
  )
);
