import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import endpoints from "./endpoints/endpoints.js";
import easyPay from "./utils/easypay.js";
import axios from "axios";
const app = express();
import { v4 as uuidv4 } from 'uuid';
import { Worker } from 'worker_threads';

//csv parser
import multer from "multer";
//const multer = require('multer');
import csv from "csv-parser";
//const csv = require('csv-parser');
import fs from "fs";
//const fs = require('fs');
import stream from "stream";

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

const targetURL = process.env.TARGET_URL || "https://hasura.upsmfac.org";

// Creating an Axios instance with custom headers
const axiosInstance = axios.create({
  baseURL: targetURL,
  headers: {
    "x-hasura-admin-secret": "myadminsecretkey",
    "Hasura-Client-Name": "hasura-console"
    // Add any other headers you need
  },
});

// Loop through the endpoints and create the corresponding proxy middleware
endpoints.forEach((endpoint) => {
  app.use(
    endpoint.route,
    createProxyMiddleware({
      target: targetURL,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader("x-hasura-admin-secret", "myadminsecretkey");
        proxyReq.setHeader("Hasura-Client-Name", "hasura-console");
        if (endpoint.requestBody) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        }
        // Set request body if provided
        if (endpoint.requestBody && req.body) {
          proxyReq.write(JSON.stringify(req.body));
        }
        proxyReq.end();
      },
      onError: (err, req, res) => {
        // Handle errors from the upstream server
        console.error("Proxy Error:", err.message);
        res.status(500).send("Proxy Error: " + err.message);
      },
    })
  );
});

//payment handlers
app.post("/payment/generatelink", (req, res) => {
  const payload = req.body;
  try {
    const response = easyPay.generatePayload(
      payload,
      process.env.environment === "prod" ? false : true
    );
    res.status(200).send(response);
  } catch (err) {
    console.error("Error:", err);
    console.error("Error message:", err.message);
    res.status(500).send({ message: "Some Error Occured" });
  }
});

// Parse CSV header
const parseHeader = (csvData) => {
  const lines = csvData.split('\n');
  if (lines.length > 0) {
    return lines[0].split(',').map(header => header.trim().toLowerCase());
  }
  return [];
};
const bulkUploadAssessorSchedule = '/api/rest/bulkUploadAssessorSchedule';
const bulkUpload = (updateStr) => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {
              console.log(updateStr);
              const response = await axiosInstance.post(targetURL+bulkUploadAssessorSchedule, updateStr);
              resolve(response.data.insert_assessor_schedule_bulk_upload.returning); 
          } catch (error) {
              console.error('Error updating status:', error.message);
              throw error;
          }
      }, 1000);
  });
};

// Endpoint for uploading CSV file
app.post('/upload', upload.single('csvFile'), (req, res) => {
  try {
    //const validCSVHeaders = [form_id,form_title,aplication_type,course_type,assessor_id];
    
    // Get CSV data from the uploaded file
    const csvDataString = req.file.buffer.toString('utf8');

    // Get CSV header
    const csvHeader = parseHeader(csvDataString);
    //console.log(csvHeader)
    
    const readableStream = stream.Readable.from(csvDataString);
    const processId = uuidv4();
    // Parse CSV data
    const results = [];
    const parseOptions = {
      mapHeaders: ({ header, index }) => header.toLowerCase().trim(), // Normalize header names
      mapValues: ({ value }) => value.trim(), // Trim whitespace from values
    };
    //console.log(parseOptions)
    //const response = {};
    //DISTRICT,PARENT CENTER CODE,CHILD CENTER CODE,INSTITUTE NAME,ASSESSMENT DATE,ASSESSOR IDS,STATUS
    //find application id using institute name
    readableStream.pipe(csv(parseOptions))
      .on('data', (data) => {
        const formid = /\d/.test(data.form_id)==true?parseInt(data.form_id, 10):0;
        const assessor_code = /\d/.test(data.assessor_id)==true?parseInt(data.assessor_id, 10):0;
          if(formid != 0 && assessor_code!= 0 ){
            const newObj = {
              "application_id" : formid,
              "form_title" : data.form_title,
              "application_type": data.application_type,
              "course_type" : data.course_type,
              "assessor_id" : assessor_code
            };
            results.push(newObj);
          }
      })
      .on('end', async () => {        
        results.forEach((item) => {
          item["process_id"]=processId;
          item["uploaded_by"]="system";
          item["status"]="Pending";
          item["uploaded_date"]=new Date().toLocaleString();
        });
        //{"assessor_schedule_bulk_upload": [{"id": 1,"process_id":1,"uploaded_by":"system","uploaded_date": "2023-11-17","application_id":234,"assessor_id":232}]} 
        const bulkUploadDetails = bulkUpload({"assessor_schedule_bulk_upload":results});

        const worker = new Worker('./backgroundWorker.js');
        worker.on('message', (message) => {
          console.log(`Background Worker Message: ${message}`);
        });
        worker.on('error', (error) => {
          console.error(`Background Worker Error: ${error}`);
        });
        worker.on('exit', (code) => {
          console.log(`Background Worker exited with code ${code}`);
        });

        // Process the parsed CSV data
        res.json({ data: results });
        
      });
  } catch (error) {
    console.error("Error:", error);
    console.error("Error message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
