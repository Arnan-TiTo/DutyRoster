# IIS Setup Guide for Next.js

This guide explains how to deploy your Next.js application on Windows IIS using a Reverse Proxy setup with PM2.

## Prerequisites

1.  **Node.js**: Ensure Node.js (v18+) is installed on the server.
2.  **IIS Modules**: Install the following modules via [Web Platform Installer](https://www.microsoft.com/web/downloads/platform.aspx) or manual download:
    *   **URL Rewrite** (Required to proxy requests)
    *   **Application Request Routing (ARR)** (Required to enable proxy functionality)
3.  **PM2**: Process manager to keep Next.js running.
    ```powershell
    npm install -g pm2
    ```

## Step 1: Prepare the Application

1.  Build the application:
    ```powershell
    npm install
    npx prisma generate
    npm run build
    ```

2.  Start the application using PM2 (for persistence):
    ```powershell
    pm2 start ecosystem.config.cjs
    pm2 save
    # Install PM2 Windows Startup utility
    npm install -g pm2-windows-startup
    # Install the startup service
    pm2-startup install
    ```
    *This ensures your app runs at `http://localhost:3000` and restarts automatically if the server reboots.*


## Step 2: Configure IIS

1.  **Enable Proxy in ARR:**
    *   Open **IIS Manager**.
    *   Click on the Server node (root).
    *   Open **Application Request Routing Cache**.
    *   Click **Server Proxy Settings...** in the right pane.
    *   Check **Enable proxy**.
    *   Click **Apply**.

2.  **Create Website:**
    *   Right-click **Sites** -> **Add Website**.
    *   **Site name**: `DutyRoster` (or your preferred name).
    *   **Physical path**: Point to the folder containing your Next.js code (where `web.config` is located).
    *   **Binding**: Set your desired port (e.g., 80 or 8080) or Hostname.

3.  **Verify `web.config`:**
    *   Ensure the `web.config` file created in your project root is present. It tells IIS to forward all requests to `http://localhost:3000`.

## Troubleshooting

-   **HTTP 502.3 Bad Gateway**: Usually means the Next.js app (Node.js) is not running on port 3000. Check via `pm2 status` or `curl localhost:3000`.
-   **Command not found (pm2 / pm2-startup)**: If you see this error, your npm folder is not in your system PATH.
    *   Try running with the full path: `& "C:\Users\%USERNAME%\AppData\Roaming\npm\pm2.cmd" ...`
    *   Or add `%APPDATA%\npm` to your User Environment Variables PATH.
-   **Static Files 404**: Next.js handles static files correctly through the proxy locally. If issues persist, ensure `_next` paths are not being blocked by other IIS rules.
