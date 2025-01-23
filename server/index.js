import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import path from "path";
// import { exec } from "child_process";
import { fileURLToPath } from "url";
import si from "systeminformation";

import sendEmailAlert from "./nodemailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


app.use(express.json());

// const executeCommand = (command) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(error);
//       }
//       resolve(stdout ? stdout : stderr);
//     });
//   });
// };
const getSystemMetrics = async () => {
  try {
    const cpuLoad = await si.currentLoad();
    const memory = await si.mem();
    const disk = await si.fsSize();
    return {
      cpu: cpuLoad.currentLoad,
      memory: memory.used / memory.total * 100,
      disk: disk[0].use
    };
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    throw error;
  }
};

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).send('Error fetching system metrics');
  }
});


const checkMetricsAndAlert = async () => {
  try {
    const disk = await si.fsSize();
    const diskUsage = disk[0].use;

    if (diskUsage > 90) {
      await sendEmailAlert(`Disk usage is critically high: ${diskUsage.toFixed(2)}%`);
      console.log('Disk usage is critically high: ', diskUsage.toFixed(2), '%');
      
    }
  } catch (error) {
    console.error("Failed to check metrics:", error);
  }
};


setInterval(checkMetricsAndAlert, 5 * 60 * 1000);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    success :true,
  })
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
