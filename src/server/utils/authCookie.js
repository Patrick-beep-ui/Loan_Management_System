export const AUTH_COOKIE_NAME = "access_token";

export function authCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    };
}

export function readAuthCookie(req) {
    const cookies = req.headers.cookie || "";

    for (const cookie of cookies.split(";")) {
        const [name, ...value] = cookie.trim().split("=");

        if (name === AUTH_COOKIE_NAME) {
            try {
                return decodeURIComponent(value.join("="));
            } catch {
                return "";
            }
        }
    }

    return "";
}
