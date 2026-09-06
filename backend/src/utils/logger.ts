import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import util from 'util';

// Format để trích xuất file và dòng code từ Error stack
const addCallerInfo = winston.format((info) => {
  if (info instanceof Error) {
    info.stackTrace = info.stack;
    const stackLines = info.stack?.split('\n') || [];
    // Tùy theo nơi Error được tạo ra mà stack sẽ có format khác nhau
    // Thường stackLines[1] chứa thông tin hàm gọi
    const callerLine = stackLines[1] || '';
    const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at (.*):(\d+):(\d+)/);
    if (match) {
      info.file = match[1];
      info.line = parseInt(match[2], 10);
    }
  } else {
    // Nếu không phải Error, giả lập một Error để lấy stack trace
    // Hơi tốn tài nguyên một chút nhưng đáp ứng yêu cầu application.log
    const stackObj: any = {};
    Error.captureStackTrace(stackObj);
    const stackLines = stackObj.stack?.split('\n') || [];
    // Bỏ qua dòng Error, dòng trong logger này, và dòng gọi logger. Thường là dòng thứ 4
    let callerLine = stackLines[3] || '';
    if (callerLine.includes('winston/lib/winston/logger.js')) {
      callerLine = stackLines[4] || '';
    }
    const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at (.*):(\d+):(\d+)/);
    if (match) {
      info.file = match[1];
      info.line = parseInt(match[2], 10);
    }
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
  appLogger.info(util.format(...args));
};

console.error = (...args) => {
  appLogger.error(util.format(...args));
};
