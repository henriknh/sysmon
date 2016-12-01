import psutil
import platform
import os
from time import time
from flask import Flask, request, jsonify, render_template
app = Flask(__name__)

if hasattr(os, 'statvfs'):  # POSIX
	def disk_usage(path):
		st = os.statvfs(path)
		free = st.f_bavail * st.f_frsize
		total = st.f_blocks * st.f_frsize
		used = (st.f_blocks - st.f_bfree) * st.f_frsize
		return used/total*100 #[total, used, free]

elif os.name == 'nt':       # Windows
    import ctypes
    import sys

    def disk_usage(path):
        _, total, free, used = ctypes.c_ulonglong(), ctypes.c_ulonglong(), \
                           ctypes.c_ulonglong(), ctypes.c_ulonglong()
        if sys.version_info >= (3,) or isinstance(path, unicode):
            fun = ctypes.windll.kernel32.GetDiskFreeSpaceExW
        else:
            fun = ctypes.windll.kernel32.GetDiskFreeSpaceExA
        ret = fun(path, ctypes.byref(_), ctypes.byref(total), ctypes.byref(free))
        if ret == 0:
            raise ctypes.WinError()
        used = total.value - free.value
        return float(used)/float(total.value)*100 #[total.value, used, free.value]
else:
    raise NotImplementedError("platform not supported")

disk_usage.__doc__ = __doc__

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
						hdd[disk.mountpoint] = "{0:.1f}".format(disk_usage(disk.mountpoint))
					except OSError:
						pass
					i += 1
				resp_data['hdd'] = hdd
			if hw == 'uptime':
				resp_data['uptime'] = time() - psutil.boot_time()

		print (resp_data)

	return jsonify(results=resp_data)

port = 56568
app.run(host='0.0.0.0', debug=False, port=int(port))
