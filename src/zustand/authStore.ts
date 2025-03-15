import { create } from "zustand";
import axios from "axios";
import { persist } from "zustand/middleware";

interface User {
  username: string;
  // Add any other user properties returned from your API
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
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
      error: null,
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
          };

          const formData = new URLSearchParams();
          formData.append("username", username);
          formData.append("password", password);

          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/clicktocall/AuthToken`,
            formData,
            { headers }
          );

          set({
            token: response.data.idToken,
            user: { username, ...response?.data?.user },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
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
