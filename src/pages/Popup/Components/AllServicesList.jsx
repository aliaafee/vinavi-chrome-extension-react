import React, { useEffect, useState } from "react";

import { getResource } from "../../../api/VinaviApi";
import { JSONTree } from "react-json-tree";
import * as XLSX from "xlsx";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

function getServices(page) {
    return getResource(
        `https://vinavi.aasandha.mv/api/services?filter%5Bis_active%5D=true&include=category,service-professions&page%5Bsize%5D=15&sort=-created_at&page%5Bnumber%5D=${page}`
    );
}

export default function AllServicesList({ className = "", style = {} }) {
    const [allServices, setAllServices] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setError(null);
            try {
                setLoading(true);

                let page = 0;
                let list = [];
                let services;

                do {
                    page = page + 1;
                    services = await getServices(page);
                    list.push(
                        ...services.data.map((item) => ({
                            id: item.id,
                            code: item.attributes.code,
                            name: item.attributes.name,
                            service_type: item.attributes.service_type,
                            active_from: item.attributes.active_from,
                            active_to: item.attributes.active_to,
                        }))
                    );
                    setAllServices(list);
                } while (services.meta.last_page > services.meta.current_page);

                console.log(list);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleDownload = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(allServices);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Services");

        // Generate a binary string representation of the workbook
        const wbout = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "binary",
        });

        // Convert binary string to array buffer
        const buf = new ArrayBuffer(wbout.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < wbout.length; i++) {
            view[i] = wbout.charCodeAt(i) & 0xff;
        }

        // Create a blob from the array buffer
        const blob = new Blob([buf], { type: "application/octet-stream" });

        // Create a link element and trigger a download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "services.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // if (isLoading) {
    //     return (
    //         <div className={className} style={style}>
    //             <LoadingSpinner />
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className={className} style={style}>
    //             <ErrorMessage title="Error" message={error.message} />
    //         </div>
    //     );
    // }

    if (!allServices) {
        return <div>No Services</div>;
    }

    return (
        <div className="overflow-auto">
            <button onClick={handleDownload} disabled={isLoading}>
                {isLoading ? "Loading..." : "Download Spreadsheet"}
            </button>
            <table>
                <thead>
                    <tr>
                        <td>id</td>
                        <td>code</td>
                        <td>name</td>
                        <td>service_type</td>
                        <td>active_from</td>
                        <td>active_to</td>
                    </tr>
                </thead>
                <tbody>
                    {allServices.map((service, index) => (
                        <tr key={service.id}>
                            <td>{service.id}</td>
                            <td>{service.code}</td>
                            <td>{service.name}</td>
                            <td>{service.service_type}</td>
                            <td>{service.active_from}</td>
                            <td>{service.active_to}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
