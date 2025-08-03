'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { getAllPosts } from '../../config/redux/action/postAction/index';
import { getUserProfile } from '../../config/redux/action/authAction/index';

const Dashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loggedIn, isLoading: authLoading, user, profile } = useSelector((state) => state.auth);
  const { posts = [], isLoading: postLoading } = useSelector((state) => state.posts);

  const [postText, setPostText] = useState('');
  const [media, setMedia] = useState(null);
  const [commentMap, setCommentMap] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Authentication check and fetch data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !loggedIn) {
      router.replace('/login');
    } else {
      dispatch(getUserProfile());
      dispatch(getAllPosts());
    }
  }, [loggedIn]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('body', postText);
      if (media) formData.append('media', media);

      await axios.post('http://localhost:8080/api/posts/post', formData);
      setPostText('');
      setMedia(null);
      dispatch(getAllPosts());
    } catch (err) {
      console.error('Post error:', err);
    }
  };

  const handleDeletePost = async (post_id) => {
    try {
      await axios.post('http://localhost:8080/api/posts/post/delete', { token, post_id });
      dispatch(getAllPosts());
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };
const handleLikePost = async (postId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const response = await axios.post('http://localhost:8080/api/posts/increment-likes', {
      token,
      post_id: postId,
    });

    console.log('Post liked:', response.data);

    // Optionally: refresh posts or update UI here
    dispatch(getAllPosts()); // agar redux use kar rahe ho
  } catch (error) {
    console.error('Like post error:', error.response?.data || error.message);
  }
};


  const handleCommentChange = (post_id, text) => {
    setCommentMap((prev) => ({ ...prev, [post_id]: text }));
  };

 const handleCommentSubmit = async (post_id) => {
  const commentText = commentMap[post_id];
  if (!commentText?.trim()) return;

  try {
    const token = localStorage.getItem('token');
    
    await axios.post('http://localhost:8080/api/posts/comment', {
      token,
      post_id,
      comment: commentText, // must be 'comment' key here
    });

    // Clear comment input for this post
    setCommentMap((prev) => ({ ...prev, [post_id]: '' }));

    // Refresh posts so new comment shows
    dispatch(getAllPosts());
  } catch (err) {
    console.error('Comment error:', err.response?.data || err.message);
  }
};

  const handleDeleteComment = async (comment_id) => {
    try {
      await axios.post('http://localhost:8080/api/posts/delete_comment', { token, comment_id });
      dispatch(getAllPosts());
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (authLoading || !isClient) return <p>Loading...</p>;

  return (
    <>
      <Head>
        <title>Dashboard || LinkedIn Mini</title>
      </Head>

      <header style={styles.header}>
        <h2>LinkedIn Mini</h2>
        <div style={{ position: 'relative' }}>
          <img
            src={`http://localhost:8080/uploads/${user?.profilePicture || 'default.png'}`}
            alt="User"
            style={styles.avatar}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div style={styles.dropdown}>
              <p style={styles.dropdownItem} onClick={() => router.push('/dashboard/user/profile')}>View Profile</p>
              <p style={styles.dropdownItem} onClick={handleLogout}>Logout</p>
            </div>
          )}
        </div>
      </header>

      <main style={styles.container}>
        <aside style={styles.sidebar}>
          <h3>👤 Profile</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Bio:</strong> {profile?.bio || 'N/A'}</p>
          <p><strong>Post:</strong> {profile?.currentPost || 'N/A'}</p>
        </aside>

        <section style={styles.feed}>
          <form onSubmit={handleCreatePost} style={styles.postForm} encType="multipart/form-data">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              style={styles.textarea}
            />
            <input type="file" onChange={(e) => setMedia(e.target.files[0])} />
            <button type="submit" style={styles.button}>Post</button>
          </form>

          <h3>📢 Feed</h3>
          {postLoading ? (
            <p>Loading posts...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} style={styles.postCard}>
                <p>
                  <strong>{post.userId?.name || 'Anonymous'}</strong> – {' '}
                  <a href="/dashboard/user/profile" style={{ color: '#0073b1' }}>View Profile</a>

                </p>
                <p>{post.body}</p>
                {post.media && post.fileType === 'image' && (
                  <img src={`http://localhost:8080/uploads/${post.media}`} style={{ maxWidth: '100%', borderRadius: 10 }} alt="media" />
                )}
                {post.media && post.fileType === 'video' && (
                  <video controls width="100%">
                    <source src={`http://localhost:8080/uploads/${post.media}`} type="video/mp4" />
                  </video>
                )}
                <small>🕒 {new Date(post.createdAt).toLocaleString()}</small>
                <p>👍 Likes: {post.like || 0}</p>
                <button onClick={() => handleLikePost(post._id)} style={styles.button}>Like</button>
                {post.userId?._id === user?.id && (
                  <button onClick={() => handleDeletePost(post._id)} style={styles.deleteButton}>🗑 Delete</button>
                )}

                <div style={{ marginTop: 10 }}>
                  <textarea
                    value={commentMap[post._id] || ''}
                    onChange={(e) => handleCommentChange(post._id, e.target.value)}
                    placeholder="Write a comment"
                    rows={2}
                    style={styles.textarea}
                  />
                  <button onClick={() => handleCommentSubmit(post._id)} style={styles.button}>Comment</button>

                  {post.comments?.map(comment => (
                    <div key={comment._id} style={{ marginTop: 5, paddingLeft: 10 }}>
                      <p>{comment.body} – <small>{comment.userId?.name}</small></p>
                      {comment.userId?._id === user?.id && (
                        <button onClick={() => handleDeleteComment(comment._id)} style={styles.deleteButtonSmall}>Delete</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No posts yet.</p>
          )}
        </section>
      </main>
    </>
  );
};

export default Dashboard;

const styles = {
  header: {
    backgroundColor: '#0073b1', color: '#fff', padding: '15px 30px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  avatar: {
    width: '45px', height: '45px', borderRadius: '50%',
    objectFit: 'cover', cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute', top: '60px', right: 0, background: '#fff',
    border: '1px solid #ccc', borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 10,
  },
  dropdownItem: {
    padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #eee',
  },
  container: { display: 'flex', padding: '20px', gap: '30px' },
  sidebar: {
    width: '25%', border: '1px solid #ccc', padding: '15px',
    borderRadius: '10px', background: '#f9f9f9',
  },
  feed: { flex: 1 },
  postForm: {
    marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px',
  },
  textarea: {
    padding: '10px', fontSize: '1rem', borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px', background: '#0073b1', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  deleteButton: {
    marginTop: '10px', padding: '6px 12px', backgroundColor: '#dc3545',
    color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  deleteButtonSmall: {
    marginTop: '5px', padding: '4px 8px', backgroundColor: '#dc3545',
    color: '#fff', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '0.8rem',
  },
  postCard: {
    border: '1px solid #ddd', padding: '15px', borderRadius: '10px',
    marginBottom: '15px', background: '#fff',
  },
};
