import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors'; // Import cors
import dataRoutes from './routes/data.routes';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';

dotenv.config(); // Ensure dotenv is configured at the top

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet())

app.use(cors({
	origin: 'https://iotwebsys.shop',
	methods: 'GET,POST,PUT,DELETE',
	allowedHeaders: 'Content-Type,Authorization'
})); // Enable CORS

app.use((req, res, next) => {
	res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
	res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
	next();
  });

app.use(bodyParser.json());
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);

const connectMongoDB = async () => {
	try {
		const uri = process.env.MONGODB_URI;
		if (!uri) {
			throw new Error('MONGODB_URI is not defined');
		}
		await mongoose.connect(uri);
		console.log("Connected to Database!");
	} catch (error) {
		console.error(error);
		throw error;
	}
}

app.listen(port, () => {
    connectMongoDB();
    console.log(`Server is running on port ${port}`);
});
