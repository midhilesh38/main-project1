# RMS Regression Test Checklist

## 1. Document Information

| Field            | Details                                      |
| ---------------- | -------------------------------------------- |
| Project          | Repair & Maintenance Management System (RMS) |
| Document         | Regression Test Checklist                    |
| Team             | Team 5 – QA & Git Workflow                   |
| QA Coordinator   | Balaji R                                     |
| Branch           | `docs/qa-regression-checklist`               |
| Regression Cycle | Sprint 1                                     |
| Status           | Prepared for Execution                       |

---

## 2. Objective

Create a repeatable regression-test checklist for the Repair & Maintenance Management System (RMS).

The checklist validates the complete complaint-to-closure workflow and ensures that important functionality continues to work after changes.

---

## 3. Required Coverage

The regression checklist covers:

1. Login and role selection
2. Complaint form validation and registration
3. HOD approval
4. Electrician assignment
5. My Jobs and Start Work
6. ATR submission
7. HOD verification
8. Ticket closure
9. Allocated Work Tracking
10. Status consistency
11. Duplicate-submit protection
12. Browser console errors

---

# 4. Test Execution Checklist

> **Note:** `Actual Result`, `Pass/Fail`, `Tester`, `Date`, `Evidence Link`, and `Related Issue` are completed during the regression test execution.

---

## Module 1 – Login and Role Selection

### TC-001 – Valid Supervisor Login

| Field           | Details                                                                              |
| --------------- | ------------------------------------------------------------------------------------ |
| Test ID         | TC-001                                                                               |
| Module          | Login & Role Selection                                                               |
| Preconditions   | Valid Supervisor account exists                                                      |
| Steps           | 1. Open RMS login page.<br>2. Enter valid Supervisor credentials.<br>3. Click Login. |
| Expected Result | Supervisor successfully logs in and is redirected to the Supervisor dashboard.       |
| Actual Result   |                                                                                      |
| Pass/Fail       |                                                                                      |
| Tester          |                                                                                      |
| Date            |                                                                                      |
| Evidence Link   |                                                                                      |
| Related Issue   |                                                                                      |

### TC-002 – Valid HOD Login

| Field           | Details                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| Test ID         | TC-002                                                                    |
| Module          | Login & Role Selection                                                    |
| Preconditions   | Valid HOD account exists                                                  |
| Steps           | 1. Open login page.<br>2. Enter valid HOD credentials.<br>3. Click Login. |
| Expected Result | HOD successfully logs in and sees the HOD dashboard.                      |
| Actual Result   |                                                                           |
| Pass/Fail       |                                                                           |
| Tester          |                                                                           |
| Date            |                                                                           |
| Evidence Link   |                                                                           |
| Related Issue   |                                                                           |

### TC-003 – Valid Electrician Head Login

| Field           | Details                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| Test ID         | TC-003                                                                        |
| Module          | Login & Role Selection                                                        |
| Preconditions   | Valid Electrician Head account exists                                         |
| Steps           | 1. Enter valid credentials.<br>2. Click Login.                                |
| Expected Result | Electrician Head successfully logs in and sees authorized dashboard/features. |
| Actual Result   |                                                                               |
| Pass/Fail       |                                                                               |
| Tester          |                                                                               |
| Date            |                                                                               |
| Evidence Link   |                                                                               |
| Related Issue   |                                                                               |

### TC-004 – Valid Electrician Login

| Field           | Details                                                                              |
| --------------- | ------------------------------------------------------------------------------------ |
| Test ID         | TC-004                                                                               |
| Module          | Login & Role Selection                                                               |
| Preconditions   | Valid Electrician account exists                                                     |
| Steps           | 1. Enter valid credentials.<br>2. Click Login.                                       |
| Expected Result | Electrician successfully logs in and can access authorized features such as My Jobs. |
| Actual Result   |                                                                                      |
| Pass/Fail       |                                                                                      |
| Tester          |                                                                                      |
| Date            |                                                                                      |
| Evidence Link   |                                                                                      |
| Related Issue   |                                                                                      |

