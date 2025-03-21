import { Alert, Box, Button, TextField, Typography } from '@mui/material'

import React, { useState } from "react";
// import { useAuthStore } from '../../../zustand/authStore';
import axios from 'axios';

type SignUpTypes = {
  handleChangePage: () => void
}

type FormTypes = {
  f_name: string,
  l_name: string,
  phone: string,
  email: string,
  password: string,
};
const emptyString = {
  f_name: "",
  l_name: "",
  phone: "",
  email: "",
  password: "",
}

const SignUpForm = ({ handleChangePage }: SignUpTypes) => {
  const [error, setError] = useState<string>("")
  // const [isLoading, setIsLoading] = useState<boolean>(false)

  const [formValues, setFormValues] = useState<FormTypes>({
    ...emptyString
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const res = await axios.post("https://phpstack-1431591-5347985.cloudwaysapps.com/api/create-user", formValues)
      if (res.data.success) {
        handleChangePage()
        setFormValues({ ...emptyString })
      } else {
        setError(res.data.errorMsg)
      }

    } catch (err) {
      console.log(err);
    }
    console.log(formValues);
  }

  return (
    <Box>
      <Typography
        id="login-modal-title"
        variant="h5"
        component="h2"
        mb={2}
        textAlign={"center"}
      >
        SIGN UP
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSignUp} sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="f_name"
          label="First Name"
          name="f_name"
          autoComplete="f_name"
          autoFocus
          value={formValues.f_name}
          onChange={handleChange}
        // disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="l_name"
          label="Last Name"
          name="l_name"
          autoComplete="l_name"
          value={formValues.l_name}
          onChange={handleChange}
        // disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          value={formValues.email}
          onChange={handleChange}
        // disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="phone"
          label="Phone Number"
          name="phone"
          autoComplete="phone"
          type='number'

          value={formValues.phone}
          onChange={handleChange}
        // disabled={isLoading}
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
          value={formValues.password}
          onChange={handleChange}
        // disabled={isLoading}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, color: "white" }}
        // disabled={isLoading}
        >
          {/* {isLoading ? <CircularProgress size={24} /> : "SignUp"} */}
          Signup
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button onClick={handleChangePage}>Login</Button>
      </Box>
    </Box>
  );
};

export default SignUpForm;
