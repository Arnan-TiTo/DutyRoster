<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class RBACFilter implements FilterInterface
{
    /**
     * Check role-based access
     *
     * @param RequestInterface $request
     * @param array|null $arguments - Array of allowed roles
     * @return RequestInterface|ResponseInterface|string|void
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        helper('auth');

        // If no arguments provided, just check authentication
        if (empty($arguments)) {
            return;
        }

        $user = current_user();

        if (!$user) {
            if (strpos($request->getUri()->getPath(), '/api/') === 0) {
                return service('response')
                    ->setJSON(['ok' => false, 'message' => 'Unauthorized'])
                    ->setStatusCode(401);
            }
            return redirect()->to('/login');
        }

        // Check if user has any of the required roles
        $userRoles = $user['roles'] ?? [];
        $hasAccess = false;

        foreach ($arguments as $role) {
            if (in_array($role, $userRoles)) {
                $hasAccess = true;
                break;
            }
        }

        if (!$hasAccess) {
            if (strpos($request->getUri()->getPath(), '/api/') === 0) {
                return service('response')
                    ->setJSON(['ok' => false, 'message' => 'Forbidden: Insufficient permissions'])
                    ->setStatusCode(403);
            }
            return redirect()->back()->with('error', 'Access denied');
        }
    }

    /**
     * After filter (no-op)
     *
     * @param RequestInterface $request
     * @param ResponseInterface $response
     * @param array|null $arguments
     * @return ResponseInterface|void
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // No action needed
    }
}
