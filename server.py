import http.server
import sys
import os

PORT = 8000

class StaticWebHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Support CORS just in case
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
            
    print(f"Starting Static Server on port {port}...")
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, StaticWebHandler)
    print(f"Server running at http://localhost:{port}/")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()
        sys.exit(0)
