const API_URL =
    `${process.env.NEXT_PUBLIC_API_URL}` +
    `${process.env.NEXT_PUBLIC_API_PREFIX}` +
    `${process.env.NEXT_PUBLIC_API_VERSION}`;

interface AuthFetchOptions extends RequestInit {
    accessToken: string;
    refreshToken: string;
}

interface AuthFetchResult<T> {
    success: boolean;
    data: T | null;
    accessToken?: string;
    refreshToken?: string;
}

export async function authFetch<T>(
    endpoint: string,
    options: AuthFetchOptions
): Promise<AuthFetchResult<T>> {
    const {
        accessToken: initialAccessToken,
        refreshToken: initialRefreshToken,
        ...fetchOptions
    } = options;


    if (!initialAccessToken || !initialRefreshToken) {
        console.log("block check ");
        return {
            success: false,
            data: null,
        };
    }

    let accessToken = initialAccessToken;
    let refreshToken = initialRefreshToken;

    console.log("test2")

    const makeRequest = async (token: string) => {
        const url = `${API_URL}${endpoint}`;
        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                ...fetchOptions.headers,
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        return response;
    };

    console.log("test3")
    let response = await makeRequest(accessToken);

    console.log("test4")
    if (response.ok) {
        return {
            success: true,
            data: await response.json(),
        };
    }

    console.log("test5")
    if (response.status !== 401) {
        return {
            success: false,
            data: await response.json(),
        };
    }
    console.log("test6")

    const errorData = await response
        .clone()
        .json()
        .catch(() => null);

    console.log("api error", errorData);
    if (errorData?.message !== "Token Expired") {
        return {
            success: false,
            data: null,
        };
    }

    const refreshResponse = await fetch(
        `${API_URL}/clients/auth/refresh`,
        {
            method: "POST",
            headers: {
                ...fetchOptions.headers,
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
            },
            cache: "no-store",
            body: JSON.stringify({
                token: refreshToken,
            }),
        }
    );


    const responseData = await refreshResponse.json();

    console.log("inner res: ", responseData)
    if (!refreshResponse.ok) {
        return {
            success: false,
            data: null,
        };
    }

    const resAccessToken = responseData.data?.accessToken;

    if (!resAccessToken) {
        return {
            success: false,
            data: null,
        };
    }

    const newAccessToken = resAccessToken

    if (!newAccessToken) {
        return {
            success: false,
            data: null,
        };
    }

    accessToken = newAccessToken;

    response = await makeRequest(accessToken);

    if (!response.ok) {
        return {
            success: false,
            data: null,
            accessToken,
            refreshToken,
        };
    }

    return {
        success: true,
        data: await response.json(),
        accessToken,
        refreshToken,
    };
}