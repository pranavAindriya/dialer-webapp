import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Divider,
  InputBase,
  Paper,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { MagnifyingGlass, Phone, Upload } from "@phosphor-icons/react";
import { callPartyStore } from "../zustand/callPartyStore";
import { useAuthStore } from "../zustand/authStore";
import axios from "axios";
import AddContactModal from "../Modals/AddCondactModal/AddCondactModal";

interface Contact {
  name: string;
  phone: string;
}

interface ContactsProps {
  onDialClick: () => void;
  dialerStatus: boolean;
}

const Contacts: React.FC<ContactsProps> = ({ onDialClick, dialerStatus }) => {
  const { setBpartyNo, apartyno, bpartyno } = callPartyStore();
  const { user, token } = useAuthStore();
  const [addContactOpen, setaddContactOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactList, setContactList] = useState<Contact[]>([]);
  const [openSuccessToast, setOpenSuccessToast] = useState(false);
  const [openErrorToast, setOpenErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContactList = React.useCallback(async () => {
    try {
      const res = await axios.post(
        "https://phpstack-1431591-5347985.cloudwaysapps.com/api/contact-list",
        { user_id: user?.user_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setContactList(res.data.contact_data);
      }
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }, [user?.user_id, token]);

  useEffect(() => {
    if (!addContactOpen && !dialerStatus) {
      fetchContactList();
    }
  }, [addContactOpen, dialerStatus, fetchContactList]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseSuccessToast = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccessToast(false);
  };

  const handleCloseErrorToast = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenErrorToast(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("user_id", user?.user_id?.toString() || "");
    formData.append("contacts", file);

    try {
      const response = await axios.post(
        "https://phpstack-1431591-5347985.cloudwaysapps.com/api/bulk-import/contact-list",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        fetchContactList();
        setToastMessage("Contacts imported successfully");
        setOpenSuccessToast(true);
      } else {
        setToastMessage(response.data.message || "Failed to import contacts");
        setOpenErrorToast(true);
      }
    } catch (error) {
      console.error("Error importing contacts:", error);
      setToastMessage("Error importing contacts. Please try again.");
      setOpenErrorToast(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredContacts = contactList.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const groupByFirstLetter = () => {
    const groups: { [key: string]: Contact[] } = {};
    filteredContacts.forEach((contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(contact);
    });
    return groups;
  };

  const contactGroups = groupByFirstLetter();

  const getContactRole = (contactNumber: string) => {
    if (contactNumber === apartyno) return "A-party";
    if (contactNumber === bpartyno) return "B-party";
    return null;
  };

  const handleCloseAddContact = () => setaddContactOpen(false);

  const handleCall = (contact: Contact) => {
    console.log(contact);
    onDialClick();
    setBpartyNo(contact.phone);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Snackbar
        open={openSuccessToast}
        autoHideDuration={6000}
        onClose={handleCloseSuccessToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSuccessToast}
          severity="success"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openErrorToast}
        autoHideDuration={6000}
        onClose={handleCloseErrorToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseErrorToast}
          severity="error"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Paper
          elevation={0}
          sx={{
            p: "4px 8px",
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "20px",
            flex: "1",
          }}
        >
          <MagnifyingGlass
            size={20}
            style={{ marginInline: 1, color: "action.active" }}
          />
          <InputBase
            sx={{ ml: 1, flex: 1, mt: 0.3 }}
            placeholder="Search name, number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Paper>
        <Button
          variant="contained"
          sx={{ color: "white" }}
          onClick={() => setaddContactOpen(true)}
        >
          Add{" "}
        </Button>
        <Button
          variant="contained"
          sx={{ color: "white" }}
          onClick={handleImportClick}
          startIcon={<Upload />}
        >
          Import{" "}
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {Object.keys(contactGroups).length === 0 ? (
          <Typography
            sx={{ textAlign: "center", mt: 4 }}
            color="text.secondary"
          >
            No contacts found
          </Typography>
        ) : (
          Object.entries(contactGroups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, group]) => (
              <Box key={letter}>
                <Typography
                  variant="subtitle2"
                  sx={{ p: 1, bgcolor: "background.default" }}
                >
                  {letter}
                </Typography>
                <List dense>
                  {group.map((contact, index) => {
                    const contactRole = getContactRole(contact.phone);
                    return (
                      <React.Fragment key={index}>
                        <ListItem
                          sx={{
                            bgcolor: contactRole
                              ? "action.hover"
                              : "transparent",
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor:
                                  contactRole === "B-party"
                                    ? "info.main"
                                    : undefined,
                              }}
                            >
                              {contact.name[0].toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography>{contact.name}</Typography>
                              </Box>
                            }
                            secondary={contact.phone}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleCall(contact)}
                              color="primary"
                            >
                              <Phone />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < group.length - 1 && (
                          <Divider variant="inset" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            ))
        )}
      </Box>

      <AddContactModal
        open={addContactOpen}
        handleClose={handleCloseAddContact}
      />
    </Box>
  );
};

export default Contacts;
