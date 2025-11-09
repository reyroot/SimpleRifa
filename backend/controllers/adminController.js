import RaffleService from '../services/RaffleService.js';

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    const expectedToken = process.env.ADMIN_SECRET_TOKEN;
    
    if (!token || token !== expectedToken) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    res.json({ 
      message: 'Login exitoso',
      token: expectedToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const drawRaffle = async (req, res) => {
  try {
    const result = await RaffleService.drawWinner(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

