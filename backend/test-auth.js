#!/usr/bin/env node

/**
 * Test script to verify authentication functionality
 * Run this script to test the login and auth/me endpoints
 */

const axios = require('axios');

const BACKEND_URL = 'https://ads-agency-portal.onrender.com';
const TEST_EMAIL = 'kaushalpthummar@gmail.com';
const TEST_PASSWORD = 'admin123';

async function testAuth() {
    console.log('🧪 Testing Authentication System...\n');

    try {
        // Test 1: Login
        console.log('1. Testing Login...');
        const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        }, {
            withCredentials: true
        });

        console.log('✅ Login successful!');
        console.log('   User:', loginResponse.data.user.name);
        console.log('   Role:', loginResponse.data.user.role);
        console.log('   Token present:', !!loginResponse.data.token);

        // Test 2: Auth Me
        console.log('\n2. Testing Auth Me...');
        const authMeResponse = await axios.get(`${BACKEND_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${loginResponse.data.token}`
            },
            withCredentials: true
        });

        console.log('✅ Auth Me successful!');
        console.log('   User:', authMeResponse.data.user.name);
        console.log('   Token refreshed:', !!authMeResponse.data.token);

        // Test 3: Logout
        console.log('\n3. Testing Logout...');
        const logoutResponse = await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
            headers: {
                'Authorization': `Bearer ${loginResponse.data.token}`
            },
            withCredentials: true
        });
        console.log('✅ Logout successful!');

        // Test 4: Auth Me after logout (should fail)
        console.log('\n4. Testing Auth Me after logout (should fail)...');
        try {
            await axios.get(`${BACKEND_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${loginResponse.data.token}`
                },
                withCredentials: true
            });
            console.log('❌ Auth Me should have failed after logout!');
        } catch (err) {
            if (err.response?.status === 401) {
                console.log('✅ Auth Me correctly failed after logout (401 Unauthorized)');
            } else {
                console.log('❌ Unexpected error:', err.message);
            }
        }

        console.log('\n🎉 All authentication tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

// Run the test
testAuth();