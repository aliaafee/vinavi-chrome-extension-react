import { createContext } from "react";

const AuthContext = createContext({ user: null, serviceProvider: null });

export default AuthContext;
