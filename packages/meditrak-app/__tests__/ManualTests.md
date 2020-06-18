# Meditrak Manual Test Plan

_Rather than providing a large list of specific test cases this document is mostly a formalised list of features and usage flows in the app_

_Actual testing should cover all the steps listed below as well as exploring the many edge cases that may exist for each of the Test Cases_

_During testing, earlier versions of the app should also be tested, to ensure that changes on the server don't break them. We currently support 1.7.81 and above_

### Test Case 1 - Login System

Enter various combinations of email address and password into the login screen

- Invalid email address
- Empty email address
- Invalid password
- Empty password
- Valid email address and password

### Test Case 2 – Create User System

Enter various combinations of values for the various fields in the create user screen

- Valid values for most fields but with at least one empty field
- Valid values for all fields except with an incorrectly formatted email address (e.g. just the word ‘email’)
- Valid values for all fields except with an email address that is already associated with an account (e.g. the email you used for Test Case 00001)
- Valid values for all fields except the passwords do not match
- Valid values for all fields except the password is only one character long (e.g. just ‘a’)
- Valid values for all fields except ‘I agree to terms and conditions’ is not ticked
- Valid values for all fields

### Test Case 3 – Select a country

- Ensure that countries marked “(No access)” are not able to be navigated to
- Ensure that clicking countries you do have access to takes you to the list of facilities for that country
- Ensure that clicking ‘Request access to more countries’ takes you to the ‘Request country access’ screen

### Test Case 4 – Request country access

- Ensure that you can Request Access for countries by selecting both one country at a time and multiple countries
- Clicking “Request Access” without selecting a country should produce an error

### Test Case 5 – Menu

- Clicking the menu in the top right should bring up a list of options
- Ensure all the options function correctly

### Test Case 5.1 - Explore Data

- Ensure the "Explore Data" button on the home screen is working. It should launch an in-app browser which directs to the mobile version of the website

### Test Case 6 – Clinic Assessment

- Items with a clinic name that matches the search should show first followed by items with a matching area name
- Clicking a clinic should navigate you to the dashboard screen for that particular clinic
- Clicking a survey on the dashboard screen for a clinic should open the correct survey

### Test Case 7 – Importing Surveys / Permissions

- Log into the Meditrak app with an Admin account
- Download the ‘Test Survey.xlsx’ document from the Tupaia Import Files folder on Dropbox.
- Import ‘Test Survey.xlsx’ to the app by logging in at https://dev-admin.tupaia.org and navigating to the Surveys page and clicking the Import button. Give it the name ‘Test Survey’ and specify just one country for it to be viewable at (e.g. Demo Land). Specify the Permissions to be ‘Admin’
- Navigate back to the dashboard on the Meditrak app and then sync the app. Click ‘Survey a Facility’ and select the Country that you specified the survey to be available for in the previous step. This survey should be visibile for all clinics in this country
- The survey should not be viewable at countries that you did not specify
- Log into the Meditrak app with non-admin accounts and ensure that this survey is not visible

### Test Case 8 - Survey Question Types

- Make sure you’re testing this on a device or emulator with an on-screen keyboard
- Go through the test survey that was imported in the previous step. Follow the steps explained in the survey itself and ensure that everything is working as described in the survey
- After submitting this survey go to https://dev-admin.tupaia.org/survey-responses and find the survey (sort by Date and it should be the most recent one). Ensure that the recorded responses match what you entered.

### Test Case 9 – Completing Surveys

- Closing a survey before it has been submitted should cause a “Survey in progress...” prompt to appear. Clicking ‘Exit’ in response to this prompt should exit the survey and ‘Continue Survey’ should keep you in the survey with all your progress saved
- If you answer a survey question the answer should be saved unless you exit the survey. If you answer questions on one screen and navigate further through the survey you should be able to click the back button on the bottom navigation menu and see all the answers you’ve already made still saved
- Clicking the bottom navigation menu (the middle part, not the navigation buttons on either side) should bring up a way of navigating directly to a specific set of survey questions in that survey
- You should be able to submit a survey even if you don’t answer all the questions
- If a survey is submitted while there is no internet connection it should be saved in the phones database and will be sent to the server on the next successful sync

### Test Case 10 – Sync

- Clicking the ‘Sync’ button (second from the top right in the header menu) should bring up the Sync screen which displays your last successful sync and gives you the option to manually sync with the server
- Manual sync button should be working when an internet connection is present and should not be able to complete without an internet connection

### Test Case 11 – Fresh Install

- Check to see if all data is sync’d correctly when Tupaia Meditrak is installed for the first time
- Check to ensure that screens aren’t half sync’d if the internet is disconnected partway through the first ever sync

### Test Case 12 – Updates

- Ensure that data remains intact and is still usable when updating from one version to the next
- Ensure that data isn’t retained that should have been removed by an update (for example a survey that has been removed from the database shouldn’t still exist on the app)
- Ensure updates work correctly when updating from various different states in the previous version of the app (for example: updating from a version that was installed but nobody had logged in, updating from versions that were halfway through a survey etc)

### Test Case 13 – Coconuts and Pigs

- When you submit a survey the app should automatically sync and give you a notification that you have received 1 Coconut for submitting a survey
- When you recieve 100 Coconuts you should recieve a notification that you have earned a Pig
- Your dashboard should accurately update with your Coconuts/Pigs after every notification
- If a survey is submitted while there is no internet connection it should be saved in the phones database and will be sent to the server on the next successful sync, also rewarding you with your coconut(s)
- Surveys that have a "Submit and repeat" option should not reward coconuts

### Test Case 14 – Remembering A User’s Country/Facility

- When you logout then log back in the “Survey a Facility” feature should forget the last Country/Facility you have selected and prompt you to “Select a Country”
- When you click “Survey a Facility” from your dashboard it should take you to the most recent Country/Facility that you have selected if you haven’t logged out

### Test Case 15 – Activity Feed

- Logging into the Meditrak app the Activity Feed should be refreshed automatically
- Manually clicking the refresh button for the activity feed should update it with the latest activities
- No Demo Land survey items should appear in the activity feed
- No surveys that require higher than Public privileges should appear in the activity feed
- Ensure browsing the Activity Feed on a phone from a vastly different timezone to the Islands (such as UTC) doesn't negatively impact how survey responses are displayed

### Test Case 16 - Survey Question Validation and Visibility Criteria

- Download the ‘Validation and Visibility Criteria.xlsx’ document from the Tupaia Import Files folder on Dropbox
- Import ‘Validation and Visibility Criteria.xlsx’ to the app by logging in at https://dev-admin.tupaia.org and navigating to the Surveys page and clicking the Import button. Give it the name ‘Validation Test’
- Find this survey in your app and follow the survey instructions to ensure validation and visibility fields are working as expected
- As well as completing the tests documented in the survey, try jumping straight to the submit screen and trying to submit without answering any/all mandatory questions. This should produce an error saying that there are answers with validation errors that need to be fixed
