import React from "react";
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
  Fab,
} from "@mui/material";
import {
  Phone,
  PhoneDisconnect,
  PhoneOutgoing,
  PhoneX,
} from "@phosphor-icons/react";
import { useTheme, useMediaQuery } from "@mui/material";

interface Call {
  id: number;
  name?: string;
  number: string;
  status: string;
  timestamp: Date | number;
}

interface RecentCallsProps {
  recentCalls: Call[];
  onDialClick: () => void;
  dialerStatus: boolean;
}

const RecentCalls: React.FC<RecentCallsProps> = ({
  recentCalls,
  onDialClick,
  dialerStatus,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const formatDate = (timestamp: Date | number) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Outgoing":
        return <PhoneOutgoing style={{ color: "#4caf50" }} />;
      case "Missed":
        return <PhoneX style={{ color: "#f44336" }} />;
      case "Not Picked":
        return <PhoneDisconnect style={{ color: "#9e9e9e" }} />;
      default:
        return <PhoneOutgoing style={{ color: "#4caf50" }} />;
    }
  };

  const groupByDate = () => {
    const groups: { [key: string]: Call[] } = {};
    recentCalls.forEach((call) => {
      const date = new Date(call.timestamp);
      const dateStr = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ).toISOString();
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(call);
    });
    return groups;
  };

  const callsByDate = groupByDate();

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ height: "100%", position: "relative" }}>
      <Box sx={{ height: "100%", overflowY: "auto" }}>
        {Object.keys(callsByDate).length === 0 ? (
          <Typography
            sx={{ textAlign: "center", mt: 4 }}
            color="text.secondary"
          >
            No recent calls
          </Typography>
        ) : (
          Object.entries(callsByDate)
            .sort(
              ([dateA], [dateB]) =>
                (new Date(dateB) as any) - (new Date(dateA) as any)
            )
            .map(([dateStr, calls]) => (
              <Box key={dateStr}>
                <Typography
                  variant="subtitle2"
                  sx={{ p: 1, bgcolor: "background.default" }}
                >
                  {getDateLabel(dateStr)}
                </Typography>
                <List dense>
                  {calls.map((call, index) => (
                    <React.Fragment key={call.id}>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: "36px" }}>
                          {getStatusIcon(call.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={call.name || call.number}
                          secondary={`${call.status} | ${formatDate(
                            call.timestamp
                          )}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end">
                            <Phone />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < calls.length - 1 && <Divider variant="inset" />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ))
        )}
      </Box>
      {isMobile && (
        <Fab
          color="primary"
          onClick={onDialClick}
          sx={{
            position: "absolute",
            bottom: 0,
            right: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: dialerStatus ? "none" : "block",
          }}
        >
          <Phone color="white" style={{ marginTop: "6px" }} size={18} />
        </Fab>
      )}
    </Box>
  );
};

export default RecentCalls;
