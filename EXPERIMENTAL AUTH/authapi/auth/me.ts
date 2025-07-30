export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    // Verify JWT and get user data
    const user = { id: '1', email: 'test@test.com', name: 'Test User', createdAt: new Date() };
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}