### TC-005 – Valid IQAC Login

| Field           | Details                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| Test ID         | TC-005                                                                                   |
| Module          | Login & Role Selection                                                                   |
| Preconditions   | Valid IQAC account exists                                                                |
| Steps           | 1. Enter valid IQAC credentials.<br>2. Click Login.                                      |
| Expected Result | IQAC user successfully logs in and can access authorized monitoring/audit functionality. |
| Actual Result   |                                                                                          |
| Pass/Fail       |                                                                                          |
| Tester          |                                                                                          |
| Date            |                                                                                          |
| Evidence Link   |                                                                                          |
| Related Issue   |                                                                                          |

### TC-006 – Invalid Login

| Field           | Details                                                          |
| --------------- | ---------------------------------------------------------------- |
| Test ID         | TC-006                                                           |
| Module          | Login & Role Selection                                           |
| Preconditions   | Login page is available                                          |
| Steps           | 1. Enter invalid username/password.<br>2. Click Login.           |
| Expected Result | Login is rejected and an appropriate error message is displayed. |
| Actual Result   |                                                                  |
| Pass/Fail       |                                                                  |
| Tester          |                                                                  |
| Date            |                                                                  |
| Evidence Link   |                                                                  |
| Related Issue   |                                                                  |

### TC-007 – Role-Based Access Control

| Field           | Details                                                                              |
| --------------- | ------------------------------------------------------------------------------------ |
| Test ID         | TC-007                                                                               |
| Module          | Login & Role Selection                                                               |
| Preconditions   | Users with different roles are available                                             |
| Steps           | 1. Login with one role.<br>2. Try to access another role's restricted functionality. |
| Expected Result | Unauthorized functionality is inaccessible and access is denied appropriately.       |
| Actual Result   |                                                                                      |
| Pass/Fail       |                                                                                      |
| Tester          |                                                                                      |
| Date            |                                                                                      |
| Evidence Link   |                                                                                      |
| Related Issue   |                                                                                      |

---

# Module 2 – Complaint Registration

### TC-008 – Open Complaint Form

| Field           | Details                                                           |
| --------------- | ----------------------------------------------------------------- |
| Test ID         | TC-008                                                            |
| Module          | Complaint Registration                                            |
| Preconditions   | Supervisor is logged in                                           |
| Steps           | 1. Navigate to complaint registration.<br>2. Open complaint form. |
| Expected Result | Complaint form opens successfully with required fields available. |
| Actual Result   |                                                                   |
| Pass/Fail       |                                                                   |
| Tester          |                                                                   |
| Date            |                                                                   |
| Evidence Link   |                                                                   |
| Related Issue   |                                                                   |

### TC-009 – Submit Valid Complaint

| Field           | Details                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Test ID         | TC-009                                                                                                                               |
| Module          | Complaint Registration                                                                                                               |
| Preconditions   | Supervisor is logged in and complaint form is open                                                                                   |
| Steps           | 1. Enter title.<br>2. Enter description.<br>3. Select category.<br>4. Enter location.<br>5. Select priority.<br>6. Submit complaint. |
| Expected Result | Complaint is successfully registered and a ticket/complaint ID is generated.                                                         |
| Actual Result   |                                                                                                                                      |
| Pass/Fail       |                                                                                                                                      |
| Tester          |                                                                                                                                      |
| Date            |                                                                                                                                      |
| Evidence Link   |                                                                                                                                      |
| Related Issue   |                                                                                                                                      |

### TC-010 – Required Field Validation

| Field           | Details                                                                                |
| --------------- | -------------------------------------------------------------------------------------- |
| Test ID         | TC-010                                                                                 |
| Module          | Complaint Registration                                                                 |
| Preconditions   | Supervisor is logged in                                                                |
| Steps           | 1. Open complaint form.<br>2. Leave one or more required fields empty.<br>3. Submit.   |
| Expected Result | Form prevents submission and displays validation messages for missing required fields. |
| Actual Result   |                                                                                        |
| Pass/Fail       |                                                                                        |
| Tester          |                                                                                        |
| Date            |                                                                                        |
| Evidence Link   |                                                                                        |
| Related Issue   |                                                                                        |

