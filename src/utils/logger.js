const CLIENT_ID = "4e06fb5e-fccd-4839-86e8-b07d645fa03e"; 
const CLIENT_SECRET = "wqHSARwKeBUSMhyA"; 
const MY_EMAIL = 'shikhar2213088@akgec.acin';
const MY_NAME = 'Shikhar Pandey';
const MY_MOBILE_NO = '9219262774';
const MY_GITHUB_USERNAME = 'ShikharPandey123';
const MY_ROLL_NO = '2200270130160'; 
const MY_ACCESS_CODE = 'uuMbyY'; 

const AUTH_API_URL = 'http://20.244.56.144/evaluation-service/auth';
const LOG_API_URL = 'http://20.244.56.144/evaluation-service/logs';

let accessToken = null;
let tokenExpiresAt = 0;

const STACK_TYPES = ['backend', 'frontend'];
const LEVEL_TYPES = ['debug', 'info', 'warn', 'error', 'fatal'];
const FRONTEND_PACKAGES = ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils'];


async function getAuthToken(){
    if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }
  try{
    const response = await fetch(AUTH_API_URL, {
        method:"POST",
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: MY_EMAIL,
        name: MY_NAME,
        mobileNo: MY_MOBILE_NO,
        githubUsername: MY_GITHUB_USERNAME,
        rollNo: MY_ROLL_NO,
        accessCode: MY_ACCESS_CODE,
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to get auth token: ${response.status} - ${JSON.stringify(errorData)}`);
      return null;
    }
    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 5000; // 5 seconds buffer
    console.log('Successfully obtained new access token.');
    return accessToken;
  }catch (error) {
    console.error('Network error or unexpected error while fetching auth token:', error);
    return null;
  }//wait 2 min//ok// i am pasting the actual credentials //start?//yessss //unable to understand func should i paste it? you check then de/// it should be working...paste it

}

/**
 * Reusable logging function that sends logs to the Test Server.
 * @param {string} stack - 'frontend' or 'backend'. For this app, always 'frontend'.
 * @param {string} level - 'debug', 'info', 'warn', 'error', 'fatal'.
 * @param {string} pkg - The package/module the log originates from (e.g., 'api', 'component', 'page').
 * @param {string} message - The descriptive log message.
 * @param {object} [context={}] - Additional data to include for richer context.
 */
export async function logTestServerEvent(stack, level, pkg, message, context = {}) {
  // Client-side validation for log parameters
  if (!STACK_TYPES.includes(stack)) {
    console.warn(`Invalid 'stack' provided to logger: ${stack}. Must be one of: ${STACK_TYPES.join(', ')}. Log not sent.`);
    return;
  }
  if (!LEVEL_TYPES.includes(level)) {
    console.warn(`Invalid 'level' provided to logger: ${level}. Must be one of: ${LEVEL_TYPES.join(', ')}. Log not sent.`);
    return;
  }
  if (!FRONTEND_PACKAGES.includes(pkg)) {
    console.warn(`Invalid 'package' provided for 'frontend' stack: ${pkg}. Must be one of: ${FRONTEND_PACKAGES.join(', ')}. Log not sent.`);
    return;
  }
  if (!message || typeof message !== 'string') {
    console.warn('Log message is required and must be a string. Log not sent.');
    return;
  }

  const token = await getAuthToken();
  if (!token) {
    console.error('Could not obtain authorization token. Log not sent to Test Server.');
    return;
  }

  const logBody = {
    stack: stack,
    level: level,
    package: pkg,
    message: `${message} | Context: ${JSON.stringify(context)}`,
  };

  try {
    const response = await fetch(LOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(logBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `Failed to send log to Test Server: ${response.status} - ${JSON.stringify(errorData)}`,
        'Log data:', logBody
      );
    } else {
      const successData = await response.json();
      console.log(`Log successfully sent to Test Server: ${successData.logID}`);
    }
  } catch (error) {
    console.error('Network error or unexpected error while sending log to Test Server:', error);
    console.error('Attempted log body:', logBody);
  }
}

export const logFrontendEvent = (level, pkg, message, context = {}) => {
  logTestServerEvent('frontend', level, pkg, message, context);
};

//while pushing in git this folder should be diffrent k?