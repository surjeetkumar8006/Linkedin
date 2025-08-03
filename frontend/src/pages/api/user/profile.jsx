app.post('/api/user/profile', async (req, res) => {
  const { token, user_id } = req.body;

  if (!token || !user_id) return res.status(400).json({ message: 'Token and user_id required' });

  try {
    const authUser = await User.findOne({ token });
    if (!authUser) return res.status(401).json({ message: 'Invalid token' });

    const profileUser = await User.findById(user_id).select('-password -token');
    if (!profileUser) return res.status(404).json({ message: 'User not found' });

    res.json({ profile: profileUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
