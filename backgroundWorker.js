import axios from "axios";
import async from "async";
const targetURL = process.env.TARGET_URL;
const REACT_APP_NODE_URL = process.env.REACT_APP_API_URL;
const AUTH_TOKEN = process.env.REACT_APP_AUTH_TOKEN;

const getBulkUploadAssessorSchedule = '/api/rest/getBulkUploadAssessorSchedule';
const filterAssessments = '/api/rest/filterAssessments';
const addAssessmentSchedule = '/api/rest/addAssessmentSchedule';
const addInstituteCourse = '/api/rest/addInstituteCourse';
const addEvents = '/api/rest/addEvents';
const updateForm = '/api/rest/updateForm';
const notify = '/email/notify';
const getFormSubmissionsByFormIds = '/api/rest/getFormSubmissionsByFormIds';
const updateStatusToBulkUpload = '/api/rest/updateStatusToBulkUpload';
const getAllAssessorsAPI = '/api/rest/getAllAssessors';
const getAdminDetailsById = '/api/rest/getRegulator';

const hasuraClientName = process.env.HASURA_CLIENT_NAME ;
const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET ;

// Creating an Axios instance with custom headers
const axiosInstance = axios.create({
  baseURL: targetURL,
  headers: {
    "x-hasura-admin-secret": hasuraAdminSecret,
    "Hasura-Client-Name": hasuraClientName
    // Add any other headers you need
  },
});

const getBulkUpload = (processStr) => {
  return new Promise(async(resolve) => {
          try {
              //console.log(processStr);
              const response = await axiosInstance.post(targetURL + getBulkUploadAssessorSchedule, processStr);
              //console.log(response.data);
              resolve(response.data.assessor_schedule_bulk_upload); 
          } catch (error) {
              console.error('Error getBulkUpload:', error.message);
              throw error;
          }
  });
};

 const getAllAssessors = () => {
  return new Promise(async(resolve) => {
          try {
            const processStr = {"offsetNo":0,"limit": 100000}
             //console.log(processStr);
             const response = await axiosInstance.post(targetURL + getAllAssessorsAPI, processStr);
             //console.log(response.data.assessors);
             const assessors = response.data.assessors;
             const users = assessors.filter(obj => obj["workingstatus"] == "Valid");
             resolve(users); 
          } catch (error) {
              console.error('Error getUsersForScheduling:', error.message);
              throw error;
          }
 });
};
 
const addAssessmentScheduleToDB = (scheduleStr) => {
  return new Promise(async(resolve) => {
          try {
              //console.log(scheduleStr);
              const response = await axiosInstance.post(targetURL + addAssessmentSchedule, scheduleStr);
              //console.log(response.data);
             resolve(response.data); 
     
          } catch (error) {
              console.error('Error addAssessmentScheduleToDB:', error.message);
              throw error;
          }
 });
};
const addInstituteCourseToDB = (instituteStr) => {
  return new Promise(async(resolve) => {
          try {
              //console.log(instituteStr);
              const response = await axiosInstance.post(targetURL + addInstituteCourse, instituteStr);
              //console.log(response.data);
             resolve(response.data); 
     
          } catch (error) {
              console.error('Error addInstituteCourse:', error.message);
              throw error;
          }
 });
};
const addEventsToDB = (eventsStr) => {
  return new Promise(async(resolve) => {
          try {
             // console.log(eventsStr);
              const response = await axiosInstance.post(targetURL + addEvents, eventsStr);
              //console.log(response.data);
             resolve(response.data); 
     
          } catch (error) {
              console.error('Error addEvents:', error.message);
              throw error;
          }
 });
};
const updateFormToDB = (formStr) => {
  return new Promise(async(resolve) => {
          try {
              //console.log(formStr);
              const response = await axiosInstance.put(targetURL + updateForm, formStr);
              //console.log(response.data);
             resolve(response.data); 
     
          } catch (error) {
              console.error('Error updateForm:', error.message);
              throw error;
          }
 });
};

const getAdminDetails = async (adminId) => {
  try {
    const postData = {"user_id":adminId};
    console.log(postData);
    const res = await axiosInstance.post(targetURL + getAdminDetailsById , postData);
    //console.log(res);
    return res.data.regulator;
  } catch (error) {
    console.error('Error getAdminDetails:', error.message);
    throw error;
  }
};