### TC-011 – Invalid Complaint Data

| Field           | Details                                                                    |
| --------------- | -------------------------------------------------------------------------- |
| Test ID         | TC-011                                                                     |
| Module          | Complaint Registration                                                     |
| Preconditions   | Complaint form is open                                                     |
| Steps           | 1. Enter invalid or unacceptable values in complaint fields.<br>2. Submit. |
| Expected Result | Invalid data is rejected with appropriate validation feedback.             |
| Actual Result   |                                                                            |
| Pass/Fail       |                                                                            |
| Tester          |                                                                            |
| Date            |                                                                            |
| Evidence Link   |                                                                            |
| Related Issue   |                                                                            |

### TC-012 – Verify Initial Complaint Status

| Field           | Details                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| Test ID         | TC-012                                                                    |
| Module          | Complaint Registration                                                    |
| Preconditions   | Valid complaint has been submitted                                        |
| Steps           | 1. Submit a complaint.<br>2. Open complaint details.                      |
| Expected Result | Newly registered complaint receives the expected initial workflow status. |
| Actual Result   |                                                                           |
| Pass/Fail       |                                                                           |
| Tester          |                                                                           |
| Date            |                                                                           |
| Evidence Link   |                                                                           |
| Related Issue   |                                                                           |

### TC-013 – Verify Ticket ID

| Field           | Details                                                                              |
| --------------- | ------------------------------------------------------------------------------------ |
| Test ID         | TC-013                                                                               |
| Module          | Complaint Registration                                                               |
| Preconditions   | Complaint has been successfully registered                                           |
| Steps           | 1. Open the newly created complaint.<br>2. Check ticket/complaint identifier.        |
| Expected Result | A unique ticket/complaint ID is generated and remains associated with the complaint. |
| Actual Result   |                                                                                      |
| Pass/Fail       |                                                                                      |
| Tester          |                                                                                      |
| Date            |                                                                                      |
| Evidence Link   |                                                                                      |
| Related Issue   |                                                                                      |

### TC-014 – Duplicate Complaint Submission

| Field           | Details                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| Test ID         | TC-014                                                                             |
| Module          | Complaint Registration                                                             |
| Preconditions   | Complaint form is open                                                             |
| Steps           | 1. Fill in valid complaint details.<br>2. Click Submit multiple times rapidly.     |
| Expected Result | Only one complaint is created; duplicate requests are prevented or safely handled. |
| Actual Result   |                                                                                    |
| Pass/Fail       |                                                                                    |
| Tester          |                                                                                    |
| Date            |                                                                                    |
| Evidence Link   |                                                                                    |
| Related Issue   |                                                                                    |

---

# Module 3 – HOD Approval

### TC-015 – HOD Views Pending Complaint

| Field           | Details                                                           |
| --------------- | ----------------------------------------------------------------- |
| Test ID         | TC-015                                                            |
| Module          | HOD Approval                                                      |
| Preconditions   | A complaint has been registered and is pending HOD review         |
| Steps           | 1. Login as HOD.<br>2. Navigate to pending complaints.            |
| Expected Result | The pending complaint is visible to the HOD with correct details. |
| Actual Result   |                                                                   |
| Pass/Fail       |                                                                   |
| Tester          |                                                                   |
| Date            |                                                                   |
| Evidence Link   |                                                                   |
| Related Issue   |                                                                   |

### TC-016 – HOD Approves Complaint

| Field           | Details                                                           |
| --------------- | ----------------------------------------------------------------- |
| Test ID         | TC-016                                                            |
| Module          | HOD Approval                                                      |
| Preconditions   | Pending complaint is available                                    |
| Steps           | 1. Open complaint.<br>2. Review details.<br>3. Approve complaint. |
| Expected Result | Complaint is approved and moves to the next workflow stage.       |
| Actual Result   |                                                                   |
| Pass/Fail       |                                                                   |
| Tester          |                                                                   |
| Date            |                                                                   |
| Evidence Link   |                                                                   |
| Related Issue   |                                                                   |

