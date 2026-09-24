import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
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
  const url = `${BASE_URL}/documents`;
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  const res = http.get(url, params);

  check(res, {
    'Trạng thái là 200 (Thành công)': (r) => r.status === 200,
    'Phản hồi nhanh hơn 1 giây': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
