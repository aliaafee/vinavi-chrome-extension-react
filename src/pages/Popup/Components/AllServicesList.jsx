import React, { useEffect, useState } from "react";

import { getResource } from "../../../api/VinaviApi";
import { JSONTree } from "react-json-tree";
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
                    list = [...list, ...services.data];
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
        <div>
            <JSONTree data={allServices} />
        </div>
    );
}
