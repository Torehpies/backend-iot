import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import nodeMailer from 'nodemailer';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return next(res.status(400).json({ message: 'User not found' }));
        }

        if (!user.isApproved) {
            return next(res.status(403).json({ message: 'User is not approved. Please verify your email.' }));
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            return next(res.status(400).json({ message: 'Password is incorrect' }))
        }

        return next(res.status(200).json({ message: 'Login successful' }));
    } catch (error: any) {
        return next(res.status(500).json({ message: error.message }))
    }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(res.status(400).json({ message: "All fields are required" }));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(res.status(400).json({ message: "User already exists" }));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        isApproved: false
    });
    
    try {
        await newUser.save();
        return next(res.status(201).json({ message: "User created successfully" }));
    } catch (error: any) {
        console.log(error);
        return next(res.status(500).json({ message: error.message }));
    }
}

export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const user = await User.findOne({ email: { $regex: '^' + email + '$', $options: 'i' } });
    if (!user) {
        return next(res.status(400).json({ message: "User not found" }));
    }
    const payload = {
        email: user.email
    }
    const expiryTime = 300;
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: expiryTime });

    const mailTransporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: "airiotsystem@gmail.com",
            pass: "uipvlalsvweccyiy",
        }
    });

    let mailDetails = {
        from: "airiotsystem@gmail.com",
        to: email,
        subject: "Reset Password",
        html: `
<html>
<head>
	<title>Password Reset Request</title>
</head>
<body>
	<h1>Password Reset Request</h1>
	<p>Dear ${user.name},</p>
	<p>We have received a request to reset your password for your account with Air Iot System. Please click the button to complete your request.</p>
	<a href=${process.env.LIVE_URL}/reset/${token}>
		<button style = "background-color: #4CAF50; color: white; padding: 14px 20px; border: none;
		cursor: pointer; border-radius: 4px;">Reset Password</button></a>
	<p>Please note that this link is only valid for 5 minutes.</p>
	<p>Thank you,</p>
	<p>Air Iot System</p>
</body>
</html>
		`,
    };
    mailTransporter.sendMail(mailDetails, async (err, data) => {
        if (err) {
            console.log(err);
            return next(res.status(500).json({ message: "Something went wrong while sending the email" }));
        } else {
            return next(res.status(200).json({ message: "Email sent successfully" }));
        }
    })
}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const email = decoded.email;

        const user = await User.findOne({ email });
        if (!user) {
            return next(res.status(400).json({ message: "Invalid token or user not found" }));
        }

        user.isApproved = true;
        await user.save();

        return next(res.status(200).json({ message: "Email verified successfully" }));
    } catch (error: any) {
        return next(res.status(500).json({ message: error.message }));
    }
}
