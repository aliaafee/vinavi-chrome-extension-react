import React, { useState } from "react";

export default function SelectedServiceProviderForm({
    serviceProviders,
    onSave,
}) {
    const [serviceProvider, setServiceProvider] = useState(null);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <form
                onSubmit={(event) => {
                    event.preventDefault;
                    onSave(serviceProvider);
                }}
                className="drop-shadow-md flex flex-col p-2 gap-2 bg-gray-300 rounded-md"
            >
                <div>Select Service Provider</div>
                {Object.entries(serviceProviders).map(([key, provider]) => (
                    <div key={key}>
                        <label>
                            <input
                                type="radio"
                                id={key}
                                value={key}
                                checked={serviceProvider === key}
                                onChange={() => setServiceProvider(key)}
                                name="serviceProvider"
                            ></input>
                            {provider.attributes.name}
                        </label>
                    </div>
                ))}
                <input type="submit" value="Select" />
            </form>
        </div>
    );
}
