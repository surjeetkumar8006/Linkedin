'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // updated for app router
import Head from 'next/head';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const UserProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [currentPost, setCurrentPost] = useState('');
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${API_BASE}/api/users/get_user_and_profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
        setProfile(data.profile);
        setBio(data.profile?.bio || '');
        setCurrentPost(data.profile?.currentPost || '');

        if (data.user?.profilePicture) {
          setProfilePicPreview(`${API_BASE}/uploads/${data.user.profilePicture}`);
        }
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE}/api/users/update_profile_data`, 
        { bio, currentPost }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Profile updated');
      // Refresh profile
      const { data } = await axios.get(`${API_BASE}/api/users/get_user_and_profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
      setProfile(data.profile);
      setBio(data.profile?.bio || '');
      setCurrentPost(data.profile?.currentPost || '');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('❌ Failed to update');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      await axios.post(`${API_BASE}/api/users/upload_profile_picture`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Profile picture uploaded');
      // refresh profile pic
      const { data } = await axios.get(`${API_BASE}/api/users/get_user_and_profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.user?.profilePicture) {
        setProfilePicPreview(`${API_BASE}/uploads/${data.user.profilePicture}`);
      }
    } catch (err) {
      alert('❌ Upload failed');
      console.error(err);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await axios.post(`${API_BASE}/api/users/upload_resume`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setResumeFileName(file.name);
      alert('✅ Resume uploaded');
    } catch (err) {
      alert('❌ Resume upload failed');
      console.error(err);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <Head><title>User Profile</title></Head>
      <div style={styles.container}>
        <h2>👤 Profile Dashboard</h2>

        <div style={styles.profileBox}>
          {profilePicPreview && (
            <img src={profilePicPreview} alt="Profile" style={styles.profileImage} />
          )}
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Username:</strong> {user?.username}</p>
        </div>

        <form onSubmit={handleUpdate} style={styles.form}>
          <h3>📝 Edit Profile</h3>
          <label>Bio:</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={styles.textarea} />

          <label>Current Post:</label>
          <input value={currentPost} onChange={(e) => setCurrentPost(e.target.value)} style={styles.input} />

          <button type="submit" style={styles.button}>Update Profile</button>
        </form>

        <div style={styles.uploadBox}>
          <h3>📸 Upload Profile Picture</h3>
          <input type="file" accept="image/*" onChange={handleProfilePictureUpload} />
        </div>

        <div style={styles.uploadBox}>
          <h3>📎 Upload Resume (PDF)</h3>
          <input type="file" accept="application/pdf" onChange={handleResumeUpload} />
          {resumeFileName && <p>✅ {resumeFileName} uploaded</p>}
        </div>

        <div style={styles.downloadBox}>
          <a
            href={`${API_BASE}/api/users/user/download_resume?id=${user?._id}`}
            target="_blank"
            rel="noreferrer"
          >
            📥 Download Resume (PDF)
          </a>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;

const styles = {
  container: {
    padding: '30px',
    maxWidth: '700px',
    margin: 'auto',
    fontFamily: 'Arial',
    background: '#f4f6f9',
    borderRadius: '12px',
  },
  profileBox: {
    padding: '15px',
    background: '#fff',
    marginBottom: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  profileImage: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '10px',
    border: '2px solid #0073b1',
  },
  form: {
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    marginTop: '20px',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    marginBottom: '15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    marginBottom: '15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    resize: 'vertical',
  },
  button: {
    background: '#0073b1',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  },
  uploadBox: {
    marginTop: '30px',
    background: '#fff',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  downloadBox: {
    marginTop: '20px',
    textAlign: 'center',
  },
};
