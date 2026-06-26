#!/usr/bin/env python3
"""Local static server that can write hero-teach-overrides.json in the repo root."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
OVERRIDE_PATH = os.path.join(ROOT, 'hero-teach-overrides.json')
OVERRIDE_NAME = 'hero-teach-overrides.json'
PORT = int(os.environ.get('PORT', '8080'))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        path = self.path.split('?', 1)[0].lower()
        if path.endswith(('.html', '.js', '.css', '.json', '.dae')):
            self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def do_POST(self):
        path = self.path.split('?', 1)[0].lstrip('/')
        if path != OVERRIDE_NAME:
            self.send_error(404)
            return

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        with open(OVERRIDE_PATH, 'wb') as handle:
            handle.write(body)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def log_message(self, format, *args):
        if args and args[1] == '200':
            return
        super().log_message(format, *args)


if __name__ == '__main__':
    server = ThreadingHTTPServer(('', PORT), Handler)
    print(f'Serving {ROOT} at http://localhost:{PORT}/')
    print(f'POST /{OVERRIDE_NAME} writes teach overrides in place.')
    server.serve_forever()
