import { createAsyncThunk } from '@reduxjs/toolkit';
import clientServer from '@/config/axios'; // Ensure this points to baseURL: http://localhost:8080

// ----------------- LOGIN -----------------
export const loginUser = createAsyncThunk(
  'auth/login',
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post('/login', {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        return thunkAPI.fulfillWithValue({
          token: response.data.token,
          user: response.data.user,
        });
      } else {
        return thunkAPI.rejectWithValue({ message: 'Token not found' });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

// ----------------- REGISTER -----------------
export const registerUser = createAsyncThunk(
  'auth/register',
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post('/register', {
        name: user.fullName,
        email: user.email,
        password: user.password,
        username: user.username,
      });

      if (response.data.message === 'User registered successfully') {
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue({
          message: response.data.message || 'Registration failed',
        });
      }
    } catch (error) {
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
      const response = await clientServer.get("user/get_all_user_profile");

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Error fetching profile");
    }
  }
);