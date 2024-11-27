import { useMatches } from "@remix-run/react";
import type { user } from "@prisma/client";

import {useMemo} from "react";

export function useMatchesData(
    id: string
): Record<string, unknown> | undefined {
    const matchingRoutes = useMatches();
    const route = useMemo(
        () => matchingRoutes.find((route) => route.id === id),
        [matchingRoutes, id]
    );
    return route?.data as Record<string, unknown>;
}

function isUser(user:user): user is user {
    return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): user | undefined {
    const data = useMatchesData("root") as { user: user };
    if (!data || !isUser(data.user )) {
        return undefined;
    }
    return data.user;
}

