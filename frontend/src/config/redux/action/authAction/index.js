import { createAsyncThunk } from '@reduxjs/toolkit';
import clientServer from '../../../axios.js'; // Correct import for axios

// ----------------- LOGIN -----------------
export const loginUser = createAsyncThunk(
  '/login',
  async (user, thunkAPI) => {
    try {
      console.log("Sending login data", { email: user.email, password: user.password });

      const response = await clientServer.post('/api/users/login', {
        email: user.email,
        password: user.password,
      });

      console.log("Login response:", response);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log("Token saved to localStorage:", localStorage.getItem('token'));
        
        // Returning both token and user data
        return thunkAPI.fulfillWithValue({
          token: response.data.token,
          user: response.data.user, // Assuming the user data is in response.data.user
        });
      } else {
        return thunkAPI.rejectWithValue({ message: 'Token not found' });
      }
    } catch (error) {
      console.log("Error in login:", error.response ? error.response.data : error.message);
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

// ----------------- REGISTER -----------------
export const registerUser = createAsyncThunk(
  '/register',
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post('/api/users/register', {
        name: user.fullName,
        email: user.email,
        password: user.password,
        username: user.username,
      });

      if (response.data && response.data.success) {
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue({
          message: response.data.message || 'Registration failed. Please try again.',
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        return thunkAPI.rejectWithValue({
          message: 'Email or Username already exists. Please choose another one.',
        });
      }
      return thunkAPI.rejectWithValue({
        message: error.response?.data.message || 'Something went wrong during registration.',
      });
    }
  }
);



export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return thunkAPI.rejectWithValue('Token is missing');
      }

      // Pass token as a query parameter
      const response = await clientServer.get("/api/user/get_all_user_profile");

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Error fetching profile");
    }
  }
);
