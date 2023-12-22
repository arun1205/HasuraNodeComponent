import axios from "axios";

const targetURL = process.env.TARGET_URL || "https://hasura.upsmfac.org";
const notificationURL = process.env.REACT_APP_API_URL || "https://uphrh.in/api/api";
const emailAuthToken = process.env.REACT_APP_AUTH_TOKEN || "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJSR3RkMkZzeG1EMnJER3I4dkJHZ0N6MVhyalhZUzBSSyJ9.kMLn6177rvY53i0RAN3SPD5m3ctwaLb32pMYQ65nBdA";

const getBulkUploadAssessorSchedule = '/api/rest/getBulkUploadAssessorSchedule';
const filterAssessments = '/api/rest/filterAssessments';
const getUsersForSchedulingAssessment = '/api/rest/getUsersForSchedulingAssessment';
const addAssessmentSchedule = '/api/rest/addAssessmentSchedule';
const addInstituteCourse = '/api/rest/addInstituteCourse';
const addEvents = '/api/rest/addEvents';
const updateForm = '/api/rest/updateForm';
const getApplicantDeviceId = '/api/rest/getApplicantDeviceId';
const notify = '/email/notify';
const getFormSubmissionsByFormIds = '/api/rest/getFormSubmissionsByFormIds';
const updateStatusToBulkUpload = '/api/rest/updateStatusToBulkUpload';
const getAllAssessorsAPI = '/api/rest/getAllAssessors';

// Creating an Axios instance with custom headers
const axiosInstance = axios.create({
  baseURL: targetURL,
  headers: {
    "x-hasura-admin-secret": "myadminsecretkey",
    "Hasura-Client-Name": "hasura-console"
    // Add any other headers you need
  },
});

const getBulkUpload = (processStr) => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {
              console.log(processStr);
              const response = await axiosInstance.post(targetURL + getBulkUploadAssessorSchedule, processStr);
              //console.log(response.data);
              resolve(response.data.assessor_schedule_bulk_upload); 
       //     return response.data;
          } catch (error) {
              console.error('Error getBulkUpload:', error.message);
              throw error;
          }
     }, 1000);
  });
};
const getSchedule = (processStr) => {
  return new Promise(resolve => {
       setTimeout(async() => {
           try {
               
               //console.log(processStr);
               const response = await axiosInstance.post(targetURL + filterAssessments, processStr);
               //console.log(response.data);
               resolve(response.data.assessment_schedule); 
      //return response.data;
           } catch (error) {
               console.error('Error getSchedule:', error.message);
               throw error;
           }
       }, 1000);
   });
 };
 const getAllAssessors = () => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {
            const processStr = {"offsetNo":0,"limit": 100000}
             //console.log(processStr);
             const response = await axiosInstance.post(targetURL + getAllAssessorsAPI, processStr);
             //console.log(response.data.assessors);
             const assessors = response.data.assessors;
             const users = assessors.filter(obj => obj["workingstatus"] == "Valid");
             resolve(users); 
             //return response.data;
          } catch (error) {
              console.error('Error getUsersForScheduling:', error.message);
              throw error;
          }
      }, 1000);
 });
};
 const getUsersForScheduling = (processStr) => {
   return new Promise(resolve => {
       setTimeout(async() => {
           try {
               
              //console.log(processStr);
              const response = await axiosInstance.post(targetURL + getUsersForSchedulingAssessment, processStr);
              //console.log(response.data.assessors);
              resolve(response.data.assessors); 
              //return response.data;
           } catch (error) {
               console.error('Error getUsersForScheduling:', error.message);
               throw error;
           }
       }, 1000);
  });
 };
 
const addAssessmentScheduleToDB = (scheduleStr) => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {
              //console.log(scheduleStr);
              const response = await axiosInstance.post(targetURL + addAssessmentSchedule, scheduleStr);
              //console.log(response.data);
             resolve(response.data); 
     
          } catch (error) {
              console.error('Error addAssessmentScheduleToDB:', error.message);
              throw error;
          }
      }, 1000);
 });
};
const addInstituteCourseToDB = (instituteStr) => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {
              //console.log(instituteStr);
              const response = await axiosInstance.post(targetURL + addInstituteCourse, instituteStr);
              //console.log(response.data);
             resolve(response.data); 
     
          } catch (error) {
              console.error('Error addInstituteCourse:', error.message);
              throw error;
          }
      }, 1000);
 });
};
const addEventsToDB = (eventsStr) => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {
             // console.log(eventsStr);
              const response = await axiosInstance.post(targetURL + addEvents, eventsStr);
              //console.log(response.data);
             resolve(response.data); 
     
          } catch (error) {
              console.error('Error addEvents:', error.message);
              throw error;
          }
      }, 1000);
 });
};
const updateFormToDB = (formStr) => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {
              //console.log(formStr);
              const response = await axiosInstance.put(targetURL + updateForm, formStr);
              //console.log(response.data);
             resolve(response.data); 
     
          } catch (error) {
              console.error('Error updateForm:', error.message);
              throw error;
          }
      }, 1000);
 });
};

