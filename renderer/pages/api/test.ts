import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    // console.log(path.join(__dirname, '../db/sample.db'));
    // const db = new sqlite3.Database(path.join(__dirname, '../db/sample.db'));
    return res.status(200).json({ name: 'hamao' });
};

export default handler;
