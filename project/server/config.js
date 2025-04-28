import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://myAtlasDBUser:Sp20000320@myatlasclusteredu.4rs45yi.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU'; 