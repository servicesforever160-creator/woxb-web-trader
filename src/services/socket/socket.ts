import { io, Socket } from "socket.io-client";
import { setSocketReconnecting } from "./connection-status";

let socket: Socket | null = null;

const RECONNECT_DELAY = 5000;

let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

const resetReconnect = () => {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
};

export const createSocket = (accessToken: string) => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
        path: "/web-socket/",
        auth: {
            token: accessToken,
        },
        reconnection: false,
    });

    newSocket.on("connect", () => {
        resetReconnect();
        setSocketReconnecting(false);

        console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);

        if (reason !== "io client disconnect") {
            scheduleReconnect(newSocket);
        }
    });

    newSocket.on("connect_error", (error) => {
        console.log("Socket connection failed:", error.message);

        scheduleReconnect(newSocket);
    });

    return newSocket;
};

const scheduleReconnect = (socketInstance: Socket) => {
    if (socketInstance.connected) return;

    setSocketReconnecting(true);

    if (reconnectTimeout) return;

    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;

        if (!socketInstance.connected) {
            socketInstance.connect();
        }
    }, RECONNECT_DELAY);
};

export const getSocket = (accessToken: string): Socket => {
    if (!socket) {
        socket = createSocket(accessToken);
    } else {
        const currentToken = (socket.auth as { token?: string })?.token;
        if (currentToken !== accessToken) {
            resetReconnect();
            socket.auth = { token: accessToken };
            socket.disconnect();
            socket.connect();
        } else if (!socket.connected && !reconnectTimeout) {
            socket.connect();
        }
    }

    return socket;
};

export const disconnectSocket = () => {
    resetReconnect();
    setSocketReconnecting(false);

    if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
        socket = null;
    }
};
