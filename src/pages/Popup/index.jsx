import App from "@/components/app";
import React from "react";
import { createRoot } from "react-dom/client";
import "@/styles.css";
import PatientSearch from "@/components/patient-search";

const container = document.getElementById("app-container");
const root = createRoot(container);
// root.render(
//     <WaitLoad>
//         <App />
//     </WaitLoad>
// );

root.render(
    <App>
        <PatientSearch />
    </App>
);
