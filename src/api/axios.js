import axios from 'axios';

// إنشاء نسخة مخصصة من axios
const api = axios.create({
  baseURL: 'http://his-api.tatwer.tech/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  proxy: {
    host: '192.168.0.103',
    port: 7272
  }
});

// إضافة interceptor للطلبات
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // إذا لم يكن هناك توكن، يمكنك إعادة التوجيه إلى صفحة تسجيل الدخول
      window.location.href = '/login';
      return Promise.reject('No token found');
    }
    console.log('Request config:', config);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// إضافة interceptor للاستجابات
api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 