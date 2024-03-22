import React from "react";
import { createRoot } from "react-dom/client";

import App from "./Components/App";
import WaitLoad from "./Components/WaitLoad";
import { Rotate3D } from "lucide-react";

const container = document.getElementById("app-container");
const root = createRoot(container);
// root.render(
//     <WaitLoad>
//         <App />
//     </WaitLoad>
// );

root.render(<App />);