const getApplicantDeviceIdFromDB = async (postData) => {
  const res = await axiosInstance.post(targetURL + getApplicantDeviceId,postData);
  return res;
};

const sendEmailNotification = async (postData) => {
  const res = await axiosInstance.post(
    notificationURL + notify,
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
const getFormSubmissionsByFormId = (arr) => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {
              const reqData = {"params": arr};
              const response = await axiosInstance.post(targetURL+getFormSubmissionsByFormIds, reqData);
              resolve(response.data.form_submissions); 
          } catch (error) {
              console.error('Error getFormSubmissionsByFormId:', error.message);
              throw error;
          }
      }, 1000);
  });
};

const updateStatusToBulkUploadData = (obj) => {
  return new Promise(resolve => {
      setTimeout(async() => {
          try {             
              const response = await axiosInstance.post(targetURL + updateStatusToBulkUpload, obj);
              resolve(response.data); 
          } catch (error) {
              console.error('Error updateStatusToBulkUploadData :', error.message);
              throw error;
          }
      }, 1000);
  });
};

function findDuplicateRecords(array, attribute1, attribute2) {
  const duplicates = array.filter((item, index, self) => {
    return (
      index !== self.findIndex(
        (innerItem) =>
          innerItem[attribute1] === item[attribute1] &&
          innerItem[attribute2] === item[attribute2]
      )
    );
  });

  return duplicates;
}

function getDatesFromTodayTo90Days() {
  const currentDate = new Date();
  const datesArray = [];

  for (let i = 1; i < 90; i++) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + i);
    datesArray.push(nextDate.toISOString().split('T')[0]);
  }
  // Sort the filtered dates in ascending order
  datesArray.sort((a, b) => new Date(a) - new Date(b));

  return datesArray;
}

