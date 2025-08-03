import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post('http://localhost:8080/api/user/profile', {
          token,
          user_id: id,
        });

        setProfile(response.data.profile);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>Username: @{profile?.username}</p>
      <p>Email: {profile?.email}</p>
      <p>Bio: {profile?.bio || 'N/A'}</p>
      {/* Add more profile info */}
    </div>
  );
};

export default UserProfile;
