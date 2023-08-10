import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import endpoints from "./endpoints/endpoints.js";

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
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader(
          "x-hasura-admin-secret",
          req.header("x-hasura-admin-secret")
        );
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        // Set request body if provided
        if (endpoint.requestBody && req.body) {
          for (const field of endpoint.requestBody) {
            if (req.body[field]) {
              console.log(req.body[field]);
              proxyReq.write(JSON.stringify({ [field]: req.body[field] }));
            }
          }
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

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
