import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import Page from "./Page";

const App = () => {
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
      </Container>
    </ThemeProvider>
  );
};

export default App;
