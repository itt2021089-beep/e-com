import app from './app';
import { prisma } from './utils/prisma';
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try { // Verify database connection before starting the serverawait 
    prisma.$connect();console.log('✅ Successfully connected to PostgreSQL database.');
    app.listen(PORT, () => {console.log(`🚀 Server is running on http://localhost:${PORT}`);});} 
    
    catch (error) {
        console.error('❌ Failed to start server:', error);process.exit(1);}};startServer();