const sendEmailNotification = async (postData) => {
  return new Promise(async(resolve) => {
    try {
      //console.log(postData);
      const res = await axiosInstance.post(
        REACT_APP_NODE_URL + notify,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_TOKEN,
          },
        }
      );
      resolve( res);
    } catch (error) {
      console.error('Error sendEmailNotification:', error.message);
      throw error;
    }
  });
};
const getFormSubmissionsByFormId = (arr) => {
  return new Promise(async(resolve) => {
          try {
              const reqData = {"params": arr};
              const response = await axiosInstance.post(targetURL+getFormSubmissionsByFormIds, reqData);
              resolve(response.data.form_submissions); 
          } catch (error) {
              console.error('Error getFormSubmissionsByFormId:', error.message);
              throw error;
          }
  });
};

const updateStatusToBulkUploadData = (obj) => {
  return new Promise(async(resolve) => {
          try {             
              const response = await axiosInstance.post(targetURL + updateStatusToBulkUpload, obj);
              resolve(response.data); 
          } catch (error) {
              console.error('Error updateStatusToBulkUploadData :', error.message);
              throw error;
          }
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
function findDuplicateRecordsByStatus(array, attribute1, attribute2, attribute3) {

  var duplicates = array.filter((item, index, self) => {
    return (
      index !== self.findIndex(
        (innerItem) =>
          innerItem[attribute1] === item[attribute1] &&
          (innerItem[attribute3] !== item[attribute3] 
             )&&
            item[attribute2] === 'Pending'
      )
    );
  });

  const maxId = duplicates.reduce((max, current) => (current.id > max ? current.id : max), array[0].id);
  duplicates = duplicates.filter((record) => record.id !== maxId);
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
function createEmailTable(emailTableRows, id, process_id, application_id, form_title,           
  application_type, course_type, assessor_id, uploaded_date, updateStatus, updateRemarks){
  if(emailTableRows.length()===1){
    emailTableRows.append("<tr><td>Id</td><td>Process_Id</td><td>Form_Id</td><td>Form_Title</td><td>Application_Type</td><td>Course_Type</td><td>Assessor_Id</td><td>Uploaded_Date</td><td>Status</td><td>Remarks</td></tr>");
  }
  emailTableRows.append("<tr><td>"+id);
  emailTableRows.append("</td> <td>" + process_id );
  emailTableRows.append("</td> <td>" + application_id);
  emailTableRows.append("</td> <td>" + form_title );
  emailTableRows.append("</td> <td>" + application_type);
  emailTableRows.append("</td> <td>" + course_type );
  emailTableRows.append("</td> <td>" + assessor_id );
  emailTableRows.append("</td> <td>" + uploaded_date );
  emailTableRows.append("</td> <td>" + updateStatus );
  emailTableRows.append("</td> <td>" + updateRemarks +"</td></tr>");
  return emailTableRows;
}
class StringBuffer {
  constructor() {
    this.buffer = [];
  }

  append(str) {
    this.buffer.push(str);
    return this; // Returning the instance for method chaining
  }

  toString() {
    return this.buffer.join('');
  }
  length() {
    return this.buffer.length;
  }
}
const getSchedule = async(processStr, callback) => {
  //return new Promise(async(resolve) => {
           try {               
              const response = await axiosInstance.post(targetURL + filterAssessments, processStr);
             // console.log(response.data.assessment_schedule);
              var formSchedules = response.data.assessment_schedule;
              //resolve (formSchedules); 
              callback(null,formSchedules);
           } catch (error) {
               console.error('Error getSchedule:', error.message);
               throw error;
           }
  // });
 };
 const getScheduless = async(processStr, callback) => {
  //return new Promise(async(resolve) => {
           try {               
              const response = await axiosInstance.post(targetURL + filterAssessments, processStr);
             // console.log(response.data.assessment_schedule);
              var formSchedules = response.data.assessment_schedule;
              //resolve (formSchedules); 
              callback(null,formSchedules);
           } catch (error) {
               console.error('Error getSchedules:', error.message);
               throw error;
           }
  // });
 };
const addAssessorSchedule = (formSubmissionObj, element, assessorObj, callback)=>{
  try {
  //get existing assessor schedules
  var datesNotInArray = [];   
  const scheduleCriteria = {"offsetNo":0,"limit": 100000,"condition": {"assessor_code": {"_eq": element.assessor_id+""}}};
  getScheduless(scheduleCriteria,(error,schedules)=> {
      if(error){
        console.error(`Error getScheduless ${element.id}:`, error);
        throw error;
      }else{                                
        const dateRange = getDatesFromTodayTo90Days();       
        //if no existing schedules, pick the nearest one
        if(schedules.length == 0){
          datesNotInArray = dateRange;
        }else{
          const scheduledDates = schedules.filter(obj => obj.hasOwnProperty("date")).map(obj => obj["date"]);
          datesNotInArray = dateRange.filter(date => !scheduledDates.includes(date));
          const nearestUpcomingFreeDate = datesNotInArray[0];
          async.waterfall([
            function addSchedul(callback1){
              //assign new schedule
              const scheduleStr ={"assessment_schedule":[{
                "assessor_code":assessorObj[0].code,
                "date":nearestUpcomingFreeDate,
                "institute_id":formSubmissionObj[0].institute.id,
                "applicant_form_id":formSubmissionObj[0].form_id}]};
              const addedRec = addAssessmentScheduleToDB(scheduleStr);
              console.log("added schedule");
              callback1(null,addedRec);
            },
            function addinst(addedRec, callback2){
              const instituteStr ={"institute_course":[{
                "institute_id":formSubmissionObj[0].institute.id,
                "institute_type":"[{\"courseType\":\""+formSubmissionObj[0].course_type+"\",\"courseLevel\":\""+formSubmissionObj[0].course_level+"\"}]"}],
                "institute_form":[{"course_id":formSubmissionObj[0].course_id,"applicant_form_id":formSubmissionObj[0].form_id,"institute_id":formSubmissionObj[0].institute.id,"assessment_date":nearestUpcomingFreeDate}]};
              const addInstRec = addInstituteCourseToDB(instituteStr);
              console.log("added Institute");
              callback2(null,addInstRec);
            },
            function addEve(addInstRec, callback3){
              const eventsStr = {"events":[{
                "created_date":new Date().toLocaleString(),
                "entity_id":formSubmissionObj[0].form_id+"",
                "entity_type":"form",
                "event_name":"Inspection Scheduled",
                "remarks":"Round 1 inspection scheduled"}]};
              const addeventsRec = addEventsToDB(eventsStr);
              console.log("Added event");
              callback3(null,addeventsRec);
            },
            function updateFormSub(addeventsRec,callback4){
              const formStr = {"form_id":formSubmissionObj[0].form_id,"form_status":"Inspection Scheduled"};
              const addFormRec = updateFormToDB(formStr);
              console.log("Updated From Sub");
              callback4(null,addFormRec);
            },
            function sendMail(addFormRec, callback5){
              var email = emailTemplate.replace("${applicantName}",formSubmissionObj[0].institute.name);
              const emailData = {
                "recipientEmail":[formSubmissionObj[0].institute.email],
                "emailSubject":"Inspection scheduled for "+formSubmissionObj[0].institute.name,
                "emailBody":email
              };
              sendEmailNotification(emailData);
              console.log('Applicant notification sent');   
              callback5(null,"Success");
            },
            function returningCallback(status){
              callback(null, true, status, "Updated Successfully.");
            }
          ], (error, finalResult) => {
            if (error) {
              console.error(`Error for element ${element.id}:`, error);
            } else {
              console.log(`Final Result for element ${element.id}:`, finalResult);
            }
          });
        }
      }
    }
  );
} catch (error) {
  console.error('Error addAssessorSchedule:', error.message);
  //throw error;
}
  
}
const executeBulkUpload = (bulkUploadData,  emailTableRows, adminId, formSubData, activeAssessors, callback1) => {
    var updateStatus = "";
    var updateRemarks = "";
    console.log("step 5.1 - "+bulkUploadData.length +" adminId "+adminId);
    var itemsProcessed = 0;
    var assessorObj;
    if(bulkUploadData.length === 0){
      callback1(null,"success",emailTableRows, adminId);
    }else{
      bulkUploadData.forEach((element) => { 
        adminId = element.uploaded_by;
        async.waterfall([   
          function checkAssessor(callback2){
          var isUpdate = false;          
          assessorObj = activeAssessors.filter(assessor => assessor["code"] === (element.assessor_id)+"");
          if(assessorObj.length === 0){
            updateRemarks = "Assessor code is not existing in system.";
            updateStatus = "Failed";
            callback2(null, true, updateStatus, updateRemarks);
          }else{
            callback2(null, false, "", "");
          }
        },
        function getSchedul(isUpdate, updateStatus, updateRemarks, callback3) {
          if(!isUpdate){         
            //get existing form application schedule
            const scheduleCriteria1 = {"offsetNo":0,"limit": 100000,"condition": {"applicant_form_id": {"_eq": element.application_id}}};
            getSchedule(scheduleCriteria1, (error,formSchedules)=> {
              if(error){
                console.error(`Error getSchedule ${element.id}:`, error);
                throw error;
              }else{                    
                 if(formSchedules.length === 0){              
                    callback3(null, false, "", "");    
                  }else{
                    updateRemarks = "Form Schedule Already Exists.";
                    updateStatus = "Failed";
                    callback3(null, true, updateStatus, updateRemarks);
                  }
                
              }});           
            }else{
              callback3(null, isUpdate, updateStatus, updateRemarks);
            }
        },
        function addRecords(isUpdate, updateStatus, updateRemarks, callback41){
            if(!isUpdate){
              var formSubmissionObj = formSubData.filter(obj => obj["form_id"] === element.application_id);
              addAssessorSchedule(formSubmissionObj, element, assessorObj,(error,isUpdate, updateStatus,updateRemarks)=>{
                if(error){
                  console.error(`Error addAssessorSchedule ${element.id}:`, error);
                  throw error;
                }else{  
                    callback41(null, isUpdate, updateStatus, updateRemarks);
                }
              });
              
            }else{ 
              callback41(null, isUpdate, updateStatus, updateRemarks);
            }
        },
        function updateDB1(isUpdate, updateStatus, updateRemarks){
          const updateData = updateStatusToBulkUploadData({id:element.id,status:updateStatus,remarks:updateRemarks});
          emailTableRows.append(createEmailTable(emailTableRows, element.id, element.process_id, element.application_id, element.form_title,           
            element.application_type, element.course_type, element.assessor_id, element.uploaded_date, updateStatus, updateRemarks));
            console.log("Updated id :" + element.id);
          adminId = element.uploaded_by;
          itemsProcessed++;
          if(itemsProcessed === bulkUploadData.length){
            callback1(null,"success",emailTableRows, adminId);
          }                 
        }
      ], (error, finalResult) => {
        if (error) {
          console.error(`Error for element ${element.id}:`, error);
        } else {
          console.log(`Final Result for element ${element.id}:`, finalResult);
        }
      });
    }); 
  }
};

const findMissingRecords = (object1, object2, key1,key2) => {
  const set1 = new Set(object1.map(item1 => item1[key1]));
  const missingRecords = object2.filter(item2 => !set1.has(item2[key2]));
  return missingRecords;
};
const removeDuplicatesFromBulkUpload = (bulkUploadData, emailTableRows, callback) =>{
  // Find duplicates based on the "application_id" attribute
  var duplicates = findDuplicateRecords(bulkUploadData, 'application_id','process_id');
  const duplicatesByStatus = findDuplicateRecordsByStatus(bulkUploadData, 'application_id','status','process_id');
  var itemsProcessed = 0;
  var adminId = "";
  console.log("duplicates in request file"+ duplicates.length+" : "+bulkUploadData.length);
  console.log("old duplicates in bulk upload table"+ duplicatesByStatus.length+" : "+bulkUploadData.length);
  duplicates.push(...duplicatesByStatus);
  if(duplicates.length === 0){
    callback(null,"success",bulkUploadData,emailTableRows,adminId);
  }else{
    duplicates.forEach(element => {
      adminId = element.uploaded_by;
      async.waterfall([
        function updatedbrec(callback1){
          var updateStatus = "Failed";
          var updateRemarks = "Duplicate Record";
          const updateData = updateStatusToBulkUploadData({id:element.id,status:updateStatus,remarks:updateRemarks});
          callback1(null, updateStatus, updateRemarks);
        },
        function removDup( updateStatus, updateRemarks){
          emailTableRows.append(createEmailTable(emailTableRows, element.id, element.process_id, element.application_id, element.form_title,           
            element.application_type, element.course_type, element.assessor_id, element.uploaded_date, updateStatus, updateRemarks));          

          bulkUploadData = bulkUploadData.filter(obj => (obj["id"] !== element.id));         
          adminId = element.uploaded_by;  
          itemsProcessed++;               
          if(itemsProcessed === duplicates.length) {
            callback(null,"success",bulkUploadData,emailTableRows,adminId);
          }
      }]); 
    });
  }  
};

const removeInvalidFormSubmissionIds = async (bulkUploadData, emailTableRows, adminId, formSubData, callback) =>{
  var itemsProcessed = 0;
  const missingRecords = findMissingRecords( formSubData, bulkUploadData,"form_id", "application_id");
  console.log("missingRecords "+ missingRecords.length+" : "+bulkUploadData.length+":"+formSubData.length);
  if(missingRecords.length === 0){
    callback(null,"success",bulkUploadData,emailTableRows,adminId);
  } else {
    missingRecords.forEach(async (element) => {
      adminId = element.uploaded_by;
      async.waterfall([
        function updatedbrec(callback1){
          var updateRemarks = "Form Application id is not existing in system or payment is not complete.";
          var updateStatus = "Failed";
          const updateData = updateStatusToBulkUploadData({id:element.id,status:updateStatus,remarks:updateRemarks});
          callback1(null, updateStatus, updateRemarks);
        },
        function removDup( updateStatus, updateRemarks){
          emailTableRows.append(createEmailTable(emailTableRows, element.id, element.process_id, element.application_id, element.form_title,           
            element.application_type, element.course_type, element.assessor_id, element.uploaded_date, updateStatus, updateRemarks));
          bulkUploadData = bulkUploadData.filter(obj => ( obj["id"]!==element.id));   
          adminId = element.uploaded_by;
          itemsProcessed++;   
          if(itemsProcessed === missingRecords.length) {
            callback(null,"success",bulkUploadData,emailTableRows,adminId);
          } 
        }]);
    });
  }
};
var emailTemplate = "<!DOCTYPE html><html><head><meta charset=\'utf-8\'><title>Your Email Title</title><link href=\'https://fonts.googleapis.com/css2?family=Mulish:wght@400;600&display=swap\' rel=\'stylesheet\'></head>"+
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

var adminEmailTemplate = "<!DOCTYPE html><html><head><meta charset=\'utf-8\'><title>Your Email Title</title><link href=\'https://fonts.googleapis.com/css2?family=Mulish:wght@400;600&display=swap\' rel=\'stylesheet\'></head>"+
"<body style=\'font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;\'>"+
"<table width=\'100%\' bgcolor=\'#ffffff\' cellpadding=\'0\' cellspacing=\'0\' border=\'0\'>"+
"<tr><td style=\'padding: 20px; text-align: center; background-color: #F5F5F5;\'><img src=\'https://regulator.upsmfac.org/images/upsmf.png\' alt=\'Logo\' style=\'max-width: 360px;\'></td></tr></table>"+
"<table width=\'100%\' bgcolor=\'#ffffff\' cellpadding=\'0\' cellspacing=\'0\' border=\'0\'><tr><td style=\'padding: 36px;\'><p style=\'color: #555555; font-size: 18px; font-family: \'Mulish\', Arial, sans-serif;\'>Dear ${adminName},</p>"+
"<p style=\'color: #555555; font-size: 18px; line-height: 1.6; font-family: \'Mulish\', Arial, sans-serif;\'>Please find the assessor upload status below: "+
"<table width=\'100%\' bgcolor=\'#ffffff\' cellpadding=\'5\' border=\'1\'>${emailTableRows}</table>"+
"</p></td></tr></table></body></html>";

const  performBackgroundTask = async () => {

  try {
    const emailTableRows = new StringBuffer();
    emailTableRows.append("")
    const activeAssessors = await getAllAssessors();
    var bulkUploadData = await getBulkUpload({"where" : {"status": {"_eq": "Pending"}}});
    removeDuplicatesFromBulkUpload(bulkUploadData, emailTableRows, async (error,result,bulkUploadData,emailTableRows,adminId)=>{
      if(error){
        console.error('Error removeDuplicatesFromBulkUpload:', error.message);
        throw error;
      }else{
        const formIdArr = bulkUploadData.filter(obj => obj.hasOwnProperty("application_id")).map(obj => obj["application_id"]);
        const formSubData = await getFormSubmissionsByFormId(formIdArr);  

        await removeInvalidFormSubmissionIds(bulkUploadData,  emailTableRows, adminId, formSubData,(error,result,bulkUploadData,emailTableRows,adminId)=>{
        if(error){
          console.error('Error removeInvalidFormSubmissionIds:', error.message);
          throw error;
        }else{
          executeBulkUpload(bulkUploadData, emailTableRows,adminId, formSubData, activeAssessors, async (error,result,emailTableRows,adminId) => {
          if(error){
            console.error('Error executeBulkUpload:', error.message);
            throw error;
          }else{
            if(adminId !==""){
            const adminDetails = await getAdminDetails(adminId);
            var adminEmail = adminEmailTemplate.replace("${adminName}", adminDetails[0].full_name);   
            adminEmail = adminEmail.replace("${emailTableRows}", emailTableRows.toString());
            const adminEmailData = {
              "recipientEmail":[adminDetails[0].email],
              "emailSubject":"Assessor Upload Status",
              "emailBody":adminEmail
            };
            sendEmailNotification(adminEmailData);
            console.log('Admin notification sent..'+adminDetails[0].email);
          }
          }
        });
      }
      });
    }
    });
    // Process the API response
  } catch (error) {
    console.error('Error making API call:', error.message);
  }
}

  
  // Perform the background task
  performBackgroundTask();