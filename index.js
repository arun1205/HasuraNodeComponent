import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import endpoints from "./endpoints/endpoints.js";
import easyPay from "./utils/easypay.js";
import scheduledJob from "./asessorScheduler.js";
import axios  from "axios";

const app = express();
import { v4 as uuidv4 } from 'uuid';
import { Worker } from 'worker_threads';

//csv parser
import multer from "multer";
//const multer = require('multer');
import csv from "csv-parser";
//const csv = require('csv-parser');
import exceljs from "exceljs";
//const fs = require('fs');
import stream from "stream";

const REACT_APP_NODE_URL = process.env.REACT_APP_API_URL || "https://uphrh.in/api/api";
const KEYCLOAK_USER_ENDPOINT = "/v1/user/create"
const REACT_APP_AUTH_TOKEN = process.env.REACT_APP_API_URL || "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJSR3RkMkZzeG1EMnJER3I4dkJHZ0N6MVhyalhZUzBSSyJ9.kMLn6177rvY53i0RAN3SPD5m3ctwaLb32pMYQ65nBdA"


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
    console.log(err);
    res.status(500).send({ message: "Some Error Occured" });
  }
});

//payment handlers
app.post("/payment/v2/generatelink", async (req, res) => {
  const payload = req.body;
  try {
    const response = await easyPay.generatePayload(
      payload,
      process.env.environment === "prod" ? true : true
    );

    //make api call to insert data

    //create payload
    const date = new Date();
    console.log("date - ", date);
    let data = {
      object: {
        created_by: payload.created_by,
        invoice_date: payload.mandatoryFields.invoiceDate,
        invoice_id: payload.mandatoryFields.invoiceId,
        invoice_time: payload.mandatoryFields.invoiceId,
        payer_id: payload.mandatoryFields.payerId,
        payer_type: payload.mandatoryFields.payerType,
        payment_mode: payload.paymode,
        reference_no: response.referenceNo,
        transaction_amount: payload.mandatoryFields.transactionAmount,
        transaction_date:
          date.getDay() + "-" + date.getMonth() + "-" + date.getFullYear(),
        transaction_status: "UNPAID",
        transaction_time:
          date.getHours() + ":" + date.getMinutes(),
      },
    }

    //insert into hasura
    console.log("Request payload - ", data);
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: "https://uphrh.in/api/api/rest/saveTransactionRecord",
      headers: {
        Authorization: "Bearer " + process.env.Authorization,
      },
      data: data,
    };
    await axios.request(config)

    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    console.error("Error:", err);
    console.error("Error message:", err.message);
    res.status(500).send({ message: "Some Error Occured" });
  }
});

const bulkUploadAssessorSchedule = '/api/rest/bulkUploadAssessorSchedule';
const bulkUpload = (updateStr) => {
  return new Promise(async(resolve) => {
          try {
              console.log(updateStr);
              const response = await axiosInstance.post(targetURL+bulkUploadAssessorSchedule, updateStr);
              resolve(response.data.insert_assessor_schedule_bulk_upload.returning); 
          } catch (error) {
              console.error('Error in updating data to bulk upload table:', error.message);
              throw error;
          }
  });
};

// Endpoint for uploading file
app.post('/upload/assessor/schedule', upload.single('file'), async(req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  if (!req.body.userId) {
    return res.status(400).json({ error: 'UserId is not provided' });
  }
  try {
    const processId = uuidv4();

    const validfileHeaders = ["form_id","form_title","application_type","course_type","date","form_status","payment_status","assessor_id"];
    const { userId } = req.body;

    // Get data from the uploaded file
    const fileDataString = req.file.buffer;    
    const readableStream = stream.Readable.from(fileDataString);
    
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.read(readableStream);
    const worksheet = workbook.getWorksheet(1); // Assuming the first sheet

    const results = [];
    const header = [];
    // Iterate over rows and columns
    worksheet.eachRow((row, rowNumber) => {
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        // Assuming the first row contains headers
        if (rowNumber === 1) {
          header [colNumber]= cell.value.trim().toLowerCase().replace(/ /g, '_');
        } else {
          if(validfileHeaders.includes(header [colNumber])) {
            var cellValue;
            if(header [colNumber] == "form_id"){
              cellValue = /\d/.test(cell.value)==true?parseInt(cell.value, 10):0;
              rowData["application_id"] = cellValue;
            }else if(header [colNumber] == "assessor_id") {
              cellValue = /\d/.test(cell.value)==true?parseInt(cell.value, 10):0;
              rowData[header [colNumber]] = cellValue;
            }else{
              cellValue = cell.value;
              rowData[header [colNumber]] = cellValue;
            }
            if(cellValue.length<=1){
              console.error("Invalid data format");
              throw new BadRequestError("Invalid data format : "+cellValue );
            }
          }else{
            console.error("Invalid file format");
            throw new BadRequestError("Invalid file format : "+header [colNumber] );
          }
        }
      });
      if(Object.keys(rowData).length !== 0){
        if(rowData.assessor_id == undefined){
          rowData["assessor_id"]=0;
        }
        results.push(rowData);
      }else{
        //Ignore the empty row
      }
    });    
    if(results.length===0){
      throw new BadRequestError("Invalid file format");
    }
      results.forEach((item) => {
        item["process_id"]=processId;
        item["uploaded_by"]=userId;
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
      return res.json({ data: results });
        
  } catch (error) {
    if (error instanceof BadRequestError) {
      console.error(`Caught BadRequestError: ${error.message}`);
      console.error(`HTTP Status Code: ${error.statusCode}`);
      res.status(400).json({ success: false, error: error.message });
    } else {
     
    console.error("Error:", error);
    console.error("Error message:", error.message);
    res.status(500).json({ success: false, error: error.message });
    }
  }
});
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400; // HTTP status code for Bad Request
    Error.captureStackTrace(this, this.constructor);
  }
}
// Custom Stream class to create a readable stream from a buffer
class BufferStream {
  constructor(buffer) {
    this.buffer = buffer;
    this.position = 0;
  }

