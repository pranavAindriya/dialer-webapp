import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Input,
} from "@mui/material";
import { Backspace, Phone, X } from "@phosphor-icons/react";

interface DialerProps {
  onDial: (number: string) => void;
  onClose: () => void;
}

const Dialer: React.FC<DialerProps> = ({ onDial, onClose }) => {
  const [inputNumber, setInputNumber] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNumberClick = (num: string) => {
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
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Dialer
      </Typography>

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
    </Box>
  );
};

export default Dialer;
