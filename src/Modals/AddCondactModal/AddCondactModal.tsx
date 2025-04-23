import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useAuthStore } from "../../zustand/authStore";

type ContactAddModalTypes = {
  open: boolean;
  handleClose: () => void;
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  py: 2,
  px: 4,
  borderRadius: 5,
};
const AddContactModal = ({ open, handleClose }: ContactAddModalTypes) => {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const { token, user } = useAuthStore();
  const [error, setError] = useState<string>("");
  // console.log(token);

  const handleAddContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/create-contact`,
        { user_id: user?.user_id, name, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setName("");
        setPhone("");
        handleClose();
      } else {
        setError("something went wrong");
      }
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
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
          Add Contact Details
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleAddContact} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            type="name"
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="Phone"
            label="Phone"
            type="number"
            id="Phone"
            autoComplete="current-Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, color: "white" }}
          >
            Add Contact
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddContactModal;
