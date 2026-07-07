import requests

base = 'http://127.0.0.1:8000'
login = requests.post(base + '/api/login', json={'email':'demo@cropwise.com','password':'demo123'})
token = login.json()['access_token']
questions = [
    'Why was Rice recommended?',
    'Can I grow Cotton instead?',
    'How much fertilizer should I use?',
    'What pests should I watch for?'
]

for question in questions:
    response = requests.post(
        base + '/api/ai/chat',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'message': question,
            'prediction': {
                'predicted_crop': 'Rice',
                'confidence': 91,
                'season': 'Kharif',
                'farm_location': 'Tamil Nadu',
                'soil_type': 'Loamy',
                'n': 50,
                'p': 40,
                'k': 45,
                'temperature': 28,
                'humidity': 70,
                'rainfall': 110,
                'water_availability': 'Adequate',
                'ph': 6.8
            },
            'history': []
        }
    )
    print('QUESTION:', question)
    print(response.json()['response'])
    print('---')
