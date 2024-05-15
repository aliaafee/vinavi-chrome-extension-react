import React from "react";

export default function ServicesList({ services }) {
    if (services.length < 1) {
        return <div id="services"></div>;
    }

    return (
        <div id="services">
            <h2 className="my-2 font-bold">Requested Services</h2>
            <ul className="rounded-md divide-solid divide-y divide-x-0 bg-gray-100 divide-grey-300">
                {services.map((service, index) => (
                    <li key={index} className="p-1.5 flex gap-1.5 min-w-8">
                        <span>
                            {service.relationships.service.data.attributes.code}
                        </span>
                        <span>
                            {service.relationships.service.data.attributes.name}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
