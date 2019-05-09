from flask import Flask
from flask_socketio import SocketIO, emit
import redis
import threading

app = Flask(__name__, static_folder='./client/build/static')
app.config['SECRET_KEY'] = 'development key'
socket = SocketIO(app)

def monitor():
    r = redis.Redis()

    channels = ['message_list', 'message_list_2']
    p = r.pubsub()
    p.subscribe(channels)

    print 'monitoring channels', channels

    while 1:
        m = p.get_message()
        if m:
            print m
            socket.emit('key_status', {'channel': m['channel'], 'status': m['data']}, broadcast=True)
            
@app.route('/')
def serve_static_index():
    return send_from_directory('./client/build/', 'index.html')

@socket.on('connect')
def on_connect():
    print('user connected')
    emit('key_status', {'status': 'INIT'}, broadcast=True)
    
if __name__ == "__main__":
    socket.start_background_task(monitor)
    socket.run(app, host = "0.0.0.0", port = 8080, debug = True)
    
