import {useAuthStore} from "@/store/auth";

export function usePermission() {
    const {user} = useAuthStore()

    const roles = user?.roles || [];
    const permissions = user?.permissions || [];

    const hasPermission = (permission) => {
        return permissions.includes(permission) || roles.includes("SUPER_ADMIN");
    };

    const hasAnyPermission = (perms = []) => {
        return perms.some(p => permissions.includes(p)) || roles.includes("SUPER_ADMIN");
    };

    const hasRole = (role) => {
        return roles.includes(role) || roles.includes("SUPER_ADMIN");
    };

    const isAdmin = () => {
        return roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasRole,
        isAdmin
    };
}
