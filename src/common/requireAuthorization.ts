import { Prepare } from "@entity-access/server-pages/dist/decorators/Prepare.js";

export const requireAuthorization = Prepare.authorizeRedirect(
    (x) => x.userID as any,
    "/login",
    "redirect"
);