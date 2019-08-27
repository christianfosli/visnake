import pytest

import app

@pytest.fixture
def client():
    app.app.config['TESTING'] = True
    app_client = app.app.test_client()
    yield app_client

def test_index_exists_and_includes_title(client):
    res = client.get('/')
    assert b'Vi Snake' in res.data
