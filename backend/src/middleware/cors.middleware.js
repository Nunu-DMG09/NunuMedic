import cors from 'cors';

const DEV = process.env.NODE_ENV !== 'production';
const FRONTENDS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5073',
  'http://127.0.0.1:5073',
  'http://localhost:3000'
];

const corsOptions = DEV
  ? {
      origin: true, 
      credentials: true,
      methods: ['GET','POST','PUT','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization']
    }
  : {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // curl / Postman
        return FRONTENDS.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed'), false);
      },
      credentials: true,
      methods: ['GET','POST','PUT','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization']
    };

export default cors(corsOptions);