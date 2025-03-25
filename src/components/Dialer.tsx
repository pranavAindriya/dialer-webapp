import React, {
  useEffect,
  useState,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
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
  Collapse,
} from "@mui/material";
import { Backspace, CaretDown, Phone, X } from "@phosphor-icons/react";
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
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // New states for API call and response modal
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [desktopAlertOpen, setDesktopAlertOpen] = useState(false);

  // Get auth state from zustand
  const { isAuthenticated, token } = useAuthStore();

  const {
    apartyno,
    bpartyno,
    cli,
    reference_id,
    dtmfflag,
    recordingflag,
    setBpartyNo,
  } = callPartyStore();

  // Handle number click for dialer buttons
  const handleNumberClick = (num: string) => {
    const prevValue = callPartyStore.getState().bpartyno || "";
    if (prevValue.toString().length < 10) {
      setBpartyNo(prevValue.toString() + num);
    }
  };

  // Handle keyboard input
  const handleKeyboardInput = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;

    // Allow only numeric keys, backspace, and delete
    if (/^[0-9]$/.test(key)) {
      const prevValue = callPartyStore.getState().bpartyno || "";
      if (prevValue.toString().length < 10) {
        setBpartyNo(prevValue.toString() + key);
      }
    } else if (key === "Backspace" || key === "Delete") {
      handleBackspace();
    }
  };

  // Handle paste event with validation
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const numericPaste = pastedText.replace(/\D/g, ""); // Remove non-numeric characters

    const prevValue = callPartyStore.getState().bpartyno || "";
    const combinedValue = prevValue + numericPaste;
    const finalValue = combinedValue.slice(0, 10); // Limit to 10 digits

    setBpartyNo(finalValue);
  };

  const handleBackspace = () => {
    const prevValue = callPartyStore.getState().bpartyno || ""; // Get current value
    setBpartyNo(prevValue.toString().slice(0, -1));
  };

  const handleDial = () => {
    if (!isAuthenticated) {
      handleOpen();
      return;
    }

    if (bpartyno && bpartyno.toString().length < 10) {
      return;
    }

    if (bpartyno && bpartyno.toString() === "1600180068") {
      if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/BlackBerry/i)
      ) {
        window.location.href = `tel:${bpartyno}`;
      } else {
        setDesktopAlertOpen(true);
      }
      return;
    }

    if (apartyno && bpartyno) {
      handleInitiateCall();
    } else if (bpartyno && bpartyno.toString().length > 0) {
      // Ensure bpartyno is not undefined
      onDial(bpartyno.toString());
      setBpartyNo(""); // Reset after dialing
    }
  };

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
        cli: cli || "1600413802",
        apartyno: apartyno || "",
        bpartyno: bpartyno || "",
        reference_id: reference_id || "1212",
        dtmfflag: dtmfflag || 0,
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
    if (desktopAlertOpen) {
      setTimeout(() => {
        setDesktopAlertOpen(false);
      }, 3000);
    }
  }, [desktopAlertOpen]);

  useEffect(() => {
    if (isAuthenticated && open) {
      handleClose();
    }
  }, [isAuthenticated, open]);

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
        pb: 4,
        bgcolor: "background.paper",
        border: !isMobile ? `1px solid ${theme.palette.divider}` : "none",
        outline: "none",
        position: "relative",
      }}
      tabIndex={0}
      onKeyDown={handleKeyboardInput}
      onPaste={handlePaste}
    >
      <Box display={"flex"} alignItems={"center"}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, fontSize: 25, flexGrow: 1 }}
        >
          Dialer
        </Typography>

        <IconButton onClick={onClose} sx={{ alignSelf: "flex-end" }}>
          <CaretDown />
        </IconButton>
      </Box>

      <Collapse in={desktopAlertOpen} sx={{ marginInline: "auto" }}>
        <Alert
          severity="info"
          onClose={() => setDesktopAlertOpen(false)}
          sx={{ py: 2, borderRadius: "10px" }}
        >
          This device does not support direct phone dialing.
        </Alert>
      </Collapse>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          my: 3,
          position: "relative",
          minHeight: "80px",
          flexDirection: "column",
          mt: desktopAlertOpen ? 0 : 3,
          transition: "all .5s",
        }}
      >
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

      <Modal
        open={responseModalOpen}
        onClose={handleResponseModalClose}
        aria-labelledby="response-modal-title"
      >
        {!apiError && !apiResponse ? (
          <Box sx={responseModalStyle}>Dialing...</Box>
        ) : (
          <Box sx={responseModalStyle}>
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
                <pre style={{ margin: 0 }}>You will receive a call</pre>
              </Box>
            )}
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default Dialer;
