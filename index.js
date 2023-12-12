import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import endpoints from "./endpoints/endpoints.js";
import easyPay from "./utils/easypay.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

const targetURL = process.env.TARGET_URL || "https://hasura.upsmfac.org";

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

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
