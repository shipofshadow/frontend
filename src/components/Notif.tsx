import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import {useAuth} from "../context/AuthContext.tsx";
import {API_BASE_URL} from "../config.ts";

let socket: Socket;

const Notifications: React.FC = () => {
    const {token} = useAuth()
    useEffect(() => {

        // connect with JWT auth
        socket = io(`${API_BASE_URL}`, {
            auth: { token },
            withCredentials: true,
        });

        // handle connection
        socket.on("connect", () => {
            console.log("Connected with socket ID:", socket.id);
        });

        // listen for notifications
        socket.on("notification", (data) => {
            console.log("Notification:", data);
            // you can trigger a toast or update state here
        });

        // handle disconnect
        socket.on("disconnect", () => {
            console.log("❌ Disconnected");
        });

        // cleanup
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h2>Socket.IO Test</h2>
            <button
                onClick={() => {
                    socket.emit("ping_server", { msg: "Hello from React TSX!" });
                }}
            >
                Send Ping
            </button>
        </div>
    );
};

export default Notifications;
