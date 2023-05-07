import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver

class CustomRequestHandler(BaseHTTPRequestHandler):

    def _send_response(self, status_code, content):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(content.encode('utf-8'))

    def do_OPTIONS(self):
        self._send_response(200, '')

    def do_POST(self):
        if self.path == '/submit_annotations':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)

            # Process the submitted annotations
            print('Link:', data['link'])
            print('Text boxes:', data['textBoxes'])
            print('Search queries:', data['searchQueries'])

            response = {'message': 'Annotations received successfully'}
            self._send_response(200, json.dumps(response))
        else:
            self._send_response(404, json.dumps({'error': 'Not found'}))

def run(server_class=HTTPServer, handler_class=CustomRequestHandler, port=8877):
    server_address = ("arkham.cs.umass.edu", port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run()