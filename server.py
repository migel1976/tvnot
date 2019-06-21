from flask import Flask
from flask_socketio import SocketIO, emit
import threading, time

app = Flask(__name__, static_folder='./client/build/static')
app.config['SECRET_KEY'] = 'development key'
socket = SocketIO(app)

def monitor():
    c = 0
    while 1:
        #topics = [(f[0], f[1].format(c = c)) for f in topics_fmt]
        topics = []
        topics.append({'topic': '/a', 'message': "Hello{c}".format(c = c), 'status': 'OK'})
        topics.append({'topic': '/a/b', 'message': "Hello2{c}".format(c = c), 'status': 'OK'})
        topics.append({'topic': '/a/c', 'message': "Hello2{c}".format(c = c), 'status': 'OK'})
        topics.append({'topic': '/a/c/cc', 'message': "Hello2{c}".format(c = c), 'status': 'OK'})
        topics.append({'topic': '/b', 'message': "By".format(c = c), 'status': 'OK'})
        topics.append({'topic': '/b/b', 'message': "By2".format(c = c), 'status': 'FAIL'})
        topics.append({'topic': '/b/A', 'message': "By22".format(c = c), 'status': 'FAIL'})
        topics.append({'topic': '/b/A/b', 'message': "By22".format(c = c), 'status': 'FAIL'})
        #print topics
        socket.emit('topics', topics, broadcast=True)
        time.sleep(3)
        c += 1
            
@socket.on('connect')
def on_connect():
    print('user connected')    
    #emit('topics', {'/status': 'INIT'}, broadcast=True)
    
if __name__ == "__main__":
    socket.start_background_task(monitor)
    socket.run(app, host = "0.0.0.0", port = 8080, debug = True)