### TC-017 – HOD Rejects Complaint

| Field           | Details                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Test ID         | TC-017                                                                                              |
| Module          | HOD Approval                                                                                        |
| Preconditions   | Pending complaint is available                                                                      |
| Steps           | 1. Open complaint.<br>2. Select Reject.<br>3. Provide required reason if applicable.<br>4. Confirm. |
| Expected Result | Complaint is rejected and the workflow reflects the rejection correctly.                            |
| Actual Result   |                                                                                                     |
| Pass/Fail       |                                                                                                     |
| Tester          |                                                                                                     |
| Date            |                                                                                                     |
| Evidence Link   |                                                                                                     |
| Related Issue   |                                                                                                     |

### TC-018 – Approval Data Consistency

| Field           | Details                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Test ID         | TC-018                                                                                                                  |
| Module          | HOD Approval                                                                                                            |
| Preconditions   | Complaint has been approved                                                                                             |
| Steps           | 1. Open approved complaint.<br>2. Verify ticket ID, reporter, description, category, priority and approval information. |
| Expected Result | Complaint information remains consistent after approval.                                                                |
| Actual Result   |                                                                                                                         |
| Pass/Fail       |                                                                                                                         |
| Tester          |                                                                                                                         |
| Date            |                                                                                                                         |
| Evidence Link   |                                                                                                                         |
| Related Issue   |                                                                                                                         |

---

# Module 4 – Electrician Assignment

### TC-019 – Electrician Head Views Approved Complaint

| Field           | Details                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| Test ID         | TC-019                                                                   |
| Module          | Electrician Assignment                                                   |
| Preconditions   | Complaint has been approved by HOD                                       |
| Steps           | 1. Login as Electrician Head.<br>2. Open approved complaints/work queue. |
| Expected Result | Approved complaint is available for assignment.                          |
| Actual Result   |                                                                          |
| Pass/Fail       |                                                                          |
| Tester          |                                                                          |
| Date            |                                                                          |
| Evidence Link   |                                                                          |
| Related Issue   |                                                                          |

### TC-020 – Assign Electrician

| Field           | Details                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Test ID         | TC-020                                                                                          |
| Module          | Electrician Assignment                                                                          |
| Preconditions   | Approved complaint is available                                                                 |
| Steps           | 1. Open complaint.<br>2. Select an electrician.<br>3. Assign the job.<br>4. Confirm assignment. |
| Expected Result | Complaint is successfully assigned to the selected electrician.                                 |
| Actual Result   |                                                                                                 |
| Pass/Fail       |                                                                                                 |
| Tester          |                                                                                                 |
| Date            |                                                                                                 |
| Evidence Link   |                                                                                                 |
| Related Issue   |                                                                                                 |

### TC-021 – Verify Assigned Electrician

| Field           | Details                                                        |
| --------------- | -------------------------------------------------------------- |
| Test ID         | TC-021                                                         |
| Module          | Electrician Assignment                                         |
| Preconditions   | Complaint has been assigned                                    |
| Steps           | 1. Open complaint details.<br>2. Check assignment information. |
| Expected Result | Correct electrician is displayed as the assignee.              |
| Actual Result   |                                                                |
| Pass/Fail       |                                                                |
| Tester          |                                                                |
| Date            |                                                                |
| Evidence Link   |                                                                |
| Related Issue   |                                                                |

### TC-022 – Verify Assignment Status

| Field           | Details                                                      |
| --------------- | ------------------------------------------------------------ |
| Test ID         | TC-022                                                       |
| Module          | Electrician Assignment                                       |
| Preconditions   | Complaint has been assigned                                  |
| Steps           | 1. Open complaint/work details.<br>2. Check workflow status. |
| Expected Result | Status correctly reflects the assignment stage.              |
| Actual Result   |                                                              |
| Pass/Fail       |                                                              |
| Tester          |                                                              |
| Date            |                                                              |
| Evidence Link   |                                                              |
| Related Issue   |                                                              |

