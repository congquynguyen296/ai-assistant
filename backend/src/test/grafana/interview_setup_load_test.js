import http from 'k6/http';
import { check, sleep } from 'k6';

// Read the mock file from the mock directory
const payload = JSON.parse(open('../mock/interviewSetup.json'));

export const options = {
  stages: [
    { duration: '30s', target: 5 },  // Setup API is heavy, testing with lower VUs
    { duration: '1m', target: 10 },
    { duration: '20s', target: 0 },
  ],
  ext: {
    loadimpact: {
      distribution: {
        virginia: { loadZone: 'amazon:us:ashburn', percent: 100 },
      },
    },
  },
};

const BASE_URL = 'https://ai-assistant-cn4r.onrender.com/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDc4MjcxZGI5MGU5ZTFhODM4ODhjZCIsImlhdCI6MTc5MDE1OTUxMSwiZXhwIjoxNzkwNzY0MzExfQ.kqlT70eWf4woAz4ZZONlN5o065W9I5j4oulPefVYhO0';

export default function () {
  const url = `${BASE_URL}/interviews/setup`;
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  const res = http.post(url, JSON.stringify(payload), params);

  check(res, {
    'Trạng thái là 200 (Thành công) hoặc 201': (r) => r.status === 200 || r.status === 201,
    'Phản hồi nhanh hơn 15 giây (do tạo blueprint)': (r) => r.timings.duration < 15000,
  });

  sleep(2); // Wait longer between setups
}