const  performBackgroundTask = async () => {
  const emailTemplate = "<!DOCTYPE html><html><head><meta charset=\'utf-8\'><title>Your Email Title</title><link href=\'https://fonts.googleapis.com/css2?family=Mulish:wght@400;600&display=swap\' rel=\'stylesheet\'></head>"+
  "<body style=\'font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;\'>"+
  "<table width=\'100%\' bgcolor=\'#ffffff\' cellpadding=\'0\' cellspacing=\'0\' border=\'0\'>"+
  "<tr><td style=\'padding: 20px; text-align: center; background-color: #F5F5F5;\'><img src=\'https://regulator.upsmfac.org/images/upsmf.png\' alt=\'Logo\' style=\'max-width: 360px;\'></td></tr></table>"+
  "<table width=\'100%\' bgcolor=\'#ffffff\' cellpadding=\'0\' cellspacing=\'0\' border=\'0\'><tr><td style=\'padding: 36px;\'><p style=\'color: #555555; font-size: 18px; font-family: \'Mulish\', Arial, sans-serif;\'>Dear ${applicantName},</p>"+
  "<p style=\'color: #555555; font-size: 18px; line-height: 1.6; font-family: \'Mulish\', Arial, sans-serif;\'>We hope this email finds you well. We are glad to inform you that your application has been processed and was found fit for our next step which is on-ground assessment. "+
  "On-ground assessment for your application have been scheduled. Please expect us to visit your institute very soon.</p><p style=\'color: #555555; font-size: 18px; line-height: 1.6; font-family: \'Mulish\', Arial, sans-serif;\'>Following information will help you prepare for the scheduled on-ground assessment:\\n      "+
  "<br/>1. A team of assessors will visit your institute for on-ground assessment. To make this process fair and transparent, institutes are not supposed to know the date of on-ground assessment and assessors are not supposed to know the institute they will be assessing till the day of assessment.\\n      "+
  "<br/>2. We expect your institute open and accessible to our on-ground assessment team on any working day.\\n      "+
  "<br/>3. Once on-ground assessment team prove their identity, they should be allowed to enter the institute and given full cooperation to carry out the on-ground assessment.</p>"+
  "<p style=\'color: #555555; font-size: 18px; line-height: 1.6; font-family: \'Mulish\', Arial, sans-serif;\'>If you have any questions or need further clarification regarding the resubmission process, "+
  "please do not hesitate to reach out to our support executives at <Contact Details>. We are here to assist you and provide any necessary guidance.</p>"+
  "<p style=\'color: #555555; font-size: 18px; line-height: 1.6; font-family: \'Mulish\', Arial, sans-serif;\'>Thank you for your time and continued interest in getting affiliated from our organization.</p></td></tr></table></body></html>";

  try {
    const dateRange = getDatesFromTodayTo90Days();
    const activeAssessors = await getAllAssessors();

    var bulkUploadData = await getBulkUpload({"where" : {"status": {"_eq": "Pending"}}});
 
    // Find duplicates based on the "application_id" attribute
    const duplicates = findDuplicateRecords(bulkUploadData, 'application_id','process_id');
    duplicates.forEach(async element => {
        var updateStatus = "Failed";
        var updateRemarks = "Duplicate Record";
        
        const updateData = await updateStatusToBulkUploadData({id:element.id,status:updateStatus,remarks:updateRemarks});
        bulkUploadData = bulkUploadData.filter(obj => (obj["application_id"] !== element.application_id && obj["id"]==element.id));      
    });
    
    const formIdArr = bulkUploadData.filter(obj => obj.hasOwnProperty("application_id")).map(obj => obj["application_id"]);
    const formSubData = await getFormSubmissionsByFormId(formIdArr);
  
    var updateStatus = "Success";
    var updateRemarks = "";
    
    bulkUploadData.forEach(async element => {
        if(formSubData.length == 0){
          updateRemarks = "Form Application id is not existing in system or payment is not complete.";
          updateStatus = "Failed";
        } else {
          const formSubmissionObj = formSubData.filter(obj => obj["form_id"] === element.application_id);
          const assessorObj = activeAssessors.filter(assessor => assessor["code"] === (element.assessor_id)+"");
          if(assessorObj.length == 0){
            updateRemarks = "Assessor code is not existing in system.";
            updateStatus = "Failed";
          } else {
            //get existing form application schedules
            const scheduleCriteria1 = {"offsetNo":0,"limit": 100000,"condition": {"applicant_form_id": {"_eq": element.application_id}}};
            const formSchedules = await getSchedule(scheduleCriteria1);
            if(formSchedules.length == 0){
              //get existing assessor schedules
              var datesNotInArray = [];
              const scheduleCriteria = {"offsetNo":0,"limit": 100000,"condition": {"assessor_code": {"_eq": element.assessor_id+""}}};
              const schedules = await getSchedule(scheduleCriteria);
                            
              //if no existing schedules, pick the nearest one
              if(schedules.length == 0){
                datesNotInArray = dateRange;
              }else{
                const scheduledDates = schedules.filter(obj => obj.hasOwnProperty("date")).map(obj => obj["date"]);
                datesNotInArray = dateRange.filter(date => !scheduledDates.includes(date));
              }
              const nearestUpcomingFreeDate = datesNotInArray[0];

              //assign new schedule
              const scheduleStr ={"assessment_schedule":[{
                "assessor_code":assessorObj[0].code,
                "date":nearestUpcomingFreeDate,//nextDate.toLocaleString(),
                "institute_id":formSubmissionObj[0].institute.id,
                "applicant_form_id":formSubmissionObj[0].form_id}]};
              const addedRec = await addAssessmentScheduleToDB(scheduleStr);
              //scheduledDates.push(nearestUpcomingFreeDate);

              const instituteStr ={"institute_course":[{
                "institute_id":formSubmissionObj[0].institute.id,
                "institute_type":"[{\"courseType\":\""+formSubmissionObj[0].course_type+"\",\"courseLevel\":\""+formSubmissionObj[0].course_level+"\"}]"}],
                "institute_form":[{"course_id":formSubmissionObj[0].course_id,"applicant_form_id":formSubmissionObj[0].form_id,"institute_id":formSubmissionObj[0].institute.id,"assessment_date":nearestUpcomingFreeDate}]};
              const addInstRec = addInstituteCourseToDB(instituteStr);

              const eventsStr = {"events":[{
                "created_date":new Date().toLocaleString(),
                "entity_id":formSubmissionObj[0].form_id+"",
                "entity_type":"form",
                "event_name":"Inspection Scheduled",
                "remarks":"Round 1 inspection scheduled"}]};
              const addeventsRec = await addEventsToDB(eventsStr);

              const formStr = {"form_id":formSubmissionObj[0].form_id,"form_status":"Inspection Scheduled"};
              const addFormRec = await updateFormToDB(formStr);
              
              var email = emailTemplate.replace("${applicantName}",formSubmissionObj[0].institute.name);
              const emailData = {
                "recipientEmail":[formSubmissionObj[0].institute.email],
                "emailSubject":"Inspection scheduled for KSIT",
                "emailBody":email
              };
              sendEmailNotification(emailData);
              console.log('Notification sent..');   
              updateRemarks = "Updated Successfully.";
              updateStatus = "Success";
            }else{
              updateRemarks = "Form Schedule Already Exists.";
              updateStatus = "Failed";
            }
          } 
        } 
        const updateData = await updateStatusToBulkUploadData({id:element.id,status:updateStatus,remarks:updateRemarks});
      
    });
    // Process the API response
    //console.log('API Response:', bulkUploadData);
  } catch (error) {
    console.error('Error making API call:', error.message);
  }
}

  
  // Perform the background task
  performBackgroundTask();