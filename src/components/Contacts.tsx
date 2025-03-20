import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { MagnifyingGlass, Phone } from "@phosphor-icons/react";
import { callPartyStore } from "../zustand/callPartyStore";
import { useAuthStore } from "../zustand/authStore";
import ContactAddModal from "../Modals/contactAddModal/contactAddModal";
import axios from "axios";

interface Contact {
  // id: number;
  name: string;
  phone: string;
}

interface ContactsProps {
  onDialClick: () => void;
  dialerStatus: boolean;
}

const Contacts: React.FC<ContactsProps> = ({
  onDialClick,
  dialerStatus,
}) => {

  const { setBpartyNo, apartyno, bpartyno } = callPartyStore();
  const { user, token } = useAuthStore()
  const [addContactOpen, setaddContactOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("");
  const [contactList, setContactList] = useState<Contact[]>([])

  const fetchContactList = async () => {
    try {
      const res = await axios.post("https://phpstack-1431591-5347985.cloudwaysapps.com/api/contact-list",
        { user_id: user?.user_id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

      if (res.data.success) {
        setContactList(res.data.contact_data)
      }
      console.log(res);

    } catch (err) {
      console.log(err);

    }
  }
  useEffect(() => {
    if (!addContactOpen) {

      fetchContactList()
    }
  }, [addContactOpen])




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

  // Function to check if contact is selected as A-party or B-party
  const getContactRole = (contactNumber: string) => {
    if (contactNumber === apartyno) return "A-party";
    if (contactNumber === bpartyno) return "B-party";
    return null;
  };

  const handleCloseAddContact = () => setaddContactOpen(false);

  const handleCall = (contact: Contact) => {
    console.log(contact);
    onDialClick()
    setBpartyNo(contact.phone)
  }


  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
            flex: "1"
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
        <Button variant="contained" sx={{ color: "white" }} onClick={() => setaddContactOpen(true)}>Add </Button>
        <Button variant="contained" sx={{ color: "white" }}>Import </Button>
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
                                {/* {contactRole && (
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
                                )} */}
                              </Box>
                            }
                            secondary={contact.phone}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleCall(contact)} color="primary">
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
      <ContactAddModal open={addContactOpen} handleClose={handleCloseAddContact} />
    </Box>
  );
};

export default Contacts;
