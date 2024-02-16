import json
import re
from flask import Flask, render_template, request, redirect
import config

# SERVER_CONFIG_FILE = "test-server.config.json"

class TestResources:
    def __init__(self) -> None:

        # with open(SERVER_CONFIG_FILE) as f:
            # self.config = json.load(f)

        self.api_root = config.API_ROOT

        with open(config.HTTP_ARCHIVE) as f:
            self.data = json.load(f)

        print(self.data.keys())

        self.resources = {}

        for entry in self.data['log']['entries']:
            path = entry['request']['url'].removeprefix(self.api_root)
            text = entry['response']['content']['text']

            self.resources[path] = text


    def getResource(self, path):
        print(path)
        return self.resources[path]

resources = TestResources()
# patient_id = resources.config['patientId']


app = Flask(__name__)



@app.route('/')
def index():
    return f'<html><head><script type="text/javascript">history.pushState(null, null, "#/patients/{config.PATIENT_ID}");</script></head><body>Patient Id {config.PATIENT_ID}</body></html>'


@app.route('/api/', defaults={'path': ''})
@app.route('/api/<path:path>')
def get_dir(path):
    resource_path = f'{request.path}?{request.query_string.decode()}'.removeprefix("/api")
    
    return resources.getResource(resource_path)

if __name__ == '__main__':
    app.run(debug=True)