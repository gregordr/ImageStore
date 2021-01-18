import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import ResponsiveDrawer from "./Components/Page";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { SnackbarProvider } from "notistack";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#444444",
            dark: "#000000",
            light: "#000000",
        },
        secondary: {
            main: "#ff0000",
        },
        background: {
            // default: "#00ff00", background behind the photos while in miniview; change for dark mode
            // paper: "#0000ff" searchbar + drawer on the left
        },
    },
});

ReactDOM.render(
    <React.StrictMode>
        <Router basename={process.env.PUBLIC_URL}>
            <ThemeProvider theme={theme}>
                <SnackbarProvider
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    <ResponsiveDrawer />
                </SnackbarProvider>
            </ThemeProvider>
        </Router>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
