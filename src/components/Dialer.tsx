import React, {
  useEffect,
  useState,
  KeyboardEvent,
  ClipboardEvent,
  ChangeEvent,
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
  TextField,
  InputAdornment,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [desktopAlertOpen, setDesktopAlertOpen] = useState(false);

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

  const handleNumberClick = (num: string) => {
    const prevValue = bpartyno?.toString() || "";
    if (prevValue.length < 10) {
      setBpartyNo(prevValue + num);
    }
  };

  const handleKeyboardInput = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    if (/^[0-9]$/.test(key)) {
      handleNumberClick(key);
    } else if (key === "Backspace" || key === "Delete") {
      handleBackspace();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const numericText = pastedText.replace(/\D/g, "");
    const combined = (bpartyno || "") + numericText;
    setBpartyNo(combined.slice(0, 10));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const input = e.target.value.replace(/\D/g, "");
    setBpartyNo(input.slice(0, 10));
  };

  const handleBackspace = () => {
    const current = bpartyno?.toString() || "";
    setBpartyNo(current.slice(0, -1));
  };

  const handleDial = () => {
    if (!isAuthenticated) {
      handleOpen();
      return;
    }

    const number = bpartyno?.toString() || "";

    if (number.length < 10) return;

    if (number === "1600180068") {
      if (/Android|iPhone|webOS|BlackBerry/i.test(navigator.userAgent)) {
        window.location.href = `tel:${number}`;
      } else {
        setDesktopAlertOpen(true);
      }
      return;
    }

    if (apartyno && number) {
      handleInitiateCall();
    } else {
      onDial(number);
      setBpartyNo("");
    }
  };

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
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status !== 504) {
        setApiError(err.message || "Unknown error occurred");
      }
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleResponseModalClose = () => setResponseModalOpen(false);

  useEffect(() => {
    if (desktopAlertOpen) {
      const timer = setTimeout(() => {
        setDesktopAlertOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [desktopAlertOpen]);

  useEffect(() => {
    if (isAuthenticated && open) handleClose();
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
    >
      <Box display={"flex"} alignItems={"center"}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, fontSize: 25, flexGrow: 1 }}
        >
          Dialer
        </Typography>
        <IconButton onClick={onClose}>
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
          flexDirection: "column",
        }}
      >
        <TextField
          value={bpartyno || ""}
          onChange={handleChange}
          onPaste={handlePaste}
          slotProps={{
            htmlInput: {
              style: {
                fontSize: "2rem",
                textAlign: "center",
                width: "100%",
                caretColor: theme.palette.text.primary,
              },
              maxLength: 10,
              inputMode: "numeric",
              pattern: "[0-9]*",
            },
          }}
          variant="standard"
          sx={{ width: "100%", maxWidth: 300 }}
          InputProps={{
            disableUnderline: true,
            endAdornment: bpartyno && (
              <InputAdornment position="end">
                <IconButton onClick={handleBackspace}>
                  <Backspace />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1, mt: 3 }}>
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

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Tooltip title={apartyno && bpartyno ? "Initiate Call" : "Dial Number"}>
          <IconButton
            color="primary"
            sx={{
              bgcolor: isCallLoading ? "#388e3c" : "#4caf50",
              color: "white",
              p: 3,
              "&:hover": { bgcolor: "#388e3c" },
              "&.Mui-disabled": {
                bgcolor: "primary.light",
                color: "whitesmoke",
              },
            }}
            onClick={handleDial}
            disabled={isCallLoading || !bpartyno}
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
        <Box sx={responseModalStyle}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Status</Typography>
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
              }}
            >
              <pre style={{ margin: 0 }}>You will receive a call</pre>
            </Box>
          )}

          {!apiError && !apiResponse && <Typography>Dialing...</Typography>}
        </Box>
      </Modal>
    </Box>
  );
};

export default Dialer;
