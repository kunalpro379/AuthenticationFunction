import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getGoogleOauthToken, getGoogleUser } from "../services/session.service";
import jwt from "jsonwebtoken";

export const googleOAuthHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN as string;
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

        const { access_token } = await getGoogleOauthToken(code);
        const { email, name, picture, verified_email } = await getGoogleUser(access_token);

        if (!email) {
            res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
            return;
        }

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name,
                photo: picture,
                provider: "GOOGLE",
                verified: verified_email
            },
            create: {
                email,
                name,
                photo: picture,
                provider: "GOOGLE",
                userType: "STUDENT",
                verified: verified_email,
                password: ""
            }
        });

        if (!user) {
            res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
            return;
        }

        const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN as unknown as number;
        const TOKEN_SECRET = process.env.JWT_SECRET as string;
        
        const token = jwt.sign(
            { sub: user.id },
            TOKEN_SECRET,
            { expiresIn: `${TOKEN_EXPIRES_IN}s` }
        );

        res.cookie("token", token, {
            expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.redirect(`${FRONTEND_ORIGIN}${pathUrl}`);
    } catch (err: any) {
        console.error("Google OAuth Error:", err);
        res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
    }
};