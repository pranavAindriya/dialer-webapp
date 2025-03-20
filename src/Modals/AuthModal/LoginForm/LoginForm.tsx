import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../zustand/authStore';
import { callPartyStore } from '../../../zustand/callPartyStore';

type LoginFormtype = {
    handleChangePage: () => void;
    handleClose: () => void;
}

const LoginForm = ({ handleChangePage, handleClose }: LoginFormtype) => {
    const { isAuthenticated, isLoading, error, login, user } =
        useAuthStore();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    const { setApartyNo } = callPartyStore();
    useEffect(() => {
        if (isAuthenticated) {
            setApartyNo(user?.phone)
            handleClose()
        }
    }, [isAuthenticated])

    return (
        <Box>

            <Typography
                id="login-modal-title"
                variant="h5"
                component="h2"
                mb={2}
                textAlign={"center"}
            >
                Login To Make Calls
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    type='email'
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, color: "white" }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : "Login"}
                </Button>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button onClick={handleChangePage}>Sign up</Button>
            </Box>
        </Box>
    )
}

export default LoginForm
