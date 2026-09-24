import http from 'k6/http';
import { check, sleep } from 'k6';

const payload = JSON.parse(open('../mock/aiChat.json'));

export const options = {
  stages: [
    { duration: '30s', target: 5 },  // AI endpoints are heavy, use lower VUs
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
  const url = `${BASE_URL}/ai/chat`;
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  const res = http.post(url, JSON.stringify(payload), params);

  check(res, {
    'Trạng thái là 200 (Thành công)': (r) => r.status === 200,
    'Phản hồi nhanh hơn 10 giây (AI stream)': (r) => r.timings.duration < 10000,
  });

  sleep(2);
}
