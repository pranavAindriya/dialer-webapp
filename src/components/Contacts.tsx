import React, { useState } from "react";
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
  Fab,
  Chip,
} from "@mui/material";
import { MagnifyingGlass, Phone } from "@phosphor-icons/react";
import { callPartyStore } from "../zustand/callPartyStore";
import { useAuthStore } from "../zustand/authStore";

interface Contact {
  id: number;
  name: string;
  number: string;
}

interface ContactsProps {
  contacts: Contact[];
  onDialClick: () => void;
  dialerStatus: boolean;
}

const Contacts: React.FC<ContactsProps> = ({
  contacts,
  onDialClick,
  dialerStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { setApartyNo, setBpartyNo, apartyno, bpartyno } = callPartyStore();

  const { isAuthenticated } = useAuthStore();

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number.includes(searchQuery)
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

  // Function to check if contact is selected as A-party or B-party
  const getContactRole = (contactNumber: string) => {
    if (contactNumber === apartyno) return "A-party";
    if (contactNumber === bpartyno) return "B-party";
    return null;
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Paper
        elevation={0}
        sx={{
          p: "4px 8px",
          display: "flex",
          alignItems: "center",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "20px",
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
                    const contactRole = getContactRole(contact.number);
                    return (
                      <React.Fragment key={contact.id}>
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
                                  contactRole === "A-party"
                                    ? "primary.main"
                                    : contactRole === "B-party"
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
                                {contactRole && (
                                  <Chip
                                    label={contactRole}
                                    size="small"
                                    color={
                                      contactRole === "A-party"
                                        ? "primary"
                                        : "info"
                                    }
                                    sx={{
                                      height: 18,
                                      color: "white",
                                      fontSize: 10,
                                      paddingTop: "2px",
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={contact.number}
                          />
                          <ListItemSecondaryAction>
                            {!isAuthenticated && (
                              <Typography
                                color="primary"
                                fontSize={10}
                                display={"inline"}
                                sx={{
                                  cursor: "pointer",
                                  mr: 1,
                                }}
                              >
                                Login To add as Party
                              </Typography>
                            )}
                            {!apartyno && isAuthenticated && !contactRole && (
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => setApartyNo(contact.number)}
                              >
                                Set as Aparty
                              </Button>
                            )}
                            {!bpartyno && isAuthenticated && !contactRole && (
                              <Button
                                color="info"
                                variant="text"
                                size="small"
                                onClick={() => setBpartyNo(contact.number)}
                              >
                                Set as Bparty
                              </Button>
                            )}
                            {contactRole && isAuthenticated && (
                              <Button
                                color="error"
                                variant="text"
                                size="small"
                                onClick={() => {
                                  if (contactRole === "A-party") {
                                    setApartyNo("");
                                  } else {
                                    setBpartyNo("");
                                  }
                                }}
                              >
                                Remove
                              </Button>
                            )}
                            <IconButton edge="end">
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
      <Fab
        color="primary"
        onClick={onDialClick}
        sx={{
          position: "absolute",
          bottom: 73,
          right: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: dialerStatus ? "none" : "block",
        }}
      >
        <Phone color="white" style={{ marginTop: "6px" }} size={18} />
      </Fab>
    </Box>
  );
};

export default Contacts;
