import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Modal,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Backspace, Phone, X } from "@phosphor-icons/react";
import { useAuthStore } from "../zustand/authStore";
import { callPartyStore } from "../zustand/callPartyStore";
import axios, { AxiosResponse } from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 5,
};

const responseModalStyle = {
  ...style,
  width: { xs: "90%", md: 500 },
  maxHeight: "80vh",
  overflow: "auto",
};

interface DialerProps {
  onDial: (number: string) => void;
  onClose: () => void;
}

interface ApiResponse {
  status: number;
  message: {
    RespId: number;
    Response: string;
    ReqId: number;
    callid: number;
  };
  requestid: string;
}

const Dialer: React.FC<DialerProps> = ({ onDial, onClose }) => {
  const [inputNumber, setInputNumber] = useState("");
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // New states for API call and response modal
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);

  // Get auth state from zustand
  const { isAuthenticated, isLoading, error, login, user, logout, token } =
    useAuthStore();

  const {
    apartyno,
    bpartyno,
    cli,
    reference_id,
    dtmfflag,
    recordingflag,
    setApartyNo,
    setBpartyNo,
  } = callPartyStore();

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setUsername("");
      setPassword("");
    }
  }, [open]);

  const handleNumberClick = (num: string) => {
    if (apartyno && bpartyno) {
      setApartyNo(null);
      setBpartyNo(null);
    }
    setInputNumber((prev) => prev + num);
  };

  const handleBackspace = () => {
    setInputNumber((prev) => prev.slice(0, -1));
  };

  const handleDial = () => {
    if (inputNumber.length > 3) {
      onDial(inputNumber);
      setInputNumber("");
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleResponseModalClose = () => {
    setResponseModalOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  // Function to handle the call initiation
  const handleInitiateCall = async () => {
    try {
      setIsCallLoading(true);
      setApiError(null);

      const payload = {
        cli: cli || "9610012318",
        apartyno: apartyno || "",
        bpartyno: bpartyno || "",
        reference_id: reference_id || "1212",
        dtmfflag: dtmfflag || 1,
        recordingflag: recordingflag || 0,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      const response: AxiosResponse<ApiResponse> = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/clicktocall/initiate-call`,
        payload,
        config
      );

      setApiResponse(response.data);
      setResponseModalOpen(true);
    } catch (err) {
      console.error("Error initiating call:", err);
      setApiError(
        err instanceof Error ? err.message : "Unknown error occurred"
      );
      setResponseModalOpen(true);
    } finally {
      setIsCallLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && open) {
      handleClose();
    }
  }, [isAuthenticated, open]);

  console.log(user);

  const dialButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"],
  ];

  const subText: { [key: string]: string } = {
    "1": "",
    "2": "ABC",
    "3": "DEF",
    "4": "GHI",
    "5": "JKL",
    "6": "MNO",
    "7": "PQRS",
    "8": "TUV",
    "9": "WXYZ",
    "*": "",
    "0": "+",
    "#": "",
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
        bgcolor: "background.paper",
        borderRight: !isMobile ? `1px solid ${theme.palette.divider}` : "none",
      }}
    >
      {isMobile && (
        <IconButton onClick={onClose} sx={{ alignSelf: "flex-end" }}>
          <X />
        </IconButton>
      )}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Dialer
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ color: "white" }}
          onClick={!isAuthenticated ? handleOpen : logout}
        >
          <Typography variant="subtitle2">
            {isAuthenticated ? "Logout" : "Login"}
          </Typography>
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          my: 3,
          position: "relative",
          minHeight: "80px",
        }}
      >
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={2}
        >
          {!inputNumber && (
            <Typography>
              {apartyno && `Aparty Number : ${apartyno}`}
              <br />
              {bpartyno && `Bparty Number : ${bpartyno}`}
            </Typography>
          )}
          {!inputNumber && (apartyno || bpartyno) && (
            <Box display={"flex"} flexDirection={"column"}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={handleInitiateCall}
                disabled={
                  isCallLoading || !apartyno || !bpartyno || !isAuthenticated
                }
              >
                {isCallLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  "Initiate Call"
                )}
              </Button>
              <Button
                color="error"
                size="small"
                onClick={() => {
                  callPartyStore.setState({ apartyno: "", bpartyno: "" });
                }}
              >
                Reset
              </Button>
            </Box>
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: "medium" }}>
          {inputNumber}
        </Typography>
        {inputNumber.length > 0 && (
          <IconButton
            sx={{ position: "absolute", right: 0 }}
            onClick={handleBackspace}
          >
            <Backspace />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {dialButtons.map((row) =>
          row.map((num) => (
            <Grid item xs={4} key={num}>
              <Button
                onClick={() => handleNumberClick(num)}
                sx={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  marginInline: "auto",
                }}
              >
                <Typography variant="h6">{num}</Typography>
                <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                  {subText[num]}
                </Typography>
              </Button>
            </Grid>
          ))
        )}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, pb: 2 }}>
        <IconButton
          color="primary"
          sx={{
            bgcolor: "#4caf50",
            color: "white",
            p: 3,
            "&:hover": { bgcolor: "#388e3c" },
          }}
          onClick={handleDial}
        >
          <Phone size={20} />
        </IconButton>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="login-modal-title"
            variant="h5"
            component="h2"
            mb={2}
            textAlign={"center"}
          >
            Login To Make Calls
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, color: "white" }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Login"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={responseModalOpen}
        onClose={handleResponseModalClose}
        aria-labelledby="response-modal-title"
      >
        <Box sx={responseModalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography id="response-modal-title" variant="h6" component="h2">
              API Response
            </Typography>
            <IconButton onClick={handleResponseModalClose}>
              <X />
            </IconButton>
          </Box>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          {apiResponse && (
            <Box
              sx={{
                bgcolor: "#f5f5f5",
                p: 2,
                borderRadius: 1,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                overflowX: "auto",
              }}
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Dialer;
