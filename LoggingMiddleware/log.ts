import axios from 'axios';

const LOGGING_URL = 'process.env.LOGGING_URI'; 
const LOGGING_AUTH_TOKEN = 'process.env.LOGGING_AUTH_TOKEN'; 

export interface LogFields {
  stack: 'backend' | 'frontend';
  level: 'fatal' | 'info' | 'warn' | 'error' | 'debug';
  package: 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';
  message: string;
}


export async function sendLog(logFields: LogFields): Promise<void> {
  try {
    await axios.post(
      LOGGING_URL,
      logFields,
      {
        headers: {
          'Authorization': `Bearer ${LOGGING_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to send log:', error);
  }
} 