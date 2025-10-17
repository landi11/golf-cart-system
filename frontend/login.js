// 写死的账号密码
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    checkLoginStatus();

    // 监听表单提交
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    // 回车键登录
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
});

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const rememberMe = localStorage.getItem('rememberMe');

    // 如果已登录且选择了记住登录状态，直接跳转
    if (isLoggedIn === 'true' && rememberMe === 'true') {
        window.location.href = 'admin.html';
    }
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // 验证账号密码
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // 登录成功
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
        localStorage.setItem('loginTime', new Date().toISOString());

        // 显示成功消息
        showSuccess('登录成功，正在跳转...');

        // 延迟跳转
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 500);
    } else {
        // 登录失败
        showError('账号或密码错误，请重试');

        // 清空密码框
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

// 显示错误消息
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    errorMessage.style.backgroundColor = '#fee';
    errorMessage.style.borderColor = '#fcc';
    errorMessage.style.color = '#c33';

    // 3秒后自动隐藏
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

// 显示成功消息
function showSuccess(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    errorMessage.style.backgroundColor = '#d4edda';
    errorMessage.style.borderColor = '#c3e6cb';
    errorMessage.style.color = '#155724';

    // 修改图标
    const errorIcon = errorMessage.querySelector('.error-icon');
    errorIcon.textContent = '✅';
}
