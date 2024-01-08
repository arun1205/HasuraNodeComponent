import cron from "node-cron";
import axios from "axios";

// Replace 'YOUR_API_ENDPOINT' with the actual API endpoint for updating status
const GET_THRESHOLD_DAYS = '/api/rest/config/search';
const GET_FORM_SUBMISSIONS_BY_STATUS = '/api/rest/getFormSubmissionsByStatus';
const UPDATE_ENDPOINT = "/api/rest/UpdateFormSubmissionStatus";
const targetURL = process.env.TARGET_URL || "https://hasura.upsmfac.org";
const notificationURL = process.env.REACT_APP_API_URL || "https://uphrh.in/api/api";
const emailAuthToken = process.env.REACT_APP_AUTH_TOKEN || "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJSR3RkMkZzeG1EMnJER3I4dkJHZ0N6MVhyalhZUzBSSyJ9.kMLn6177rvY53i0RAN3SPD5m3ctwaLb32pMYQ65nBdA";

// Creating an Axios instance with custom headers
const axiosInstance = axios.create({
    baseURL: targetURL,
    headers: {
      "x-hasura-admin-secret": "myadminsecretkey",
      "Hasura-Client-Name": "hasura-console"
      // Add any other headers you need
    },
  });

//Get threshold days from DB
const fetchThreshold = () => {
    return new Promise(async(resolve) => {
            try {
                const reqData = {"searchString" : {"status": {"_eq": true}, "type": {"_eq": "scheduler"}},"offSet":0,"limit": 100};
                const response = await axiosInstance.post(targetURL+GET_THRESHOLD_DAYS,reqData);
                resolve( response.data.config); 
            } catch (error) {
                console.error('Error fetching threshold days:', error.message);
                throw error;
            }
      });
    
};

//Get submitted date and reviewed date from DB
const fetchData = (arr) => {
    return new Promise(async(resolve) => {
            try {
                const reqData = {"params": arr};
                const response = await axiosInstance.post(targetURL+GET_FORM_SUBMISSIONS_BY_STATUS, reqData);
                resolve(response.data.form_submissions); 
            } catch (error) {
                console.error('Error fetching application data:', error.message);
                throw error;
            }
    });
};

// Update status using the API
const updateStatus = (updateStr) => {
    return new Promise(async(resolve) => {
            try {
                console.log(updateStr);
                const response = await axiosInstance.post(targetURL+UPDATE_ENDPOINT, updateStr);
                resolve(response.data.update_form_submissions.returning); 
            } catch (error) {
                console.error('Error updating status:', error.message);
                throw error;
            }
    });
  };

  const sendEmailNotification = async (postData) => {
    const res = await axiosInstance.post(
      notificationURL + "/email/notify",
      postData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: emailAuthToken,
        },
      }
    );
    return res;
  };

// Schedule the task to run every day at midnight
const scheduledJob = cron.schedule('0 0 * * *', async () => {
  console.log('Cron job running at 12 AM');
  try {
    const currentDate = new Date();    
    const thresholdDaysMap = await fetchThreshold();
    const statusArr = thresholdDaysMap.filter(obj => obj.hasOwnProperty("name")).map(obj => obj["name"]);
    const applicationData = await fetchData(statusArr);
    const emailSub = "Application rejected!";
    const emailTemplate = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Your Email Title</title><link href='https://fonts.googleapis.com/css2?family=Mulish:wght@400;600&display=swap' rel='stylesheet'></head><body style='font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;'><table width='100%' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding: 20px; text-align: center; background-color: #F5F5F5;'><img src='https://regulator.upsmfac.org/images/upsmf.png' alt='Logo' style='max-width: 360px;'></td></tr></table><table width='100%' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0'><tr><td style='padding: 36px;'><p style='color: #555555; font-size: 18px; font-family: 'Mulish', Arial, sans-serif;'>Dear ${applicantName},</p><p style='color: #555555; font-size: 18px; line-height: 1.6; font-family: 'Mulish', Arial, sans-serif;'>We hope this email finds you well. We are writing to kindly request the resubmission of your application for the affiliation process. We apologize for any inconvenience caused, but it appears that there was an issue with the initial submission. Following is the reason for rejection ${rejectedRemarks}</p></td></tr></table></body></html>";

    applicationData.forEach(async (item) => {
        var form_status_updated_at = new Date(item.updated_at);

        const updatedDateDifference = Math.abs(form_status_updated_at.getDate() - currentDate.getDate());

        const filteredObject = thresholdDaysMap.find(obj => obj.name === item.form_status);
        // Update application only for those status which has a threshold by admin
        if(filteredObject){ 
            if (updatedDateDifference > filteredObject.value) {
                // Update the status for this item
                const remarksStr = "Application Rejected as there was no updates from more than "+filteredObject.value+" days";
                const updateStr = { form_id: item.applicant_form_id, form_status: "Rejected", remarks: remarksStr, updated_at: new Date().toLocaleString()};
                const updatedRec = await updateStatus(updateStr);
                updatedRec.forEach( async (item1) => {
                    console.log('Status updated for item with ID: '+ item1.form_id);                   

                    var email = emailTemplate.replace("${rejectedRemarks}",remarksStr);
                    email = email.replace("${applicantName}",item.institute.name); 
                    const emailData = {
                      recipientEmail: [item.institute.email],
                      emailSubject: emailSub,
                      emailBody: email,
                    };
          
                    await sendEmailNotification(emailData);
                    console.log('Notification sent..');    
                });
            }
        }
    });

    scheduler2Fun();

  } catch (error) { console.log('Cron job running at 12 AM');
    console.error('Error updating status:', error.message);
  }
}, {
  //scheduled: true,
  timezone: 'Asia/Kolkata', 
});

const scheduler2Fun = () => {
  console.log('Arun...');
};
console.log('Scheduler started. Waiting for scheduled tasks...');
export default {
  scheduledJob
};