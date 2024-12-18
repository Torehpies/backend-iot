import { Request, Response } from 'express';
import Data from '../models/data';

export const getData = async (req: Request, res: Response) => {
    try {
        const data = await Data.find();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getLatestData = async (req: Request, res: Response) => {
    try {
        const latestData = await Data.findOne().sort({ timestamp: -1 }); // Find the latest document
        res.json(latestData);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const postData = async (req: Request, res: Response) => {
    const { mq135, airQuality, humidity, temperature } = req.body;

    const newData = new Data({
        mq135,
        airQuality,
        humidity,
        temperature
    });

    try {
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
