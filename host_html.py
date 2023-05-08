import http.server
import socketserver

# Define the handler to use for incoming requests.
handler = http.server.SimpleHTTPRequestHandler

# Set the port and create the server.
port = 8999

# Use ThreadingMixIn to handle multiple requests concurrently.
class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

httpd = ThreadedHTTPServer(("arkham.cs.umass.edu", port), handler)

print(f"Serving on port {port}")

# Serve the files indefinitely.
httpd.serve_forever()

# Close the server when user interrupts with Ctrl-C.
try:
    while True:
        continue
except KeyboardInterrupt:
    httpd.server_close()