---

# Module 5 – My Jobs and Start Work

### TC-023 – Electrician Views My Jobs

| Field           | Details                                               |
| --------------- | ----------------------------------------------------- |
| Test ID         | TC-023                                                |
| Module          | My Jobs & Start Work                                  |
| Preconditions   | Job has been assigned to logged-in electrician        |
| Steps           | 1. Login as assigned electrician.<br>2. Open My Jobs. |
| Expected Result | Assigned job appears in My Jobs.                      |
| Actual Result   |                                                       |
| Pass/Fail       |                                                       |
| Tester          |                                                       |
| Date            |                                                       |
| Evidence Link   |                                                       |
| Related Issue   |                                                       |

### TC-024 – Unassigned/Other Electrician Job Not Shown

| Field           | Details                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------- |
| Test ID         | TC-024                                                                                       |
| Module          | My Jobs & Start Work                                                                         |
| Preconditions   | Jobs exist for multiple electricians                                                         |
| Steps           | 1. Login as Electrician A.<br>2. Open My Jobs.                                               |
| Expected Result | Electrician A sees only jobs assigned to them and not another electrician's restricted jobs. |
| Actual Result   |                                                                                              |
| Pass/Fail       |                                                                                              |
| Tester          |                                                                                              |
| Date            |                                                                                              |
| Evidence Link   |                                                                                              |
| Related Issue   |                                                                                              |

### TC-025 – Start Assigned Work

| Field           | Details                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Test ID         | TC-025                                                                                         |
| Module          | My Jobs & Start Work                                                                           |
| Preconditions   | Job is assigned to logged-in electrician                                                       |
| Steps           | 1. Open assigned job.<br>2. Click Start Work.<br>3. Confirm if required.                       |
| Expected Result | Work starts successfully and the ticket status changes to the expected work-in-progress stage. |
| Actual Result   |                                                                                                |
| Pass/Fail       |                                                                                                |
| Tester          |                                                                                                |
| Date            |                                                                                                |
| Evidence Link   |                                                                                                |
| Related Issue   |                                                                                                |

### TC-026 – Prevent Invalid Work Start

| Field           | Details                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| Test ID         | TC-026                                                                      |
| Module          | My Jobs & Start Work                                                        |
| Preconditions   | Job is not assigned to the logged-in electrician or is in an invalid status |
| Steps           | 1. Attempt to start work on the invalid job.                                |
| Expected Result | System prevents unauthorized/invalid work start.                            |
| Actual Result   |                                                                             |
| Pass/Fail       |                                                                             |
| Tester          |                                                                             |
| Date            |                                                                             |
| Evidence Link   |                                                                             |
| Related Issue   |                                                                             |

---

# Module 6 – ATR Submission

### TC-027 – Open ATR/Completion Form

| Field           | Details                                                      |
| --------------- | ------------------------------------------------------------ |
| Test ID         | TC-027                                                       |
| Module          | ATR Submission                                               |
| Preconditions   | Electrician has started assigned work                        |
| Steps           | 1. Open active job.<br>2. Navigate to ATR/completion form.   |
| Expected Result | ATR/completion form opens successfully with required fields. |
| Actual Result   |                                                              |
| Pass/Fail       |                                                              |
| Tester          |                                                              |
| Date            |                                                              |
| Evidence Link   |                                                              |
| Related Issue   |                                                              |

### TC-028 – Submit Valid ATR

| Field           | Details                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| Test ID         | TC-028                                                                                      |
| Module          | ATR Submission                                                                              |
| Preconditions   | Active job exists and ATR form is available                                                 |
| Steps           | 1. Enter required completion information.<br>2. Add evidence if required.<br>3. Submit ATR. |
| Expected Result | ATR is successfully submitted and ticket moves to the expected verification stage.          |
| Actual Result   |                                                                                             |
| Pass/Fail       |                                                                                             |
| Tester          |                                                                                             |
| Date            |                                                                                             |
| Evidence Link   |                                                                                             |
| Related Issue   |                                                                                             |

