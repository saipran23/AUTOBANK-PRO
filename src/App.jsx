import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./context/UserContext";
import Routes from "./Routes";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Routes />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;

