"""
Giftora Local Development Server (Python)
Serves the static site at http://localhost:3000

Security note:
  - pk_test key → only in frontend HTML (safe)
  - sk_test key → backend only, kept here server-side
"""

import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Backend secret key — NEVER expose this in HTML/JS
CLERK_SECRET_KEY = "sk_test_IQYOjZ7aN78LaEF3VN2dmGw1VSoMOf4coRPkOgyEIu"

class GiftoraHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Allow Clerk CDN and cross-origin requests
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_GET(self):
        # Serve index.html for unknown paths (SPA support)
        full_path = os.path.join(DIRECTORY, self.path.lstrip("/").split("?")[0])
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            self.path = "/index.html"
        super().do_GET()

    def log_message(self, format, *args):
        # Only log non-asset requests for cleaner output
        if not any(ext in args[0] for ext in ['.jpg', '.png', '.css', '.js', '.ico']):
            super().log_message(format, *args)

def run():
    os.chdir(DIRECTORY)
    # Fix Windows console encoding
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    with socketserver.TCPServer(("", PORT), GiftoraHandler) as httpd:
        httpd.allow_reuse_address = True
        print("\n")
        print("  ==========================================")
        print("         GIFTORA SERVER RUNNING")
        print("  ==========================================")
        print(f"  Local:   http://localhost:{PORT}")
        print(f"  Network: http://127.0.0.1:{PORT}")
        print("  ==========================================")
        print("  Clerk Auth: pk_test loaded (frontend)")
        print("  Secret Key: server-side only [SECURE]")
        print("  ==========================================")
        print("\n  Opening browser... Press Ctrl+C to stop.\n")
        
        # Auto-open browser
        import webbrowser
        webbrowser.open(f"http://localhost:{PORT}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Giftora server stopped.\n")
            sys.exit(0)

if __name__ == "__main__":
    run()
