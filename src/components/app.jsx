import React, { useEffect, useState } from "react";

import { getAuthenticatedUser, getServiceProvider } from "../api/VinaviApi";
import PatientSearch from "./patient-search";
import AuthContext from "./auth-context";
import ErrorMessage from "./error-message";
import LoadingSpinner from "./loading-spinner";
import { ActiveTabContextProvider } from "./active-tab-context";
import { User } from "lucide-react";
// import SelectedServiceProviderForm from "./SelectServiceProviderForm";

const processUser = (user) => {
    return {
        ...user,
        serviceProviders: user.included
            .filter((included) => included.type === "service-providers")
            .reduce(
                (a, serviceProvider) => ({
                    ...a,
                    [serviceProvider.id]: serviceProvider,
                }),
                {}
            ),
    };
};

export default function App({ children }) {
    const [user, setUser] = useState(null);
    const [serviceProvider, setServiceProvider] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setError(null);
            try {
                setLoading(true);

                const loggedUser = processUser(await getAuthenticatedUser());
                setUser(loggedUser);

                try {
                    const selectedServiceProvider = await getServiceProvider();
                    setServiceProvider(selectedServiceProvider);
                } catch (error) {}
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // const onSetServiceProvider = (newServiceProviderId) => {
    //     alert(newServiceProviderId);
    //     (async () => {
    //         try {
    //             setLoading(true);

    //             await VinaviApi.setServiceProvider(newServiceProviderId);

    //             const selectedServiceProvider =
    //                 await VinaviApi.getServiceProvider();
    //             setServiceProvider(selectedServiceProvider);
    //         } catch (error) {
    //             setError(error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     })();
    // };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!(user && serviceProvider)) {
        return (
            <ErrorMessage title="Error" message="Not Authorized.">
                Go to{" "}
                <a
                    target="_blank"
                    href="https://auth.aasandha.mv/auth/login"
                    className="text-blue-600 hover:underline"
                >
                    https://auth.aasandha.mv/auth/login
                </a>{" "}
                to complete login and select service provider.
                {error && (
                    <div className="p-1.5 bg-red-100 rounded-md">
                        {error.message}
                    </div>
                )}
            </ErrorMessage>
        );
    }

    if (error) {
        return <ErrorMessage title="Error" message={error.message} />;
    }

    // if (!serviceProvider) {
    //     return (
    //         <SelectedServiceProviderForm
    //             serviceProviders={user.serviceProviders}
    //             onSave={onSetServiceProvider}
    //         />
    //     );
    // }

    return (
        <ActiveTabContextProvider>
            <AuthContext.Provider
                value={{ user: user, serviceProvider: serviceProvider }}
            >
                <div className="items-center top-0 left-0 fixed flex justify-end w-full gap-4">
                    <div className="mr-28 flex items-center gap-1.5 px-1.5 py-1.5 rounded-b-md bg-gray-300">
                        <User size={16} color="black" />
                        {user.data.attributes.full_name}
                    </div>
                </div>
                {children}
            </AuthContext.Provider>
        </ActiveTabContextProvider>
    );
}
