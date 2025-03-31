import { NextFunction, Request, Response } from "express";
import { CreateUserInput, LoginUserInput } from "../schema/User.schema";
import { getGithubOauthToken, getGithubUser } from "../services/session.service";
import { Prisma, UserType } from "@prisma/client";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma"; // Add prisma client import

///exclude fnuction will allow us to   omit the sensitive data from the user object
export function exclude <User , Key extends keyof User>(
    user: User,
    keys: Key[]
):Omit<User, Key>{
    for(let key of keys){
        delete user[key];
    }return user;
}

export const registerHandler = async (
    req: Request<{},{}, CreateUserInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await prisma.user.create({
            data: {  
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                userType: req.body.userType as unknown as UserType // Use the user-selected type from request body
            }
        });
        
        res.status(201).json({
            status: "success",
            message: "User created successfully",
            data: {
                user: exclude(user, ["password"])
            }
        });
    } catch(err: any) {
        if(err.code === "P2002") {
            res.status(409).json({
                status: "error",
                message: "Email already exists"
            });
            return;
        }
        next(err);
    }
}

export const loginHandler = async (
    req: Request<{},{}, LoginUserInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where:{
                email: req.body.email
            }
        });
        if(!user){
            res.status(401).json({
                status: "error",
                message: "Invalid email or password"
            });
            return;
        }
        if(user.provider==="GITHUB"){
            res.status(401).json({
                status: "error",
                message: "Please login with Github"
            });
            return;
        }
        const TOKEN_EXPIRES_IN=process.env.TOKEN_EXPIRES_IN as unknown as number;
        const TOKEN_SECRET=process.env.JWT_SECRET as unknown as string;
        const token = jwt.sign(
            {sub: user.id}, 
            TOKEN_SECRET,
            {expiresIn: `${TOKEN_EXPIRES_IN}s`}
        );
        res.cookie("token", token, {
            expires: new Date(Date.now()+TOKEN_EXPIRES_IN*1000),


        });
        res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            data: {
                user: exclude(user, ["password"])
            }
        });
    }catch(err: any){
        next(err);
    }
};

export const logoutHandler = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try{
        res.cookie(
            "token",
            "",
            {
                maxAge: -1
            }
        );
        res.status(200).json({
            status: "success",
            message: "User logged out successfully"
        });
    }catch(err: any){
        next(err);
    }
};


export const githubOAuthHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN as unknown as string;
    try {
        const code = req.query.code as string;
        const pathUrl = (req.query.state as string) ?? "/";
        
        if (req.query.error) {
            res.redirect(`${FRONTEND_ORIGIN}/login`);
            return;
        }
        
        if (!code) {
            res.status(401).json({
                status: "error",
                message: "Authorization code not provided!"
            });
            return;
        }
        
        const { access_token } = await getGithubOauthToken({ code });
        const { email, avatar_url, login } = await getGithubUser({ access_token });
        
        // If GitHub didn't return an email, create a placeholder one using the GitHub username
        const userEmail = email || `${login}@github.user`;
        
        const user = await prisma.user.upsert({
            where: { email: userEmail },
            update: {
                name: login, 
                photo: avatar_url, 
                provider: "GITHUB"
            },
            create: {
                createdAt: new Date(),
                email: userEmail,
                name: login,
                photo: avatar_url,
                provider: "GITHUB",
                userType: "STUDENT",
                verified: true,
                password: ""
            }
        });
        
        if (!user) {
            res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
            return;
        }
        
        const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN as unknown as number;
        const TOKEN_SECRET = process.env.JWT_SECRET as unknown as string;
        const token = jwt.sign(
            { sub: user.id },
            TOKEN_SECRET,
            { expiresIn: `${TOKEN_EXPIRES_IN}s` }
        );
        
        res.cookie("token", token, {
            expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 1000),
        });
        
        res.redirect(`${FRONTEND_ORIGIN}${pathUrl}`);
    } catch (err: any) {
        console.log("GitHub OAuth Error:", err);
        res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
    }
};