### TC-029 – ATR Validation

| Field           | Details                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| Test ID         | TC-029                                                                  |
| Module          | ATR Submission                                                          |
| Preconditions   | ATR form is open                                                        |
| Steps           | 1. Leave required ATR fields empty or enter invalid data.<br>2. Submit. |
| Expected Result | Submission is prevented and validation messages are displayed.          |
| Actual Result   |                                                                         |
| Pass/Fail       |                                                                         |
| Tester          |                                                                         |
| Date            |                                                                         |
| Evidence Link   |                                                                         |
| Related Issue   |                                                                         |

### TC-030 – Duplicate ATR Submission

| Field           | Details                                                                |
| --------------- | ---------------------------------------------------------------------- |
| Test ID         | TC-030                                                                 |
| Module          | ATR Submission                                                         |
| Preconditions   | Valid ATR is ready for submission                                      |
| Steps           | 1. Submit ATR.<br>2. Immediately attempt to submit the same ATR again. |
| Expected Result | Duplicate ATR records/submissions are prevented.                       |
| Actual Result   |                                                                        |
| Pass/Fail       |                                                                        |
| Tester          |                                                                        |
| Date            |                                                                        |
| Evidence Link   |                                                                        |
| Related Issue   |                                                                        |

---

# Module 7 – HOD Verification

### TC-031 – HOD Views Completed Work

| Field           | Details                                                          |
| --------------- | ---------------------------------------------------------------- |
| Test ID         | TC-031                                                           |
| Module          | HOD Verification                                                 |
| Preconditions   | Electrician has submitted ATR                                    |
| Steps           | 1. Login as HOD.<br>2. Open completed/pending verification work. |
| Expected Result | Completed work and submitted ATR are visible to the HOD.         |
| Actual Result   |                                                                  |
| Pass/Fail       |                                                                  |
| Tester          |                                                                  |
| Date            |                                                                  |
| Evidence Link   |                                                                  |
| Related Issue   |                                                                  |

### TC-032 – HOD Verifies ATR

| Field           | Details                                                                               |
| --------------- | ------------------------------------------------------------------------------------- |
| Test ID         | TC-032                                                                                |
| Module          | HOD Verification                                                                      |
| Preconditions   | Completed work is awaiting HOD verification                                           |
| Steps           | 1. Open completed work.<br>2. Review ATR and evidence.<br>3. Verify/approve the work. |
| Expected Result | Work is successfully verified and moves toward ticket closure.                        |
| Actual Result   |                                                                                       |
| Pass/Fail       |                                                                                       |
| Tester          |                                                                                       |
| Date            |                                                                                       |
| Evidence Link   |                                                                                       |
| Related Issue   |                                                                                       |

### TC-033 – HOD Sends Work Back for Rework

| Field           | Details                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Test ID         | TC-033                                                                                                   |
| Module          | HOD Verification                                                                                         |
| Preconditions   | Completed work is available for verification and rework is supported                                     |
| Steps           | 1. Open completed work.<br>2. Select Send Back/Rework if available.<br>3. Provide reason.<br>4. Confirm. |
| Expected Result | Work is returned to the appropriate previous stage with the reason recorded.                             |
| Actual Result   |                                                                                                          |
| Pass/Fail       |                                                                                                          |
| Tester          |                                                                                                          |
| Date            |                                                                                                          |
| Evidence Link   |                                                                                                          |
| Related Issue   |                                                                                                          |

---

# Module 8 – Ticket Closure

### TC-034 – Close Verified Ticket

| Field           | Details                                                               |
| --------------- | --------------------------------------------------------------------- |
| Test ID         | TC-034                                                                |
| Module          | Ticket Closure                                                        |
| Preconditions   | Work has passed the required verification                             |
| Steps           | 1. Open verified ticket.<br>2. Perform the available closure action.  |
| Expected Result | Ticket is successfully closed and receives the correct closed status. |
| Actual Result   |                                                                       |
| Pass/Fail       |                                                                       |
| Tester          |                                                                       |
| Date            |                                                                       |
| Evidence Link   |                                                                       |
| Related Issue   |                                                                       |

