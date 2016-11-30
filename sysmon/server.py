import psutil
import platform
from time import time
from flask import Flask, request, jsonify, render_template
app = Flask(__name__)

@app.route('/')
def root():
	return render_template('index.html')

@app.route('/api', methods=['POST'])
def api():

	json = request.json

	if ('method' and 'data') not in json:
			return 'bad input'

	method 	= json['method']
	data 	= json['data']

	if method == 'getData':
		resp_data = {}
		for hw in data:
			if hw == 'cpu':
				resp_data['cpu'] = psutil.cpu_percent()
			if hw == 'ram':
				resp_data['ram'] = psutil.virtual_memory().percent
			if hw == 'hdd':
				i = 1
				hdd = {}
				for disk in psutil.disk_partitions():
					try:
						hdd[disk.device] = psutil.disk_usage(disk.device).percent
					except OSError:
						pass
					i += 1
				resp_data['hdd'] = hdd
			if hw == 'uptime':
				resp_data['uptime'] = time() - psutil.boot_time()

		print resp_data

	return jsonify(results=resp_data)

port = 56568
app.run(host='0.0.0.0', debug=False, port=int(port))