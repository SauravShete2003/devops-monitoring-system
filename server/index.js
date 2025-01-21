import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import si from "systeminformation";

import sendEmailAlert from "./nodemailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};
const getSystemMetrics = async () => {
  try {
    const cpuLoad = await si.currentLoad(); // Get CPU usage
    const mem = await si.mem(); // Get memory info
    const disk = await si.fsSize(); // Get disk usage info

    return {
      cpu: cpuLoad.currentLoad.toFixed(2), // CPU usage in percentage
      memory: ((mem.active / mem.total) * 100).toFixed(2), // Memory usage in percentage
      disk: disk[0].use.toFixed(2), // Disk usage in percentage
    };
  } catch (error) {
    throw new Error("Failed to fetch system metrics");
  }
};

app.get("/api/metrics", async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// app.get("/api/metrics", async (req, res) => {
//   try {
//     const cpuUsage = await executeCommand(
//       "top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'"
//     );
//     const diskUsage = await executeCommand(
//       "df -h / | awk 'NR==2 {print $5}' | sed 's/%//'"
//     );
//     res.json({
//       cpu: Number.parseFloat(cpuUsage).toFixed(2),
//       memory: Number.parseFloat(memoryUsage).toFixed(2),
//       disk: Number.parseFloat(diskUsage).toFixed(2),
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch system metrics" });
//   }
// });


const checkMetricsAndAlert = async () => {
  try {
    const diskUsage = await executeCommand(
      "df -h / | awk 'NR==2 {print $5}' | sed 's/%//'"
    );

    if (Number.parseFloat(diskUsage) > 90) {
      await sendEmailAlert(`Disk usage is critically high: ${diskUsage}%`);
    }
  } catch (error) {
    console.error("Failed to check metrics:", error);
  }
};

setInterval(checkMetricsAndAlert, 5 * 60 * 1000);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
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
