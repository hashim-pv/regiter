import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [userData, setUserData] = useState({ name: '', lastName: '', email: '', password: '', phoneNumber: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signup', userData);
      setMessage(response.data.message);
      setUserData({ name: '', lastName: '', email: '', password: '', phoneNumber: '' });
      fetchUsers(); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Signup failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', loginData);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setMessage('Login successful');
      setLoginData({ email: '', password: '' });
      fetchUsers(); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const fetchUsers = async () => {
    if (!token) {
      setMessage('No token found, please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data); 
      setUsers(response.data);
      setMessage('');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('Session expired. Please log in again.');
        setToken('');
        localStorage.removeItem('token');
      } else {
        setMessage(error.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  return (
    <div className="App" style={styles.container}>
      <h2 style={styles.header}>User Registration</h2>
      <form onSubmit={handleSignup} style={styles.form}>
        <input
          type="text"
          placeholder="First Name"
          value={userData.name}
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={userData.lastName}
          onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={userData.password}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={userData.phoneNumber}
          onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Sign Up</button>
      </form>

      <h2 style={styles.header}>User Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>

      <h2 style={styles.header}>Users</h2>
      <button onClick={fetchUsers} disabled={!token || loading} style={styles.button}>
        {loading ? 'Fetching...' : 'Fetch Users'}
      </button>

      {users.length > 0 ? (
        <div style={styles.cardContainer}>
          {users.map((user) => (
            <div key={user._id} style={styles.card}>
              <h3 style={styles.cardTitle}>{user.name} {user.lastName}</h3>
              <p style={styles.cardText}>Email: {user.email}</p>
              <p style={styles.cardText}>Phone: {user.phoneNumber}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No users to display</p>
      )}

      {message && <p style={styles.message}>{message}</p>}

      <button
        onClick={() => {
          setToken('');
          localStorage.removeItem('token');
          setMessage('Logged out');
          setUsers([]);
        }}
        style={styles.button}
      >
        Logout
      </button>
    </div>
  );
}

const styles = {

  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    backgroundColor: 'cyan',
    borderRadius: '8px',
  },
  header: {
    color: 'red',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'green',
    color: 'yellow',
    cursor: 'pointer',
    marginTop: '10px',
  },
  cardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '250px',
    margin: '10px',
    textAlign: 'left',
  },
  cardTitle: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  cardText: {
    fontSize: '14px',
    marginBottom: '8px',
  },
};

export default App;
