const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Secret key for JWT
const SECRET_KEY = 'your-secret-key';
const expiresIn = '1h';

// Read database from db.json
let database = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

// Set default middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Create token for authenticated user
const createToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

// Check if user exists in database
const isAuthenticated = ({ email, password }) => {
  const user = database.users.find(user => user.email === email);
  if (user) {
    // In a real scenario, use bcrypt.compareSync(password, user.password)
    return user.password === password;
  }
  return false;
};

// Generate access permissions for roles
const getAccessibleModules = (roleId) => {
  const role = database.roles.find(role => role._id === roleId);
  
  if (!role) return [];
  
  // Extract module names from permissions
  // e.g. ["Users.ViewUsers", "Users.CreateUser"] => ["Users"]
  const modules = role.permissions.map(permission => permission.split('.')[0]);
  
  // Remove duplicates
  return [...new Set(modules)];
};

// Get permissions for specific modules based on role
const getModulePermissions = (roleId, modules) => {
  const role = database.roles.find(role => role._id === roleId);
  
  if (!role) return [];
  
  // Group permissions by module
  const permissions = modules.map(moduleName => {
    const modulePermissions = role.permissions.filter(
      permission => permission.startsWith(moduleName + '.')
    );
    
    return {
      moduleName,
      allowedActions: modulePermissions
    };
  });
  
  return permissions;
};

// Login endpoint
server.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Email and password are required' 
    });
  }
  
  if (isAuthenticated({ email, password })) {
    const user = database.users.find(user => user.email === email);
    const { password: _, ...userWithoutPassword } = user;
    
    // Add role name to user object
    const role = database.roles.find(role => role._id === user.role);
    userWithoutPassword.role_name = role ? role.name : 'Unknown';
    
    const token = createToken(userWithoutPassword);
    
    return res.status(200).json({ 
      status: 'success',
      data: {
        user: userWithoutPassword,
        token: token
      }
    });
  }
  
  return res.status(401).json({ 
    status: 'error',
    message: 'Invalid email or password' 
  });
});

// Register endpoint
server.post('/api/v1/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Name, email and password are required' 
    });
  }
  
  // Check if user already exists
  if (database.users.find(user => user.email === email)) {
    return res.status(409).json({ 
      status: 'error',
      message: 'Email already exists' 
    });
  }
  
  // Assign default user role (find role with name 'User')
  const userRole = database.roles.find(role => role.name === 'User');
  const roleId = userRole ? userRole._id : database.roles[0]._id;
  
  // Create new user
  const newUser = {
    _id: Date.now().toString(),
    name,
    email,
    password, // In a real scenario, hash the password: bcrypt.hashSync(password, 10)
    role: roleId,
    is_active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add role name to user object for response
  const roleName = userRole ? userRole.name : 'Unknown';
  
  // Add user to database
  database.users.push(newUser);
  
  // Save database
  fs.writeFileSync('./db.json', JSON.stringify(database, null, 2));
  
  // Create token
  const { password: _, ...userWithoutPassword } = newUser;
  userWithoutPassword.role_name = roleName;
  
  const token = createToken(userWithoutPassword);
  
  return res.status(201).json({ 
    status: 'success',
    data: {
      user: userWithoutPassword,
      token: token
    }
  });
});

// Middleware for authentication
server.use(/^(?!\/api\/v1\/auth).*$/, (req, res, next) => {
  // Skip auth check for GET requests to public endpoints
  if (req.method === 'GET' && (
    req.path.startsWith('/home') || 
    req.path.startsWith('/about')
  )) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Authorization token required' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Invalid or expired token' 
    });
  }
});

// Get accessible modules based on user role
server.get('/api/v1/access/accessible-modules', (req, res) => {
  const userId = req.user._id;
  const user = database.users.find(user => user._id === userId);
  
  if (!user) {
    return res.status(404).json({ 
      status: 'error',
      message: 'User not found' 
    });
  }
  
  // Get accessible modules based on user role
  const modules = getAccessibleModules(user.role);
  
  return res.status(200).json({ 
    status: 'success',
    data: {
      modules: modules
    }
  });
});

// Get permissions for specific modules based on user role
server.post('/api/v1/access/accessible-components', (req, res) => {
  const userId = req.user._id;
  const { modules } = req.body;
  
  if (!modules || !Array.isArray(modules)) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Modules array is required' 
    });
  }
  
  const user = database.users.find(user => user._id === userId);
  
  if (!user) {
    return res.status(404).json({ 
      status: 'error',
      message: 'User not found' 
    });
  }
  
  // Get permissions for specific modules based on user role
  const permissions = getModulePermissions(user.role, modules);
  
  return res.status(200).json({ 
    status: 'success',
    data: {
      permissions: permissions
    }
  });
});

// Use default router
server.use(router);

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server with auth is running on port ${PORT}`);
});
