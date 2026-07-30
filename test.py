import requests
response = requests.post('http://localhost:8001/api/v1/vision/analyze', files={'image': b'fakeimagebytes'})
print(response.status_code)
print(response.text)
