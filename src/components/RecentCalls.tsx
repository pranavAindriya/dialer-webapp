import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Phone,
  PhoneDisconnect,
  PhoneOutgoing,
  PhoneX,
} from "@phosphor-icons/react";
import axios from "axios";
import { useAuthStore } from "../zustand/authStore";

interface Call {
  id: number;
  name?: string | null;
  phone: string;
  status: string;
  timestamp: string;
}

interface RecentCallsProps {
  onDialClick: () => void;
  dialerStatus: boolean;
}

const RecentCalls: React.FC<RecentCallsProps> = ({ dialerStatus }) => {
  const { user, token } = useAuthStore();
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  // const formatDate = (timestamp: Date | number) =>
  //   new Date(timestamp).toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Connected":
        return <PhoneOutgoing style={{ color: "#4caf50" }} />;
      case "User Not Responding":
        return <PhoneX style={{ color: "#f44336" }} />;
      case "Disconnected":
        return <PhoneDisconnect style={{ color: "#9e9e9e" }} />;
      case null:
        return <PhoneDisconnect style={{ color: "#9e9e9e" }} />;
      default:
        return <PhoneOutgoing style={{ color: "#4caf50" }} />;
    }
  };

  const groupByDate = () => {
    const groups: { [key: string]: Call[] } = {};
    return groups;
  };

  const callsByDate = groupByDate();
  console.log(callsByDate);

  // const getDateLabel = (dateStr: string) => {
  //   const date = new Date(dateStr);
  //   const today = new Date();
  //   const yesterday = new Date(today);
  //   yesterday.setDate(yesterday.getDate() - 1);

  //   if (date.toDateString() === today.toDateString()) return "Today";
  //   if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  //   return date.toLocaleDateString();
  // };

  const fetchRecentCalls = React.useCallback(async () => {
    try {
      const res = await axios.post(
        "https://phpstack-1431591-5347985.cloudwaysapps.com/api/get/recents-calls",
        { user_id: user?.user_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        setRecentCalls(res.data.recent_calls);
      } else {
        console.log("something went wrong");
      }
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }, [user?.user_id, token]);

  useEffect(() => {
    if (!dialerStatus) {
      fetchRecentCalls();
    }
  }, [dialerStatus, fetchRecentCalls]);

  return (
    <Box sx={{ height: "100%", position: "relative" }}>
      <Box sx={{ height: "100%", overflowY: "auto" }}>
        {recentCalls.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", mt: 4 }}
            color="text.secondary"
          >
            No recent calls
          </Typography>
        ) : (
          <>
            <Box>Recent Calls</Box>
            <List sx={{ padding: 0, listStyle: "none" }}>
              {/* Remove default list styles */}
              {recentCalls.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: "36px" }}>
                      {getStatusIcon(item.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name || item.phone}
                      secondary={`${
                        item.status === null ? "Not Connected" : item.status
                      } | ${
                        item.timestamp === null ? "0 Seconds" : item.timestamp
                      }`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end">
                        <Phone />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < recentCalls.length - 1 && (
                    <Divider variant="inset" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </Box>
    </Box>
  );
};

export default RecentCalls;

// Object.entries(callsByDate)
//             .sort(
//               ([dateA], [dateB]) =>
//                 new Date(dateB).getTime() - new Date(dateA).getTime()
//             )
//             .map(([dateStr, calls]) => (
//               <Box key={dateStr}>
//                 <Typography
//                   variant="subtitle2"
//                   sx={{ p: 1, bgcolor: "background.default" }}
//                 >
//                   {getDateLabel(dateStr)}
//                 </Typography>
//                 <List dense>
//                   {calls.map((call, index) => (
//                     <React.Fragment key={call.id}>
//                       <ListItem>
//                         <ListItemIcon sx={{ minWidth: "36px" }}>
//                           {getStatusIcon(call.status)}
//                         </ListItemIcon>
//                         <ListItemText
//                           primary={call.name || call.number}
//                           secondary={`${call.status} | ${formatDate(
//                             call.timestamp
//                           )}`}
//                         />
//                         <ListItemSecondaryAction>
//                           <IconButton edge="end">
//                             <Phone />
//                           </IconButton>
//                         </ListItemSecondaryAction>
//                       </ListItem>
//                       {index < calls.length - 1 && <Divider variant="inset" />}
//                     </React.Fragment>
//                   ))}
//                 </List>
//               </Box>
//             ))
