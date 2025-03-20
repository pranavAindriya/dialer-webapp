import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import Page from "./Page";
import AuthModal from "./Modals/AuthModal/AuthModal";
import { useEffect } from "react";
import { useLoginStore } from "./zustand/loginModalStore";
import { useAuthStore } from "./zustand/authStore";
import { callPartyStore } from "./zustand/callPartyStore";

const App = () => {
  const { setLoginPopupOpen } = useLoginStore();
  const { isAuthenticated, user } =
    useAuthStore();
  const { setApartyNo } = callPartyStore();
  useEffect(() => {
    if (isAuthenticated) {
      setApartyNo(user?.phone)
      setLoginPopupOpen(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      setLoginPopupOpen(false)
    } else {
      setLoginPopupOpen(true)
    }
  }, [isAuthenticated])
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#4caf50" },
      background: { default: "#ffffff", paper: "#f5f5f5" },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none" },
        },
      },
    },
  });


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth={"md"}
        disableGutters
        sx={{ height: "100dvh", backgroundColor: "#f5f5f5" }}
      >
        <Page />
        <AuthModal />
      </Container>
    </ThemeProvider>
  );
};

export default App;
