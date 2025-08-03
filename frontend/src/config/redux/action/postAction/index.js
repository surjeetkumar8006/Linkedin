import { createAsyncThunk } from '@reduxjs/toolkit';
import clientServer from '../../../axios.js'; // your axios config

export const getAllPosts = createAsyncThunk(
  'posts/getAllPosts',
  async (_, thunkAPI) => {
    try {
      // Since baseURL is '/api', to get 'http://localhost:8080/api/posts/posts',
      // you need to request '/posts/posts'
      const response = await clientServer.get('/posts');

      // Return only posts array
      return thunkAPI.fulfillWithValue(response.data.posts);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch posts');
    }
  }
);
