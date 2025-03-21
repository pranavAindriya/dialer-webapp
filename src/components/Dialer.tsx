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
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Backspace, Phone, X } from "@phosphor-icons/react";
import { useAuthStore } from "../zustand/authStore";
import { callPartyStore } from "../zustand/callPartyStore";
import axios from "axios";

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
  // const [inputNumber, setInputNumber] = useState("");
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // New states for API call and response modal
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);

  // Get auth state from zustand
  const { isAuthenticated, logout, token } =
    useAuthStore();

  const {
    apartyno,
    bpartyno,
    cli,
    reference_id,
    dtmfflag,
    recordingflag,
    setBpartyNo,
  } = callPartyStore();

  const handleNumberClick = (num: string) => {
    // if (apartyno && bpartyno) {
    //   setApartyNo(null);
    //   setBpartyNo(null);
    // }
    const prevValue = callPartyStore.getState().bpartyno || "";
    setBpartyNo(prevValue.toString() + num);
  };

  const handleBackspace = () => {
    const prevValue = callPartyStore.getState().bpartyno || ""; // Get current value
    setBpartyNo(prevValue.toString().slice(0, -1))
  };

  const handleDial = () => {
    if (!isAuthenticated) {
      handleOpen();
      return;
    }

    if (apartyno && bpartyno) {
      handleInitiateCall();
    } else if (bpartyno && bpartyno.toString().length > 0) { // Ensure bpartyno is not undefined
      onDial(bpartyno.toString());
      setBpartyNo(""); // Reset after dialing
    }
  };

  // const handleReset = () => {
  //   callPartyStore.setState({ apartyno: "", bpartyno: "" });
  // };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleResponseModalClose = () => {
    setResponseModalOpen(false);
  };

  // Function to handle the call initiation
  const handleInitiateCall = async () => {
    setResponseModalOpen(true);
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
          "Content-Type": "application/x-www-form-urlencoded",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      const response = await axios.post("api/initiate-call", payload, config);

      setApiResponse(response.data);

    } catch (err) {
      console.error("Error initiating call:", err);
      setApiError(
        err instanceof Error ? err.message : "Unknown error occurred"
      );
    } finally {
      setIsCallLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && open) {
      handleClose();
    }
  }, [isAuthenticated, open]);

  useEffect(() => {
    console.log(bpartyno);

  }, [])

  // console.log(bpartyno);


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

  console.log("apartyno", apartyno);
  console.log("bpartyno", bpartyno);


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
      <IconButton onClick={onClose} sx={{ alignSelf: "flex-end" }}>
        <X />
      </IconButton>
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
          flexDirection: "column",
        }}
      >
        {/* Current number input display */}
        <Typography variant="h4" sx={{ fontWeight: "medium" }}>
          {bpartyno}
        </Typography>
        {bpartyno && bpartyno.toString().length > 0 && (
          <IconButton
            sx={{ position: "absolute", right: 0 }}
            onClick={handleBackspace}
          >
            <Backspace />
          </IconButton>
        )}

        {/* Show party numbers if bpartyno is empty */}
        {/* {!bpartyno && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              mt: 1,
            }}
          >
            {apartyno && (
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                Aparty Number: {apartyno}
              </Typography>
            )}
            {bpartyno && (
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                Bparty Number: {bpartyno}
              </Typography>
            )}
            {(apartyno || bpartyno) && (
              <Tooltip title="Clear numbers">
                <IconButton
                  color="error"
                  size="small"
                  onClick={handleReset}
                  sx={{ mt: 1 }}
                >
                  <Trash size={20} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )} */}
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
        <Tooltip title={apartyno && bpartyno ? "Initiate Call" : "Dial Number"}>
          <IconButton
            color="primary"
            sx={{
              bgcolor: isCallLoading ? "#388e3c" : "#4caf50",
              color: "white",
              p: 3,
              "&:hover": { bgcolor: "#388e3c" },
            }}
            onClick={handleDial}
            disableRipple={
              isCallLoading || (!bpartyno && (!apartyno || !bpartyno))
            }
          >
            {isCallLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Phone size={20} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* <Modal
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
      </Modal> */}

      <Modal
        open={responseModalOpen}
        onClose={handleResponseModalClose}
        aria-labelledby="response-modal-title"
      >
        {!apiError && !apiResponse ? <Box sx={responseModalStyle}>Dialing...</Box> : <Box sx={responseModalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography id="response-modal-title" variant="h6" component="h2">
              Status
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
                You will recive a call
              </pre>
            </Box>
          )}
        </Box>}
      </Modal>
    </Box>
  );
};

export default Dialer;
