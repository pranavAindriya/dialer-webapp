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
} from "@mui/material";
import { MagnifyingGlass, Phone } from "@phosphor-icons/react";

interface Contact {
  id: number;
  name: string;
  number: string;
}

interface ContactsProps {
  contacts: Contact[];
}

const Contacts: React.FC<ContactsProps> = ({ contacts }) => {
  const [searchQuery, setSearchQuery] = useState("");

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
                  {group.map((contact, index) => (
                    <React.Fragment key={contact.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>{contact.name[0].toUpperCase()}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={contact.name}
                          secondary={contact.number}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end">
                            <Phone />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < group.length - 1 && <Divider variant="inset" />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ))
        )}
      </Box>
    </Box>
  );
};

export default Contacts;
