// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the stock-analysis database
db = db.getSiblingDB('stock-analysis');

// Create a user for the application
db.createUser({
  user: 'stockapp',
  pwd: 'stockapp123',
  roles: [
    {
      role: 'readWrite',
      db: 'stock-analysis'
    }
  ]
});

// Create initial collections with some basic structure
db.createCollection('users');
db.createCollection('portfolios');
db.createCollection('useranalysts');
db.createCollection('reports');

print('Database initialization completed successfully!');
