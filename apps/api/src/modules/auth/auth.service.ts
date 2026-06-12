//business logic/ database logic

import bcrypt from 'bcrypt';
import type { RegisterInput } from './auth.schema';
import {prisma} from "../../config/db"
import type { LoginInput } from './auth.schema';


const SALT_ROUNDS = 10;

//hash function for passwords using bcrypt 

//hashes plaintext password

// export async function hashPassword(password: string): Promise<string> {
//         return await bcrypt.hash(password, SALT_ROUNDS);
// }


// //validates password

// export async function verifyPassword(password: string, hash: string): Promise<boolean> {
//         return await bcrypt.compare(password, hash);
// }

export async function registerUser(input: RegisterInput) {
        const {name,email, password} =  input;

        const existingUser = await prisma.user.findUnique({
                where: {
                        email:email,
                },
        })

        if(existingUser) {
                throw new Error("User already exists");
        }

        const hashPassword = await bcrypt.hash(password,SALT_ROUNDS);


        const user = await prisma.user.create({
                data: {
                        name: name,
                        email: email,
                        password: hashPassword,
                },
        })

        const { password:_, ...safeUser } = user;

        return safeUser

}


export async function loginUser(input: LoginInput) {
        const {email, password} = input;

        const existingUser = await prisma.user.findUnique({
                where: {
                        email:email,

                },
        })

        if(!existingUser) {
                throw new Error("Invalid email or password");
        } 

 

        const isPasswordValid =  await bcrypt.compare(password, existingUser.password);

        if(!isPasswordValid) {
                throw new Error("Invalid email or password");
        }

        
        const { password:_, ...safeUser } = existingUser;

        return safeUser
}

