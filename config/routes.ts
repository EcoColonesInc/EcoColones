/*

    * Define application routes for easy reference throughout the app.

*/

/* Landing page routes */
export const LANDING_PAGE_ROUTES = {
    HOME: "/",
    AFFILIATES: "/affiliates",
    CENTERS: "/centers",
    ABOUT: "/#about",
};

/* Authentication related routes */
export const AUTH_ROUTES = {
    LOGIN: "/login",
    REGISTER: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
    AUTHORIZED: "/authorized"
};

/* User side dashboard routes */
export const USER_ROUTES = {
    OVERVIEW: "/user",
    PROFILE: "/user/profile",
    SETTINGS: "/user/settings",
    MIECOQR: "/user/miEcoQr",
};

/* Admin side dashboard routes */
export const ADMIN_ROUTES = {
    OVERVIEW: "/admin",
    REPORTS: "/admin/reports",
    SETTINGS: "/admin/settings",
};

/* Affiliates side dashboard routes */
export const AFFILIATE_ROUTES = {
    OVERVIEW: "/affiliate/dashboard",
    SETTINGS: "/affiliate/dashboard/settings",
};

/* Centers side dashboard routes */
export const CENTER_ROUTES = {
    OVERVIEW: "/center/dashboard",
    SETTINGS: "/center/dashboard/settings",
};