### TC-035 – Verify Closed Ticket Details

| Field           | Details                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Test ID         | TC-035                                                                                                          |
| Module          | Ticket Closure                                                                                                  |
| Preconditions   | Ticket is closed                                                                                                |
| Steps           | 1. Open closed ticket.<br>2. Verify ticket ID, complaint details, assignment, ATR and verification information. |
| Expected Result | Closed ticket retains correct historical information and status.                                                |
| Actual Result   |                                                                                                                 |
| Pass/Fail       |                                                                                                                 |
| Tester          |                                                                                                                 |
| Date            |                                                                                                                 |
| Evidence Link   |                                                                                                                 |
| Related Issue   |                                                                                                                 |

---

# Module 9 – Allocated Work Tracking

### TC-036 – View Allocated Work

| Field           | Details                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| Test ID         | TC-036                                                                      |
| Module          | Allocated Work Tracking                                                     |
| Preconditions   | Work has been assigned                                                      |
| Steps           | 1. Login with authorized role.<br>2. Open allocated/assigned work tracking. |
| Expected Result | Allocated work is displayed correctly.                                      |
| Actual Result   |                                                                             |
| Pass/Fail       |                                                                             |
| Tester          |                                                                             |
| Date            |                                                                             |
| Evidence Link   |                                                                             |
| Related Issue   |                                                                             |

### TC-037 – Verify Work Tracking Information

| Field           | Details                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| Test ID         | TC-037                                                                        |
| Module          | Allocated Work Tracking                                                       |
| Preconditions   | At least one assigned job exists                                              |
| Steps           | 1. Open work tracking.<br>2. Verify ticket ID, assignee, priority and status. |
| Expected Result | Work tracking information matches the actual ticket information.              |
| Actual Result   |                                                                               |
| Pass/Fail       |                                                                               |
| Tester          |                                                                               |
| Date            |                                                                               |
| Evidence Link   |                                                                               |
| Related Issue   |                                                                               |

---

# Module 10 – Status Consistency

### TC-038 – Verify Status Through Complete Workflow

| Field           | Details                                                                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test ID         | TC-038                                                                                                                                                                                               |
| Module          | Status Consistency                                                                                                                                                                                   |
| Preconditions   | Test complaint can progress through the complete workflow                                                                                                                                            |
| Steps           | 1. Register complaint.<br>2. HOD reviews/approves.<br>3. Electrician Head assigns electrician.<br>4. Electrician starts work.<br>5. Electrician submits ATR.<br>6. HOD verifies.<br>7. Close ticket. |
| Expected Result | Ticket status changes correctly at each workflow stage and remains consistent across dashboards/details.                                                                                             |
| Actual Result   |                                                                                                                                                                                                      |
| Pass/Fail       |                                                                                                                                                                                                      |
| Tester          |                                                                                                                                                                                                      |
| Date            |                                                                                                                                                                                                      |
| Evidence Link   |                                                                                                                                                                                                      |
| Related Issue   |                                                                                                                                                                                                      |

---

# Module 11 – Duplicate-Submit Protection

### TC-039 – Duplicate Actions Across Workflow

| Field           | Details                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| Test ID         | TC-039                                                                                                               |
| Module          | Duplicate-Submit Protection                                                                                          |
| Preconditions   | User has permission to perform workflow actions                                                                      |
| Steps           | 1. Perform an action such as approve, assign, start work, submit ATR or close.<br>2. Rapidly repeat the same action. |
| Expected Result | System processes the action only once and prevents duplicate records/state changes.                                  |
| Actual Result   |                                                                                                                      |
| Pass/Fail       |                                                                                                                      |
| Tester          |                                                                                                                      |
| Date            |                                                                                                                      |
| Evidence Link   |                                                                                                                      |
| Related Issue   |                                                                                                                      |

