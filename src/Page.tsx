import React, { useState } from "react";
import { Box, Grid, Paper, Tab, Tabs, useTheme } from "@mui/material";
import { AddressBook, ClockCounterClockwise } from "@phosphor-icons/react";
import Dialer from "./components/Dialer";
import RecentCalls from "./components/RecentCalls";
import Contacts from "./components/Contacts";

interface Call {
  id: number;
  name?: string;
  number: string;
  status: "Outgoing" | "Missed" | "Not Picked";
  timestamp: number;
}

interface Contact {
  id: number;
  name: string;
  number: string;
  status?: "Outgoing" | "Missed" | "Not Picked";
  timestamp?: Date | number;
}

const Page: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showDialer, setShowDialer] = useState(false);

  const [recentCalls, setRecentCalls] = useState([
    {
      id: 1,
      name: "Hardik Pandya",
      number: "+917622365663",
      status: "Outgoing",
      timestamp: new Date().setHours(new Date().getHours() - 1),
    },
    {
      id: 2,
      name: "Rohit Sharma",
      number: "+917622365664",
      status: "Missed",
      timestamp: new Date().setHours(new Date().getHours() - 2),
    },
    {
      id: 3,
      number: "+917622365663",
      status: "Not Picked",
      timestamp: new Date().setHours(new Date().getHours() - 3),
    },
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: "Amisha", number: "+917622365663" },
    { id: 2, name: "Bunty", number: "+917622365663" },
    { id: 3, name: "Brijesh Tiwari", number: "+917622365663" },
    { id: 4, name: "Chotulal Chaudhary", number: "+917622365663" },
    { id: 5, name: "Chandrika Chaatala", number: "+917622365663" },
    { id: 6, name: "Chirag Bansal", number: "+917622365663" },
    { id: 7, name: "Chirag Paswan", number: "+917622654613" },
    { id: 8, name: "Chirag Paswan 2", number: "+917622365663" },
    { id: 9, name: "Chirag Reddy", number: "+917622365663" },
  ]);

  const theme = useTheme();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setShowDialer(false);
  };

  const handleDial = (number: string) => {
    const newCall: Call = {
      id: Date.now(),
      number,
      status: "Outgoing",
      timestamp: Date.now(),
    };
    const contact = contacts.find((c) => c.number === number);
    if (contact) newCall.name = contact.name;
    setRecentCalls([newCall, ...recentCalls]);
    setTabValue(0);
    setShowDialer(false);
  };

  const isMobile = theme.breakpoints.down("md");

  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <Grid container sx={{ flexGrow: 1, position: "relative" }}>
        <Grid
          item
          xs={0}
          md={6}
          lg={5}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Dialer onDial={handleDial} onClose={() => setShowDialer(false)} />
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          lg={7}
          sx={{ display: "flex", flexDirection: "column" }}
          maxHeight={"100dvh"}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: 2,
              pt: 2,
              "& ::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {tabValue === 0 && (
              <RecentCalls
                recentCalls={recentCalls}
                onDialClick={() => setShowDialer(true)}
                dialerStatus={showDialer}
              />
            )}
            {tabValue === 1 && <Contacts contacts={contacts} />}
          </Box>
          <Paper sx={{ borderRadius: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
              }}
              textColor="primary"
            >
              <Tab
                icon={<ClockCounterClockwise size={22} />}
                label="Recent"
                sx={{ textTransform: "capitalize", fontSize: 12 }}
              />
              <Tab
                icon={<AddressBook size={22} />}
                label="Contacts"
                sx={{ textTransform: "capitalize", fontSize: 12 }}
              />
            </Tabs>
          </Paper>
        </Grid>
        {isMobile && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: showDialer ? "100%" : 0,
              transform: `translateY(${showDialer ? 0 : "100%"})`,
              transition: "transform 0.3s ease-in-out",
              bgcolor: "background.paper",
              zIndex: 1000,
              md: { position: "static", height: "100%", transform: "none" },
            }}
          >
            <Dialer onDial={handleDial} onClose={() => setShowDialer(false)} />
          </Box>
        )}
      </Grid>
    </Box>
  );
};

export default Page;
