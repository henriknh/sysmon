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
			if hw == 'net':
				net = {}
				net['bytes_sent'] = psutil.net_io_counters().bytes_sent
				net['bytes_recv'] = psutil.net_io_counters().bytes_recv
				net['packets_sent'] = psutil.net_io_counters().packets_sent
				net['packets_recv'] = psutil.net_io_counters().packets_recv
				resp_data['net'] = net
			if hw == 'uptime':
				resp_data['uptime'] = time() - psutil.boot_time()
			if hw == 'user':
				resp_data['user'] = psutil.users()[0].name
			if hw == 'ip':
				resp_data['ipv6'] = psutil.net_if_addrs()['Ethernet'][0].address
				resp_data['ipv4'] = psutil.net_if_addrs()['Ethernet'][1].address
			if hw == 'os':
				resp_data['os'] = [platform.platform(), platform.version()]
			if hw == 'name':
				resp_data['name'] = platform.uname()[1]

		print resp_data

	return jsonify(results=resp_data)

port = 56568
app.run(debug=False, port=int(port))