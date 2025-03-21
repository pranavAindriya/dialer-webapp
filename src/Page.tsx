import React, { useState } from "react";
import { Box, Paper, Tab, Tabs } from "@mui/material";
import { AddressBook, ClockCounterClockwise } from "@phosphor-icons/react";
import Dialer from "./components/Dialer";
import RecentCalls from "./components/RecentCalls";
import Contacts from "./components/Contacts";
// import { callPartyStore } from "./zustand/callPartyStore";

interface Call {
  id: number;
  name?: string;
  number: string;
  status: "Outgoing" | "Missed" | "Not Picked";
  timestamp: number;
}

// interface Contact {
//   id: number;
//   name: string;
//   number: string;
//   status?: "Outgoing" | "Missed" | "Not Picked";
//   timestamp?: Date | number;
// }

const Page: React.FC = () => {
  // const { apartyno } = callPartyStore();
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

  const contacts = [
    { id: 1, name: "Anoob", number: "9846940888" },
    { id: 2, name: "Pranav", number: "9072544016" },
    { id: 3, name: "Dheeraj", number: "9544321056" },
    { id: 4, name: "Munees", number: "9747256118" },
    { id: 5, name: "Jamshad", number: "9745561871" },
    { id: 6, name: "Anshid", number: "7736274558" },
    { id: 7, name: "Yaseen", number: "8921590995" },
    { id: 8, name: "Joyel", number: "7994095038" },
  ];

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

  const handleCloseDialer = () => {
    setShowDialer(false)
  }

  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flexGrow: 1, position: "relative", bgcolor: "white" }}>
        {/* <Grid
          item
          xs={0}
          md={6}
          lg={5}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Dialer onDial={handleDial} onClose={() => setShowDialer(false)} />
        </Grid> */}
        <Box
          sx={{ display: "flex", flexDirection: "column" }}
          height={"100dvh"}
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
                onDialClick={() => setShowDialer(true)}
                dialerStatus={showDialer}
              />
            )}
            {tabValue === 1 && (
              <Contacts
                onDialClick={() => setShowDialer(true)}
                dialerStatus={showDialer}
              />
            )}
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
        </Box>
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
          <Dialer onDial={handleDial} onClose={handleCloseDialer} />
        </Box>
      </Box>
    </Box>
  );
};

export default Page;