---

# Module 12 – Browser Console Errors

### TC-040 – Check Browser Console Errors

| Field           | Details                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test ID         | TC-040                                                                                                                                            |
| Module          | Browser Console Errors                                                                                                                            |
| Preconditions   | RMS application is accessible                                                                                                                     |
| Steps           | 1. Open browser Developer Tools.<br>2. Open Console.<br>3. Execute the major workflow from login through closure.<br>4. Monitor console messages. |
| Expected Result | No unexpected JavaScript errors, failed API requests or critical console errors occur during the workflow.                                        |
| Actual Result   |                                                                                                                                                   |
| Pass/Fail       |                                                                                                                                                   |
| Tester          |                                                                                                                                                   |
| Date            |                                                                                                                                                   |
| Evidence Link   |                                                                                                                                                   |
| Related Issue   |                                                                                                                                                   |

---

# 5. Role Coverage

| Role             | Covered Test Cases                                |
| ---------------- | ------------------------------------------------- |
| Supervisor       | TC-001, TC-008 to TC-014                          |
| HOD              | TC-002, TC-015 to TC-018, TC-031 to TC-035        |
| Electrician Head | TC-003, TC-019 to TC-022, TC-036 to TC-037        |
| Electrician      | TC-004, TC-023 to TC-030                          |
| IQAC             | TC-005 and role-based access validation in TC-007 |

---

# 6. Full Workflow Coverage

The regression cycle validates the following workflow:

```text
Supervisor
    |
    v
Complaint Registration
    |
    v
Pending HOD Approval
    |
    v
HOD Approval
    |
    v
Electrician Head Assignment
    |
    v
Electrician - My Jobs
    |
    v
Start Work
    |
    v
ATR Submission
    |
    v
HOD Verification
    |
    v
Ticket Closure
```

---

# 7. Regression Execution Summary

| Metric                | Result   |
| --------------------- | -------- |
| Total Test Cases      | 40       |
| Passed                |          |
| Failed                |          |
| Blocked               |          |
| Not Tested            |          |
| Defects Created       |          |
| Regression Cycle Date |          |
| QA Coordinator        | Balaji R |

---

# 8. Defect Reference

Defects found during regression testing must be created as GitHub Issues.

| Issue ID | Test ID | Defect Summary | Severity | Status | Issue Link |
| -------- | ------- | -------------- | -------- | ------ | ---------- |
|          |         |                |          |        |            |
|          |         |                |          |        |            |
|          |         |                |          |        |            |

---

# 9. Test Evidence Reference

Evidence may include screenshots, screen recordings, API responses, or other relevant proof.

| Evidence ID | Test ID | Description | Evidence Link |
| ----------- | ------- | ----------- | ------------- |
|             |         |             |               |
|             |         |             |               |
|             |         |             |               |

---

# 10. Acceptance Criteria

* [ ] Checklist covers all five required roles.
* [ ] Checklist covers the full complaint-to-closure workflow.
* [ ] QA team runs one complete regression cycle.
* [ ] Defects found during testing are created as GitHub Issues.
* [ ] Test evidence is linked from the Club Hub task.
* [ ] Checklist is committed to the assigned Git branch.
* [ ] Pull Request is created for review.
* [ ] PR is reviewed and approved.
* [ ] PR is merged into `develop`.
* [ ] Regression results are recorded after execution.

---

# 11. QA Sign-Off

| Role           | Name               | Status | Date |
| -------------- | ------------------ | ------ | ---- |
| QA Coordinator | Balaji R           |        |      |
| QA Tester      | Gautham E          |        |      |
| QA Tester      | Vigesh M           |        |      |
| QA Tester      | Rhithick Roshan LA |        |      |
| QA Tester      | J.S.KRITHIKA       |        |      |

---

## Document Status

**Prepared:** Sprint 1
**Purpose:** Repeatable regression testing for RMS
**Owner:**  QA & Git Workflow
