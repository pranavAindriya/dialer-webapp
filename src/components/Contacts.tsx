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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import {
  MagnifyingGlass,
  Phone,
  Upload,
  PencilSimple,
  Trash,
  DotsThreeVertical,
  Download,
} from "@phosphor-icons/react";
import { callPartyStore } from "../zustand/callPartyStore";
import { useAuthStore } from "../zustand/authStore";
import axios from "axios";
import AddContactModal from "../Modals/AddCondactModal/AddCondactModal";

interface Contact {
  name: string;
  phone: string;
  id?: number; // Added contact_id for identifying contacts during edit/delete
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

  const theme = useTheme();

  // New state for edit functionality
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // New state for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // State for context menu
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    contact: Contact;
  } | null>(null);

  const fetchContactList = React.useCallback(async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/contact-list`,
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
        `${import.meta.env.VITE_BASE_URL}/api/bulk-import/contact-list`,
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

  // Handle opening the context menu
  const handleContextMenu = (event: React.MouseEvent, contact: Contact) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      contact,
    });
  };

  // Handle closing the context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Function to open edit dialog
  const handleEditClick = (contact: Contact) => {
    setEditContact(contact);
    setEditName(contact.name);
    setEditPhone(contact.phone);
    setEditDialogOpen(true);
    handleCloseContextMenu();
  };

  // Function to handle edit dialog close
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditContact(null);
  };

  // Function to save edited contact
  const handleSaveEdit = async () => {
    if (!editContact || !user?.user_id) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/update-contact`,
        {
          user_id: user.user_id,
          contact_id: editContact.id,
          name: editName,
          phone: editPhone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        fetchContactList();
        setToastMessage("Contact updated successfully");
        setOpenSuccessToast(true);
      } else {
        setToastMessage(response.data.message || "Failed to update contact");
        setOpenErrorToast(true);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      setToastMessage("Error updating contact. Please try again.");
      setOpenErrorToast(true);
    }

    handleEditDialogClose();
  };

  // Function to open delete confirmation dialog
  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
    handleCloseContextMenu();
  };

  // Function to handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  // Function to confirm contact deletion
  const handleConfirmDelete = async () => {
    if (!contactToDelete || !user?.user_id) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/delete-contact`,
        {
          user_id: user.user_id,
          contact_id: contactToDelete.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        fetchContactList();
        setToastMessage("Contact deleted successfully");
        setOpenSuccessToast(true);
      } else {
        setToastMessage(response.data.message || "Failed to delete contact");
        setOpenErrorToast(true);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      setToastMessage("Error deleting contact. Please try again.");
      setOpenErrorToast(true);
    }

    handleDeleteDialogClose();
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

  const downloadCSVSample = () => {
    const link = document.createElement("a");
    link.href =
      "https://drive.google.com/uc?export=download&id=1OGIIW3UmuRnmPold2myJz8Q_wgUfzUcy";
    link.setAttribute("download", "contacts_sample.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // const downloadExcelSample = () => {
  //   const link = document.createElement("a");
  //   link.href =
  //     "https://drive.google.com/uc?export=download&id=1TNF_wxdX0vauXhy74__OZF6MUZdb072T";
  //   link.setAttribute("download", "contacts_sample.xlsx");
  //   document.body.appendChild(link);
  //   link.click();
  //   link.remove();
  // };

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

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: "4px 8px",
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "20px",
            flexGrow: "1",
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            sx={{ color: "white", borderRadius: "20px" }}
            onClick={() => setaddContactOpen(true)}
          >
            Add{" "}
          </Button>
          <Button
            variant="contained"
            sx={{ color: "white", borderRadius: "20px" }}
            onClick={handleImportClick}
            startIcon={<Upload />}
          >
            Import{" "}
          </Button>
          <Button
            variant="outlined"
            onClick={downloadCSVSample}
            startIcon={<Download />}
            sx={{ minWidth: "auto", borderRadius: "20px" }}
            title="Download CSV Sample"
          >
            Download Sample CSV
          </Button>
          {/* <Button
            variant="outlined"
            onClick={downloadExcelSample}
            startIcon={<Download />}
            sx={{ minWidth: "auto", borderRadius: "20px" }}
            title="Download Excel Sample"
          >
            Excel
          </Button> */}
        </Box>

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
                          onContextMenu={(e) => handleContextMenu(e, contact)}
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
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setContextMenu({
                                  mouseX: e.clientX - 2,
                                  mouseY: e.clientY - 4,
                                  contact,
                                });
                              }}
                            >
                              <DotsThreeVertical />
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

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => contextMenu && handleEditClick(contextMenu.contact)}
        >
          <PencilSimple
            size={18}
            style={{ marginRight: "8px" }}
            color={theme.palette.info.main}
          />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => contextMenu && handleDeleteClick(contextMenu.contact)}
        >
          <Trash
            size={18}
            style={{ marginRight: "8px" }}
            color={theme.palette.error.main}
          />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Contact Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              px: 1,
              py: 2,
              borderRadius: 5,
            },
          },
        }}
      >
        <DialogTitle>Edit Contact</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Phone Number"
              fullWidth
              variant="outlined"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            sx={{ color: "white" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              px: 1,
              py: 2,
              borderRadius: 5,
            },
          },
        }}
      >
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {contactToDelete?.name}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AddContactModal
        open={addContactOpen}
        handleClose={handleCloseAddContact}
      />
    </Box>
  );
};

export default Contacts;
