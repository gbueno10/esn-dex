#!/usr/bin/env node

/**
 * Admin Utility Script for ESN-Dex
 * 
 * This script helps you call admin endpoints for maintenance tasks.
 * 
 * Usage:
 * node admin-util.js [command] [options]
 * 
 * Commands:
 * - stats                    Get database statistics
 * - cleanup-anonymous        Remove empty anonymous users
 * - cleanup-esners          Remove empty ESNers
 * - cleanup-all             Remove all test data (DANGEROUS!)
 * - delete-user <uid>       Delete specific user
 * - user-details <uid>      Get details of specific user
 * 
 * Environment variables:
 * - ADMIN_API_KEY: Your admin API key
 * - BASE_URL: Base URL of your application (default: http://localhost:3000)
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

const command = process.argv[2];
const argument = process.argv[3];

if (!command) {
  console.log(`
🔧 ESN-Dex Admin Utility

Usage: node admin-util.js [command] [options]

Commands:
  stats                    Get database statistics
  cleanup-anonymous        Remove empty anonymous users
  cleanup-esners          Remove empty ESNers  
  cleanup-all             Remove all test data (DANGEROUS!)
  delete-user <uid>       Delete specific user
  user-details <uid>      Get details of specific user

Environment variables:
  ADMIN_API_KEY           Your admin API key
  BASE_URL                Base URL (default: http://localhost:3000)

Examples:
  node admin-util.js stats
  node admin-util.js cleanup-anonymous
  node admin-util.js user-details abc123
  node admin-util.js delete-user abc123
`);
  process.exit(0);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function executeCommand() {
  try {
    let response;
    
    switch (command) {
      case 'stats':
        console.log('📊 Getting database statistics...');
        response = await makeRequest('/api/admin/stats');
        break;
        
      case 'cleanup-anonymous':
        console.log('🧹 Cleaning up anonymous users...');
        response = await makeRequest('/api/admin/cleanup', 'POST', { action: 'cleanup_anonymous_users' });
        break;
        
      case 'cleanup-esners':
        console.log('🧹 Cleaning up empty ESNers...');
        response = await makeRequest('/api/admin/cleanup', 'POST', { action: 'cleanup_empty_esners' });
        break;
        
      case 'cleanup-all':
        console.log('⚠️  DANGER: Cleaning up ALL test data...');
        console.log('This will delete most users except preserved emails!');
        response = await makeRequest('/api/admin/cleanup', 'POST', { action: 'cleanup_all_test_data' });
        break;
        
      case 'delete-user':
        if (!argument) {
          console.error('❌ User ID is required for delete-user command');
          process.exit(1);
        }
        console.log(`🗑️ Deleting user: ${argument}`);
        response = await makeRequest('/api/admin/stats', 'POST', { action: 'delete_user', target_uid: argument });
        break;
        
      case 'user-details':
        if (!argument) {
          console.error('❌ User ID is required for user-details command');
          process.exit(1);
        }
        console.log(`👤 Getting details for user: ${argument}`);
        response = await makeRequest('/api/admin/stats', 'POST', { action: 'get_user_details', target_uid: argument });
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Success!');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      console.error(`❌ Error (${response.status}):`);
      console.error(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    process.exit(1);
  }
}

executeCommand();
