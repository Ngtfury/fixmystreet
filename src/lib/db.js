import fs from 'fs';
import path from 'path';

// Define the path to our local JSON database
const dataFilePath = path.join(process.cwd(), 'data.json');

/**
 * Utility to read data from data.json safely
 * @returns {Object} The parsed JSON data containing users and complaints
 */
export function readData() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            // If the file doesn't exist, create it with the default structure
            const defaultData = { users: [], complaints: [] };
            fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
            return defaultData;
        }
        const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error("Error reading data.json:", error);
        return { users: [], complaints: [] };
    }
}

/**
 * Utility to write data back to data.json safely
 * @param {Object} data The object containing users and complaints arrays
 */
export function writeData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error("Error writing to data.json:", error);
        return false;
    }
}
