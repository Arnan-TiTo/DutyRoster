<?php

if (!function_exists('current_user')) {
    /**
     * Get current authenticated user from session
     *
     * @return array|null
     */
    function current_user(): ?array
    {
        $session = session();
        return $session->get('user');
    }
}

if (!function_exists('current_user_id')) {
    /**
     * Get current user ID
     *
     * @return string|null
     */
    function current_user_id(): ?string
    {
        $user = current_user();
        return $user['user_id'] ?? null;
    }
}

if (!function_exists('is_authenticated')) {
    /**
     * Check if user is authenticated
     *
     * @return bool
     */
    function is_authenticated(): bool
    {
        return current_user() !== null;
    }
}

if (!function_exists('is_admin')) {
    /**
     * Check if current user is admin
     *
     * @return bool
     */
    function is_admin(): bool
    {
        $user = current_user();
        return in_array('ADMIN', $user['roles'] ?? []);
    }
}

if (!function_exists('is_supervisor')) {
    /**
     * Check if current user is supervisor
     *
     * @return bool
     */
    function is_supervisor(): bool
    {
        $user = current_user();
        return in_array('SUPERVISOR', $user['roles'] ?? []);
    }
}

if (!function_exists('is_staff')) {
    /**
     * Check if current user is staff
     *
     * @return bool
     */
    function is_staff(): bool
    {
        $user = current_user();
        return in_array('STAFF', $user['roles'] ?? []);
    }
}

if (!function_exists('has_role')) {
    /**
     * Check if user has specific role
     *
     * @param string|array $roles
     * @return bool
     */
    function has_role($roles): bool
    {
        $user = current_user();
        $userRoles = $user['roles'] ?? [];

        if (is_string($roles)) {
            $roles = [$roles];
        }

        foreach ($roles as $role) {
            if (in_array($role, $userRoles)) {
                return true;
            }
        }

        return false;
    }
}

if (!function_exists('require_role')) {
    /**
     * Require specific role or throw exception
     *
     * @param string|array $roles
     * @throws \Exception
     */
    function require_role($roles): void
    {
        if (!has_role($roles)) {
            throw new \Exception('Forbidden: Insufficient permissions', 403);
        }
    }
}

if (!function_exists('require_auth')) {
    /**
     * Require authentication or throw exception
     *
     * @throws \Exception
     */
    function require_auth(): void
    {
        if (!is_authenticated()) {
            throw new \Exception('Unauthorized', 401);
        }
    }
}
