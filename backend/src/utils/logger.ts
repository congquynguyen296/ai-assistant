import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import util from 'util';

const addCallerInfo = winston.format((info) => {
  let stackLines: string[] = [];
  if (info instanceof Error) {
    info.stackTrace = info.stack;
    stackLines = info.stack?.split('\n') || [];
  } else if (info._mockStack) {
    stackLines = (info._mockStack as string).split('\n') || [];
    delete info._mockStack;
  } else {
    const stackObj: any = {};
    Error.captureStackTrace(stackObj);
    stackLines = stackObj.stack?.split('\n') || [];
  }

  // Tìm dòng đầu tiên không thuộc về node_modules/winston, utils/logger.ts, hay internal node
  let callerLine = '';
  for (let i = 1; i < stackLines.length; i++) {
    const line = stackLines[i];
    if (line && !line.includes('winston') && !line.includes('utils/logger.ts') && !line.includes('node:internal')) {
      callerLine = line;
      break;
    }
  }

  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at (.*):(\d+):(\d+)/);
  if (match) {
    info.file = match[1];
    info.line = parseInt(match[2], 10);
  }

  return info;
});

const defaultFormat = winston.format.combine(
  winston.format.timestamp(),
  addCallerInfo(),
  winston.format.json()
);

export const appLogger = winston.createLogger({
  level: 'info',
  format: defaultFormat,
  defaultMeta: { service: 'backend', type: 'application' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Nén .gz sau mỗi ngày
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: 'logs/.application-audit.json', // Chỉnh lại tên file audit cho gọn
      createSymlink: true, // Thử tạo symlink application.log trỏ tới file hiện tại
      symlinkName: 'application.log'
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export const apiLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend', type: 'api' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/api-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: 'logs/.api-audit.json',
      createSymlink: true,
      symlinkName: 'api.log'
    })
  ]
});

// Ghi đè (override) console.log và console.error để tự động bắt tất cả các log 
// ở các file cũ chưa được sửa sang dùng appLogger
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  const stackObj: any = {};
  Error.captureStackTrace(stackObj);
  appLogger.info(util.format(...args), { _mockStack: stackObj.stack });
};

console.error = (...args) => {
  const stackObj: any = {};
  Error.captureStackTrace(stackObj);
  appLogger.error(util.format(...args), { _mockStack: stackObj.stack });
};
