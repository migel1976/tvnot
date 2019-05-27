from flask import Flask
from flask_socketio import SocketIO, emit
import threading, time

app = Flask(__name__, static_folder='./client/build/static')
app.config['SECRET_KEY'] = 'development key'
socket = SocketIO(app)

def monitor():
    #topics = []{'topic: '/a', 'message': "Hello{c}"), ("/a/b", "Hello2{c}"), ("/b", "By"), ("/b/b", "By2")]
    c = 0
    while 1:
        #topics = [(f[0], f[1].format(c = c)) for f in topics_fmt]
        topics = []
        topics.append({'topic': '/a', 'message': {'text': "Hello{c}".format(c = c), 'bg': 'lightgreen'},
                       'status': {'text': 'OK', 'bg': 'white'}})
        topics.append({'topic': '/a/b', 'message': {'text': "Hello2{c}".format(c = c), 'bg': 'white'}, 'status': {'text': 'OK', 'bg': ''}})
        topics.append({'topic': '/b', 'message': {'text': "By".format(c = c), 'bg': ''}, 'status': {'text': 'OK', 'bg': ''}})
        topics.append({'topic': '/b/b', 'message': {'text': "By2".format(c = c), 'bg': 'red'}, 'status': {'text': 'FAIL', 'bg': 'orange'}})
        #print topics
        socket.emit('topics', topics, broadcast=True)
        time.sleep(3)
        c += 1
            
@app.route('/')
def serve_static_index():
    return send_from_directory('./client/build/', 'index.html')

@socket.on('connect')
def on_connect():
    print('user connected')    
    #emit('topics', {'/status': 'INIT'}, broadcast=True)
    
if __name__ == "__main__":
    socket.start_background_task(monitor)
    socket.run(app, host = "0.0.0.0", port = 8080, debug = True)
