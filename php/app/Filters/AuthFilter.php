<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class AuthFilter implements FilterInterface
{
    /**
     * Check if user is authenticated
     *
     * @param RequestInterface $request
     * @param array|null $arguments
     * @return RequestInterface|ResponseInterface|string|void
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        helper('auth');

        $session = session();
        $user = $session->get('user');

        if (!$user) {
            // Check if this is an API request
            if (strpos($request->getUri()->getPath(), '/api/') === 0) {
                // Return JSON error for API requests
                return service('response')
                    ->setJSON(['ok' => false, 'message' => 'Unauthorized'])
                    ->setStatusCode(401);
            }

            // Redirect to login for web requests
            return redirect()->to('/login')->with('error', 'Please login to continue');
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
