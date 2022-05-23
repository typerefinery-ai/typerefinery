# allow importing og service local packages
import os
import sys
where_am_i = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, where_am_i+"/__packages__")
# end of local package imports

from simple_websocket_server import WebSocketServer, WebSocket

class SimpleEcho(WebSocket):
    def handle(self):
        # echo message back to client
        self.send_message(self.data)

    def connected(self):
        print(self.address, 'connected')

    def handle_close(self):
        print(self.address, 'closed')

def app():
    server = WebSocketServer('', 8080, SimpleEcho)
    server.serve_forever()

if __name__ == "__main__":
    sys.exit(app())