  read(size) {
    if (this.position >= this.buffer.length) {
      return null;
    }

    const chunk = this.buffer.slice(this.position, this.position + size);
    this.position += chunk.length;

    return chunk;
  }
}

// Endpoint for bulk user creation
app.post('/upload/users', upload.single('file'), async(req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
/*   if (!req.body.userId) {
    return res.status(400).json({ error: 'UserId is not provided' });
  } */
  try {
    const processId = uuidv4();

    const validfileHeaders = ["email","mobile_number","fname","lname","role"];
    const { userId } = req.body;

    // Get data from the uploaded file
    const fileDataString = req.file.buffer;    
    const readableStream = stream.Readable.from(fileDataString);
    
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.read(readableStream);
    const worksheet = workbook.getWorksheet(1); // Assuming the first sheet

    const results = [];
    const header = [];

    // Iterate over rows and columns
    worksheet.eachRow((row, rowNumber) => {
      const rowData = {};
      let index = 0;
      row.eachCell((cell, colNumber) => {
        index++
        // Assuming the first row contains headers
        if (rowNumber === 1) {
          header [colNumber]= cell.value.trim().toLowerCase().replace(/ /g, '_');
        } else {
          if(colNumber === index){
            if(validfileHeaders.includes(header [colNumber])) {
              let emailCellValue = "";
              let mobNumCellValue = "";
              if(header [colNumber] == "email"){
                let emailString = "";
                emailString = typeof cell.value === "object" ? cell.value.text : cell.value;
                const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(emailString);
                emailCellValue = isEmail ? emailString.trim() :  "Invalid";
                rowData["email"] = emailCellValue;
              }
              if(header [colNumber] === "mobile_number"){
                const isPhoneNumber = /^(?:(?:\(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(cell.value);
                mobNumCellValue = isPhoneNumber ? cell.value :  "Invalid";
                if(emailCellValue != "Invalid" && mobNumCellValue != "Invalid"){
                  rowData["mobile_number"] = mobNumCellValue;
                } else {
                  res.json({ error : "Invalid Mobile Number / Email detected" });
                }
              }
              if(header [colNumber] === "fname"){
                rowData["fname"] = cell.value;
              }
              if(header [colNumber] === "lname"){
                rowData["lname"] = cell.value;
              }
              if(header [colNumber] === "role"){
                rowData["role"] = cell.value;
              }

            }
         
            if(Object.keys(rowData).length !== 0){
               results.push(rowData);
             }
          } 
          else {
           // Empty Cells detected in excel sheet
         results.length = 0;
          }
       
        }
      });
     
    }); 
   // console.log(results)   
   const users = Object.values(
    results?.reduce((acc, obj) => ({ ...acc, [obj.email]: obj }), {})
);    
    // Process the parsed CSV data
    if(users.length){
      users.map(async (user) => {
       const keyCloakPostData = {
          "request": {
              "firstName": user.fname,
              "lastName": user.lname,
              "email": user.email,
              "username": user.email,
              "enabled": true,
              "emailVerified": false,
              "credentials": [
                  {
                      "type": "password",
                      "value": user.mobile_number,
                      "temporary": "false"
                  }
              ],
              "attributes": {
                  "Role": user.role
              }
          }
      }
       let r =  await createBulkUsersKeyCloak(keyCloakPostData)
       
       console.log(r)
      })
      return res.json({ data: users  });
    } else {
      res.status(500).json({ success: false, error: 'Invalid excel sheet' });
    }

  } catch (error) {
    console.error("Error:", error);
    console.error("Error message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const createBulkUsersKeyCloak = (reqBody) => {
  return new Promise(async(resolve) => {
          try {
              //console.log(processStr);
              const response = await axiosInstance.post(REACT_APP_NODE_URL + KEYCLOAK_USER_ENDPOINT, reqBody,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: REACT_APP_AUTH_TOKEN
                  },
                });
              //console.log(response.data);
              resolve(response); 
          } catch (error) {
              console.error('Error createBulkUsersKeyCloak:', error.message);
              throw error;
          }
  });
};


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});



