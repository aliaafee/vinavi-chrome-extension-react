import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
    getAuthenticatedUser,
    getServiceProvider,
    setCurrentServiceProvider,
    vinaviLogin,
} from "../api/VinaviApi";

import AuthContext from "./auth-context";
import ErrorMessage from "./error-message";
import LoadingSpinner from "./loading-spinner";
import { ActiveTabContextProvider } from "./active-tab-context";
import { AlertTriangle, InfoIcon, User } from "lucide-react";

const processUser = (user) => {
    return {
        ...user,
        serviceProviders:
            user.data.relationships.professional.data.relationships[
                "service-providers"
            ].data.reduce(
                (a, serviceProvider) => ({
                    ...a,
                    [serviceProvider.id]: serviceProvider,
                }),
                {}
            ),
        expiration_date: dayjs(
            user.data.relationships.professional.data.attributes.expiration_date
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

                await vinaviLogin();

                const loggedUser = processUser(await getAuthenticatedUser());
                setUser(loggedUser);

                try {
                    const selectedServiceProvider = await getServiceProvider();

                    if (!!selectedServiceProvider) {
                        setServiceProvider(selectedServiceProvider);
                        chrome.storage.sync.set({
                            [loggedUser.data.id]: {
                                serviceProviderId:
                                    selectedServiceProvider.data.id,
                            },
                        });
                    }
                } catch (error) {
                    await chrome.storage.sync.get(
                        loggedUser.data.id,
                        (data) => {
                            if (!!data[loggedUser.data.id].serviceProviderId) {
                                onSetServiceProvider(
                                    data[loggedUser.data.id].serviceProviderId
                                );
                            }
                        }
                    );
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onSetServiceProvider = (newServiceProviderId) => {
        (async () => {
            try {
                setLoading(true);

                await setCurrentServiceProvider(newServiceProviderId);

                // Need to wait for a bit till the server will respond
                // correctly to get service provider
                await new Promise((r) => setTimeout(r, 2000));

                const selectedServiceProvider = await getServiceProvider();
                setServiceProvider(selectedServiceProvider);
            } catch (error) {
                setError(`${error}, retry in a few moments.`);
            } finally {
                setLoading(false);
            }
        })();
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
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

    if (!serviceProvider) {
        return (
            <ErrorMessage
                title="Error"
                message="Service Provider not Selected."
            >
                Go to{" "}
                <a
                    target="_blank"
                    href="https://vinavi.aasandha.mv/"
                    className="text-blue-600 hover:underline"
                >
                    https://vinavi.aasandha.mv/
                </a>{" "}
                to select service provider.
                {error && (
                    <div className="p-1.5 bg-red-100 rounded-md">
                        {error.message}
                    </div>
                )}
            </ErrorMessage>
        );
    }

    const time_to_expiration = user.expiration_date.diff(dayjs(), "day");

    return (
        <ActiveTabContextProvider>
            <AuthContext.Provider
                value={{ user: user, serviceProvider: serviceProvider }}
            >
                <div className="items-center top-0 left-0 fixed flex justify-end w-full gap-4">
                    <div className="mr-28 px-1.5 py-1.5 flex flex-col items-start rounded-b-md bg-gray-300">
                        <div className="flex items-center gap-1.5">
                            <User size={16} color="black" />
                            {user.data.attributes.full_name}
                        </div>
                        {time_to_expiration < 60 ? (
                            <div className="flex items-center gap-1.5 ">
                                {time_to_expiration <= 0 ? (
                                    <>
                                        <AlertTriangle
                                            size={16}
                                            color="red"
                                            className="animate-bounce"
                                        />
                                        <span className="text-red-600">
                                            License Expired on{" "}
                                            {user.expiration_date.format(
                                                "YYYY-MM-DD"
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <InfoIcon size={16} color="red" />
                                        License expires in {
                                            time_to_expiration
                                        }{" "}
                                        days, on{" "}
                                        {user.expiration_date.format(
                                            "YYYY-MM-DD"
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                {children}
            </AuthContext.Provider>
        </ActiveTabContextProvider>
    );
}
