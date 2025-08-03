import { createSlice } from '@reduxjs/toolkit';
import { getAllPosts } from '../../action/postAction';

const initialState = {
  posts: [],
  isLoading: false,
  isError: false,
  postFetched: false,
  loggedIn: false,
  message: '',
  comment: '',
  postId: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload;
    },
    setComment: (state, action) => {
      state.comment = action.payload;
    },
    setPostId: (state, action) => {
      state.postId = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    resetPostFetched: (state) => {
      state.postFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
     .addCase(getAllPosts.fulfilled, (state, action) => {
  state.isLoading = false;
  state.posts = action.payload; // ✅ array of posts
  state.postFetched = true;
  state.isError = false;
})

      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Something went wrong';
      });
  },
});

export const {
  setLoggedIn,
  setComment,
  setPostId,
  setMessage,
  resetPostFetched,
} = postsSlice.actions;

export default postsSlice.reducer;


