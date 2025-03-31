import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

async function connectDB(){
    try{
        await prisma.$connect();
        console.log('Database connected');

    }catch(error){
        console.log('Database connection failed');
        process.exit(1);
    }finally{
        await prisma.$disconnect();
    }
}
export default connectDB;
