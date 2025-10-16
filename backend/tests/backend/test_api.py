"""
API testy pro všechny endpointy
"""
import pytest
import json


class TestAuthAPI:
    """Testy pro autentizační endpointy"""
    
    def test_register_success(self, client):
        """Test úspěšné registrace"""
        response = client.post('/api/register', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'NewPass123!'
        })
        
        assert response.status_code == 200
        data = response.json
        assert data['success'] is True
        assert data['message'] == 'User registered successfully'
    
    def test_register_duplicate_email(self, client):
        """Test registrace s duplicitním emailem"""
        # První registrace
        client.post('/api/register', json={
            'username': 'user1',
            'email': 'duplicate@example.com',
            'password': 'Pass123!'
        })
        
        # Druhá registrace se stejným emailem
        response = client.post('/api/register', json={
            'username': 'user2',
            'email': 'duplicate@example.com',
            'password': 'Pass123!'
        })
        
        assert response.status_code == 409
        data = response.json
        assert data['success'] is False
        assert data['error'] == 'User exists'
    
    def test_register_missing_fields(self, client):
        """Test registrace s chybějícími poli"""
        response = client.post('/api/register', json={
            'username': 'testuser',
            # Chybí email a password
        })
        
        assert response.status_code == 400
        data = response.json
        assert data['success'] is False
        assert 'error' in data
    
    def test_login_success(self, client):
        """Test úspěšného přihlášení"""
        # Nejdřív registrace
        client.post('/api/register', json={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Test123!'
        })
        
        # Pak přihlášení
        response = client.post('/api/login', json={
            'email': 'test@example.com',
            'password': 'Test123!'
        })
        
        assert response.status_code == 200
        data = response.json
        assert data['success'] is True
        assert data['message'] == 'Login successful'
        assert 'access_token' in data
        assert 'refresh_token' in data
    
    def test_login_invalid_credentials(self, client):
        """Test přihlášení s neplatnými údaji"""
        response = client.post('/api/login', json={
            'email': 'nonexistent@example.com',
            'password': 'WrongPassword'
        })
        
        assert response.status_code == 401
        data = response.json
        assert data['success'] is False
        assert data['error'] == 'Invalid credentials'
    
    def test_me_endpoint(self, client, auth_headers):
        """Test /api/me endpointu"""
        response = client.get('/api/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert data['success'] is True
        assert data['username'] == 'testuser'
        assert data['email'] == 'test@example.com'
        assert 'id' in data
        assert 'created_at' in data
    
    def test_me_endpoint_no_auth(self, client):
        """Test /api/me bez autentizace"""
        response = client.get('/api/me')
        
        assert response.status_code == 401
        data = response.json
        assert 'msg' in data


class TestPasswordAPI:
    """Testy pro password endpointy"""
    
    def test_get_passwords_empty(self, client, auth_headers):
        """Test získání prázdného seznamu hesel"""
        response = client.get('/api/passwords', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert data == []
    
    def test_create_password_success(self, client, auth_headers):
        """Test úspěšného vytvoření hesla"""
        response = client.post('/api/passwords', 
                             headers=auth_headers,
                             json={
                                 'site': 'example.com',
                                 'username': 'testuser',
                                 'password': 'MySecretPassword123!',
                                 'note': 'Test note'
                             })
        
        assert response.status_code == 200
        data = response.json
        assert data['success'] is True
        assert data['message'] == 'Password saved'
        assert 'id' in data
    
    def test_create_password_missing_fields(self, client, auth_headers):
        """Test vytvoření hesla s chybějícími poli"""
        response = client.post('/api/passwords',
                             headers=auth_headers,
                             json={
                                 'site': 'example.com',
                                 # Chybí username a password
                             })
        
        assert response.status_code == 400
        data = response.json
        assert data['success'] is False
        assert 'error' in data
    
    def test_get_passwords_with_data(self, client, auth_headers):
        """Test získání hesel s daty"""
        # Vytvoření hesla
        client.post('/api/passwords',
                   headers=auth_headers,
                   json={
                       'site': 'example.com',
                       'username': 'testuser',
                       'password': 'MySecretPassword123!'
                   })
        
        # Získání seznamu hesel
        response = client.get('/api/passwords', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert len(data) == 1
        assert data[0]['site'] == 'example.com'
        assert data[0]['username'] == 'testuser'
        assert 'id' in data[0]
        # Heslo by nemělo být v seznamu
        assert 'password' not in data[0]
    
    def test_reveal_password(self, client, auth_headers):
        """Test zobrazení hesla"""
        # Vytvoření hesla
        create_response = client.post('/api/passwords',
                                    headers=auth_headers,
                                    json={
                                        'site': 'example.com',
                                        'username': 'testuser',
                                        'password': 'MySecretPassword123!'
                                    })
        password_id = create_response.json['id']
        
        # Zobrazení hesla
        response = client.get(f'/api/passwords/{password_id}/reveal', 
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert data['success'] is True
        assert data['password'] == 'MySecretPassword123!'
        assert data['site'] == 'example.com'
        assert data['username'] == 'testuser'
    
    def test_reveal_nonexistent_password(self, client, auth_headers):
        """Test zobrazení neexistujícího hesla"""
        response = client.get('/api/passwords/999/reveal', headers=auth_headers)
        
        assert response.status_code == 404
        data = response.json
        assert data['success'] is False
        assert data['error'] == 'Password not found'
    
    def test_update_password(self, client, auth_headers):
        """Test aktualizace hesla"""
        # Vytvoření hesla
        create_response = client.post('/api/passwords',
                                    headers=auth_headers,
                                    json={
                                        'site': 'example.com',
                                        'username': 'testuser',
                                        'password': 'OldPassword123!'
                                    })
        password_id = create_response.json['id']
        
        # Aktualizace hesla
        response = client.put(f'/api/passwords/{password_id}',
                            headers=auth_headers,
                            json={
                                'site': 'updated.com',
                                'username': 'updateduser',
                                'password': 'NewPassword123!'
                            })
        
        assert response.status_code == 200
        data = response.json
        assert data['success'] is True
        assert data['message'] == 'Password updated'
        
        # Ověření změn
        reveal_response = client.get(f'/api/passwords/{password_id}/reveal',
                                   headers=auth_headers)
        reveal_data = reveal_response.json
        assert reveal_data['site'] == 'updated.com'
        assert reveal_data['username'] == 'updateduser'
        assert reveal_data['password'] == 'NewPassword123!'
    
    def test_delete_password(self, client, auth_headers):
        """Test smazání hesla"""
        # Vytvoření hesla
        create_response = client.post('/api/passwords',
                                    headers=auth_headers,
                                    json={
                                        'site': 'example.com',
                                        'username': 'testuser',
                                        'password': 'MySecretPassword123!'
                                    })
        password_id = create_response.json['id']
        
        # Smazání hesla
        response = client.delete(f'/api/passwords/{password_id}',
                               headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert data['success'] is True
        assert data['message'] == 'Password deleted'
        
        # Ověření, že heslo bylo smazáno
        reveal_response = client.get(f'/api/passwords/{password_id}/reveal',
                                   headers=auth_headers)
        assert reveal_response.status_code == 404
    
    def test_password_unauthorized_access(self, client):
        """Test přístupu k heslům bez autentizace"""
        response = client.get('/api/passwords')
        assert response.status_code == 401
    
    def test_password_cross_user_isolation(self, client):
        """Test, že uživatelé nemohou vidět hesla jiných uživatelů"""
        # Registrace prvního uživatele
        client.post('/api/register', json={
            'username': 'user1',
            'email': 'user1@example.com',
            'password': 'Pass123!'
        })
        
        # Přihlášení prvního uživatele
        login1 = client.post('/api/login', json={
            'email': 'user1@example.com',
            'password': 'Pass123!'
        })
        token1 = login1.json['access_token']
        headers1 = {'Authorization': f'Bearer {token1}'}
        
        # Registrace druhého uživatele
        client.post('/api/register', json={
            'username': 'user2',
            'email': 'user2@example.com',
            'password': 'Pass123!'
        })
        
        # Přihlášení druhého uživatele
        login2 = client.post('/api/login', json={
            'email': 'user2@example.com',
            'password': 'Pass123!'
        })
        token2 = login2.json['access_token']
        headers2 = {'Authorization': f'Bearer {token2}'}
        
        # První uživatel vytvoří heslo
        create_response = client.post('/api/passwords',
                                    headers=headers1,
                                    json={
                                        'site': 'example.com',
                                        'username': 'user1',
                                        'password': 'User1Password'
                                    })
        password_id = create_response.json['id']
        
        # Druhý uživatel se pokusí zobrazit heslo prvního uživatele
        response = client.get(f'/api/passwords/{password_id}/reveal',
                            headers=headers2)
        
        assert response.status_code == 404  # Neměl by najít heslo


class TestCORS:
    """Testy pro CORS konfiguraci"""
    
    def test_cors_preflight_allowed_origin(self, client):
        """Test CORS preflight pro povolený origin"""
        response = client.options('/api/login',
                                headers={
                                    'Origin': 'http://localhost:3000',
                                    'Access-Control-Request-Method': 'POST',
                                    'Access-Control-Request-Headers': 'Content-Type,Authorization'
                                })
        
        assert response.status_code == 200
        assert 'Access-Control-Allow-Origin' in response.headers
        assert response.headers['Access-Control-Allow-Origin'] == 'http://localhost:3000'
    
    def test_cors_preflight_disallowed_origin(self, client):
        """Test CORS preflight pro nepovolený origin"""
        response = client.options('/api/login',
                                headers={
                                    'Origin': 'http://malicious-site.com',
                                    'Access-Control-Request-Method': 'POST',
                                    'Access-Control-Request-Headers': 'Content-Type,Authorization'
                                })
        
        assert response.status_code == 403
    
    def test_cors_actual_request_allowed_origin(self, client):
        """Test CORS pro skutečný požadavek s povoleným originem"""
        response = client.post('/api/register',
                             headers={'Origin': 'http://localhost:3000'},
                             json={
                                 'username': 'testuser',
                                 'email': 'test@example.com',
                                 'password': 'Test123!'
                             })
        
        assert response.status_code == 200
        assert 'Access-Control-Allow-Origin' in response.headers
        assert response.headers['Access-Control-Allow-Origin'] == 'http://localhost:3000'
    
    def test_cors_actual_request_disallowed_origin(self, client):
        """Test CORS pro skutečný požadavek s nepovoleným originem"""
        response = client.post('/api/register',
                             headers={'Origin': 'http://malicious-site.com'},
                             json={
                                 'username': 'testuser',
                                 'email': 'test@example.com',
                                 'password': 'Test123!'
                             })
        
        assert response.status_code == 200  # Požadavek projde
        # Ale neměly by být CORS hlavičky
        assert 'Access-Control-Allow-Origin' not in response.headers
