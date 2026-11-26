const SOCKET_CONNECTION_EVENT = "paxivo:socket-connection";

let reconnecting = false;

export function isSocketReconnecting() {
    return reconnecting;
}

export function subscribeToSocketConnection(onChange: () => void) {
    window.addEventListener(SOCKET_CONNECTION_EVENT, onChange);
    return () => window.removeEventListener(SOCKET_CONNECTION_EVENT, onChange);
}

export function setSocketReconnecting(value: boolean) {
    if (typeof window === "undefined" || reconnecting === value) return;

    reconnecting = value;
    window.dispatchEvent(new CustomEvent(SOCKET_CONNECTION_EVENT, {
        detail: { reconnecting: value },
    }));
}
