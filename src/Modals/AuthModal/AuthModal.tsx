import { Box, Modal} from '@mui/material'
import  { useState } from 'react'
import LoginForm from './LoginForm/LoginForm';
import SignUpForm from './SignUpForm/SignUpForm';
import { useLoginStore } from '../../zustand/loginModalStore';

// type AuthModalTypes = {
//     open: boolean,
//     handleClose: () => void
// }

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    py: 2,
    px: 4,
    borderRadius: 5,
};

const LOGIN = "LOGIN"
const SIGNUP = "SIGNUP"
const AuthModal = () => {
    const { loginPopupOpen, setLoginPopupOpen } = useLoginStore();
    const handleClose = () => {
        setLoginPopupOpen(false)
    }
    const [currentPage, setCurrentPage] = useState<string>(LOGIN)
    const handleChangePage = () => {
        if (currentPage === LOGIN) {
            setCurrentPage(SIGNUP)
        } else {
            setCurrentPage(LOGIN)
        }
    }
    return (
        <Modal
            open={loginPopupOpen}
            onClose={(_, reason) => {
                if (reason === "backdropClick") {
                    return; // Ignore clicks on the backdrop
                }
                handleClose();
            }}
            aria-labelledby="login-modal-title"
            aria-describedby="login-modal-description"
        >
            <Box sx={style}>
                {
                    currentPage === LOGIN ?
                        <LoginForm handleChangePage={handleChangePage} handleClose={handleClose} />
                        : <SignUpForm handleChangePage={handleChangePage} />
                }

            </Box>
        </Modal>
    )
}

export default AuthModal
