// Define the list of endpoints and their corresponding methods and request bodies (if any)
const endpoints = [
  {
    method: "put",
    route: "/api/rest/acceptFormR1",
    requestBody: ["form_id", "remarks", "date", "noc_fileName", "noc_Path"],
  },
  {
    method: "put",
    route: "/api/rest/acceptFormR2",
    requestBody: [
      "form_id",
      "remarks",
      "date",
      "certificate_fileName",
      "certificate_Path",
    ],
  },
  {
    method: "post",
    route: "/api/rest/addAssessmentSchedule",
    requestBody: ["assessment_schedule"],
  },
  { method: "post", route: "/api/rest/addEvents", requestBody: ["events"] },
  {
    method: "post",
    route: "/api/rest/addInstitute",
    requestBody: [
      "instituteName",
      "district",
      "email",
      "address",
      "course_applied",
    ],
  },
  {
    method: "post",
    route: "/api/rest/addInstituteCourse",
    requestBody: ["institute_course", "institute_form"],
  },
  {
    method: "post",
    route: "/api/rest/addInstitutePoc",
    requestBody: [
      "fname",
      "lname",
      "name",
      "user_id",
      "institute_id",
      "phoneNumber",
    ],
  },
  {
    method: "post",
    route: "/api/rest/addTransaction",
    requestBody: ["transaction_details"],
  },
  {
    method: "post",
    route: "/api/rest/addUsers",
    requestBody: ["assessors", "regulators"],
  },
  {
    method: "post",
    route: "/api/rest/createAdmin",
    requestBody: [
      "user_id",
      "email",
      "fname",
      "lname",
      "fullName",
      "phoneNumber",
    ],
  },
  {
    method: "post",
    route: "/api/rest/createAssessor",
    requestBody: [
      "user_id",
      "email",
      "fname",
      "lname",
      "fullName",
      "phoneNumber",
      "code",
    ],
  },
  {
    method: "post",
    route: "/api/rest/createCourse",
    requestBody: [
      "course_type",
      "course_level",
      "course_name",
      "formObject",
      "application_type",
      "course_desc",
      "assignee",
    ],
  },
  {
    method: "post",
    route: "/api/rest/createForm",
    requestBody: [
      "title",
      "round_no",
      "assignee",
      "course_type",
      "path",
      "labels",
      "application_type",
      "form_status",
      "user_id",
      "file_name",
      "course_level",
      "form_desc",
    ],
  },
  { method: "delete", route: "/api/rest/deleteForm", requestBody: ["form_id"] },
  { method: "delete", route: "/api/rest/deleteSchedule", requestBody: ["id"] },
  { method: "delete", route: "/api/rest/deleteUser", requestBody: ["email"] },
  {
    method: "post",
    route: "/api/rest/duplicateForm",
    requestBody: ["formsData"],
  },
  {
    method: "put",
    route: "/api/rest/editInstitute",
    requestBody: [
      "institute_id",
      "institute_name",
      "institute_email",
      "institute_course",
      "institutePOC_fname",
      "institutePOC_lname",
      "institutePOC_name",
      "institutePOC_phno",
    ],
  },
  {
    method: "post",
    route: "/api/rest/editUser",
    requestBody: ["user_id", "fname", "lname", "phno", "full_name"],
  },
  {
    method: "post",
    route: "/api/rest/filterAssessments",
    requestBody: ["offsetNo", "limit", "condition"],
  },
  {
    method: "post",
    route: "/api/rest/filterDesktopAnalysis",
    requestBody: ["offsetNo", "limit", "condition"],
  },
  {
    method: "post",
    route: "/api/rest/filterForms",
    requestBody: ["offsetNo", "limit", "condition"],
  },
  {
    method: "post",
    route: "/api/rest/filterOGA",
    requestBody: ["offsetNo", "limit", "condition"],
  },
  {
    method: "post",
    route: "/api/rest/filterUsers",
    requestBody: ["offsetNo", "limit", "condition"],
  },
  {
    method: "post",
    route: "/api/rest/getAllAssessors",
    requestBody: ["offsetNo", "limit"],
  },
  {
    method: "post",
    route: "/api/rest/getAllCourses",
    requestBody: ["condition"],
  },
  {
    method: "get",
    route: "/api/rest/getAllRegulatorDeviceId",
  },
  {
    method: "post",
    route: "/api/rest/getAllRegulators",
    requestBody: ["offsetNo", "limit"],
  },
  { method: "post", route: "/api/rest/getApplicant", requestBody: ["user_id"] },
  {
    method: "post",
    route: "/api/rest/getApplicantDeviceId",
    requestBody: ["institute_id"],
  },
  {
    method: "post",
    route: "/api/rest/getApplicationStatus",
    requestBody: ["applicant_id"],
  },
  {
    method: "post",
    route: "/api/rest/getAssessmentSchedule",
    requestBody: ["offsetNo", "limit"],
  },
  { method: "post", route: "/api/rest/getAssessor", requestBody: ["number"] },
  {
    method: "post",
    route: "/api/rest/getCourseType",
    requestBody: ["institute_id"],
  },
  {
    method: "post",
    route: "/api/rest/getCourses",
    requestBody: ["courseType", "courseLevel", "institute_id"],
  },
  {
    method: "post",
    route: "/api/rest/getCoursesOGA",
    requestBody: ["course_applied"],
  },
  {
    method: "post",
    route: "/api/rest/getDesktopAnalysis",
    requestBody: ["offsetNo", "limit"],
  },
  {
    method: "post",
    route: "/api/rest/getDeviceId",
    requestBody: ["user_id"],
  },
  { method: "post", route: "/api/rest/getEvents", requestBody: ["id"] },
  { method: "post", route: "/api/rest/getFormData", requestBody: ["form_id"] },
  {
    method: "post",
    route: "/api/rest/getFormStatus",
    requestBody: ["assessor_id", "date"],
  },
  { method: "get", route: "/api/rest/getFormSubmissions" },
  {
    method: "post",
    route: "/api/rest/getForms",
    requestBody: ["offsetNo", "limit", "formStatus"],
  },
  {
    method: "post",
    route: "/api/rest/getGroundInspectionAnalysis",
    requestBody: ["offsetNo", "limit", "formStatus"],
  },
  {
    method: "post",
    route: "/api/rest/getInstitute",
    requestBody: ["institute_id"],
  },
  {
    method: "post",
    route: "/api/rest/getNOCCertificate",
    requestBody: ["round"],
  },
  {
    method: "post",
    route: "/api/rest/getNotifications",
    requestBody: ["user_id"],
  },
  {
    method: "post",
    route: "/api/rest/getOGAList",
    requestBody: ["applicant_form_id", "submitted_on"],
  },
  {
    method: "post",
    route: "/api/rest/getOGIA",
    requestBody: ["offsetNo", "limit", "formStatus", "round"],
  },
  {
    method: "post",
    route: "/api/rest/getPastInspections",
    requestBody: ["assessor_id", "date"],
  },
  {
    method: "post",
    route: "/api/rest/getPendingInspections",
    requestBody: ["assessor_id", "date"],
  },
  { method: "post", route: "/api/rest/getRegulator", requestBody: ["email"] },
  {
    method: "post",
    route: "/api/rest/getSpecificUser",
    requestBody: ["userId"],
  },
  { method: "post", route: "/api/rest/getStatusLog", requestBody: ["form_id"] },
  {
    method: "post",
    route: "/api/rest/getTodaysInspections",
    requestBody: ["assessor_id", "date"],
  },
  {
    method: "post",
    route: "/api/rest/getUpcomingInspections",
    requestBody: ["assessor_id", "date"],
  },
  {
    method: "post",
    route: "/api/rest/getUpcomingSchedules",
    requestBody: ["today"],
  },
  {
    method: "post",
    route: "/api/rest/getUsersForSchedulingAssessment",
    requestBody: ["todayDate"],
  },
  {
    method: "post",
    route: "/api/rest/getValidation",
    requestBody: ["assessor_id", "institute_id"],
  },
  { method: "post", route: "/api/rest/inProgress", requestBody: ["form_id"] },
  {
    method: "post",
    route: "/api/rest/insertNotifications",
    requestBody: ["notifications"],
  },
  { method: "put", route: "/api/rest/publishForms", requestBody: ["form_id"] },
  {
    method: "put",
    route: "/api/rest/readNotification",
    requestBody: ["notification_id"],
  },
  {
    method: "post",
    route: "/api/rest/rejectForm",
    requestBody: ["form_id", "remarks", "date"],
  },
  {
    method: "post",
    route: "/api/rest/searchAssessments",
    requestBody: ["offsetNo", "limit", "searchString"],
  },
  {
    method: "post",
    route: "/api/rest/searchCourses",
    requestBody: ["searchString"],
  },
  {
    method: "post",
    route: "/api/rest/searchDesktop",
    requestBody: ["offsetNo", "limit", "searchString"],
  },
  {
    method: "post",
    route: "/api/rest/searchForms",
    requestBody: ["offsetNo", "limit", "searchString", "formStatus"],
  },
  {
    method: "post",
    route: "/api/rest/searchNOC",
    requestBody: ["searchString", "round"],
  },
  {
    method: "post",
    route: "/api/rest/searchOGA",
    requestBody: ["offsetNo", "limit", "searchString", "formStatus"],
  },
  {
    method: "post",
    route: "/api/rest/searchUsers",
    requestBody: ["offsetNo", "limit", "searchString"],
  },
  { method: "put", route: "/api/rest/setInvalid", requestBody: ["assessorId"] },
  { method: "put", route: "/api/rest/setValid", requestBody: ["assessorId"] },
  {
    method: "put",
    route: "/api/rest/unpublishForms",
    requestBody: ["form_id"],
  },
  {
    method: "put",
    route: "/api/rest/updateApplicantDeviceId",
    requestBody: ["user_id", "device_id"],
  },
  {
    method: "put",
    route: "/api/rest/updateAssessorDeviceId",
    requestBody: ["user_id", "device_id"],
  },
  {
    method: "post",
    route: "/api/rest/updateChildCode",
    requestBody: ["form_id", "child_code"],
  },
  {
    method: "put",
    route: "/api/rest/updateForm",
    requestBody: ["form_id", "form_status"],
  },
  {
    method: "post",
    route: "/api/rest/updateFormSubmission",
    requestBody: [
      "form_id",
      "form_data",
      "assessment_type",
      "form_name",
      "submission_status",
      "applicant_id",
      "updated_at",
      "form_status",
    ],
  },
  {
    method: "post",
    route: "/api/rest/updateForms",
    requestBody: [
      "title",
      "round_no",
      "assignee",
      "course_type",
      "path",
      "labels",
      "application_type",
      "form_status",
      "user_id",
      "file_name",
      "course_level",
      "form_desc",
      "form_id",
    ],
  },
  {
    method: "post",
    route: "/api/rest/updateParentCode",
    requestBody: ["institute_id", "parent_code"],
  },
  {
    method: "put",
    route: "/api/rest/updatePaymentStatus",
    requestBody: ["form_id", "payment_status"],
  },
  {
    method: "put",
    route: "/api/rest/updateRegulatorDeviceId",
    requestBody: ["user_id", "device_id"],
  },
  {
    method: "post",
    route: "/api/rest/validateAssessor",
    requestBody: [
      "assessorUserId",
      "location",
      "selfieImageURL",
      "schedule_id",
    ],
  },
  { method: "post", route: "/api/rest/viewForm", requestBody: ["form_id"] },
  {
    method: "post",
    route: "/api/rest/viewNotification",
    requestBody: ["notification_id"],
  },
  {
    method: "post",
    route: "/api/rest/viewSchedule",
    requestBody: ["user_id", "date"],
  },
  {
    method: "post",
    route: "/api/rest/getCourseMapping",
    requestBody: ["courseType", "courseLevel"],
  },
  {
    method: "post",
    route: "/api/rest/filterRegulatorByRole",
    requestBody: ["offsetNo", "limit", "role"],
  },
  {
    method: "post",
    route: "/api/rest/getFormSubmissionsByCourseIdApplicantIdFormStatus",
    requestBody: ["course_id", "applicant_id","form_status"]
  },
  {
    method: "post",
    route: "/api/rest/getFormSubmissionCountByStatus",
    requestBody: ["formStatus","offsetNo", "limit"]
  },
  {
    method: "post",
    route: "/api/rest/filterFormSubmissionsByRound",
    requestBody: ["round","offsetNo","limit"]
  },
  {
    method: "post",
    route: "/api/rest/searchDashboardForms",
    requestBody: ["searchString","offsetNo","limit"]
  },
  {
    method: "post",
    route: "/api/rest/filterSubmittedFormByRound",
    requestBody: ["param","offsetNo","limit"]
  }

  //{"round":{"_eq":1},"form_status":{"_eq":"Inspection Scheduled"},"institute":{"district":{"_eq":"Barabanki"}},"submitted_on":{"_gte":"10/12/2023", "_lte":"12/12/2023"}}
];

export default endpoints;
