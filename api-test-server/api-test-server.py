import json
import re
from flask import Flask, request, send_file
import config


class TestResources:
    def __init__(self) -> None:
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

app = Flask(__name__)


@app.route('/')
def index():
    return send_file(config.INDEX_HTML)


@app.route('/api/', defaults={'path': ''})
@app.route('/api/<path:path>')
def get_dir(path):
    resource_path = f'{request.path}?{request.query_string.decode()}'.removeprefix("/api")
    
    return resources.getResource(resource_path)


if __name__ == '__main__':
    app.run(debug=True)