import http from 'k6/http';
import { check, sleep } from 'k6';

const payload = JSON.parse(open('../mock/authLogin.json'));

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
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

export default function () {
  const url = `${BASE_URL}/auth/login`;
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, JSON.stringify(payload), params);

  check(res, {
    'Trạng thái là 200 (Thành công)': (r) => r.status === 200,
    'Phản hồi nhanh hơn 1 giây': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
