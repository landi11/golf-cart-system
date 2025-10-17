// Toast通知系统
function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const titles = {
        success: '成功',
        error: '错误',
        warning: '警告',
        info: '提示'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${title || titles[type]}</div>
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    loadQuoteData();
    loadTemplate();
    // 自动保存订单到历史记录
    saveOrderToHistory();
});

// 加载报价单数据
function loadQuoteData() {
    // 从 localStorage 获取选配数据
    const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts') || '[]');

    if (selectedProducts.length === 0) {
        showToast('未找到选配数据，请返回重新选择', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    // 生成报价单编号
    const quoteNumber = 'Q' + new Date().getFullYear() +
                        ('0' + (new Date().getMonth() + 1)).slice(-2) +
                        ('0' + new Date().getDate()).slice(-2) +
                        '-' + Date.now().toString().slice(-6);
    document.getElementById('quoteNumber').textContent = quoteNumber;

    // 设置日期
    const today = new Date();
    const dateStr = today.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    document.getElementById('quoteDate').textContent = dateStr;

    // 计算有效期（默认30天）
    const validDays = 30;
    const validUntil = new Date(today.getTime() + validDays * 24 * 60 * 60 * 1000);
    const validStr = validUntil.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    document.getElementById('validUntil').textContent = validStr;

    // 渲染配置明细
    renderQuoteTable(selectedProducts);

    // 计算价格
    calculatePrices(selectedProducts);
}

// 加载模板设置
function loadTemplate() {
    const template = JSON.parse(localStorage.getItem('quoteTemplate') || '{}');

    if (template.companyName) {
        document.getElementById('companyName').textContent = template.companyName;
    }
    if (template.companyPhone) {
        document.getElementById('companyPhone').textContent = template.companyPhone;
        document.getElementById('footerPhone').textContent = template.companyPhone;
    }
    if (template.companyAddress) {
        document.getElementById('companyAddress').textContent = template.companyAddress;
    }
}

// 渲染配置明细表
function renderQuoteTable(products) {
    const tbody = document.getElementById('quoteTableBody');
    tbody.innerHTML = '';

    products.forEach((product, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;">${index + 1}</td>
            <td style="text-align: center;">
                <img src="${product.image}" class="product-thumbnail" alt="${product.name}">
            </td>
            <td>
                <div class="product-name">${product.name}</div>
            </td>
            <td>
                <div class="product-description">${product.description}</div>
            </td>
            <td style="text-align: center; color: #666;">${product.sku}</td>
            <td style="text-align: right;" class="price">¥${product.price.toLocaleString()}</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right;" class="price">¥${product.price.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 计算价格
function calculatePrices(products) {
    // 配置总价
    const subtotal = products.reduce((sum, p) => sum + p.price, 0);

    // 优惠金额（这里可以根据实际业务逻辑计算）
    const discount = 0;

    // 税费（13%增值税）
    const tax = Math.round((subtotal - discount) * 0.13);

    // 最终总价
    const total = subtotal - discount + tax;

    // 更新显示
    document.getElementById('subtotal').textContent = '¥' + subtotal.toLocaleString();
    document.getElementById('discount').textContent = '-¥' + discount.toLocaleString();
    document.getElementById('tax').textContent = '¥' + tax.toLocaleString();
    document.getElementById('totalPrice').textContent = '¥' + total.toLocaleString();
}

// 返回选配页面
function goBack() {
    window.location.href = 'index.html';
}

// 显示加载动画
function showLoading(text = '正在生成...') {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.id = 'loadingOverlay';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${text}</div>
    `;
    document.body.appendChild(loading);
}

// 隐藏加载动画
function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.remove();
    }
}

// 提交报价单到后台
async function submitQuoteToBackend() {
    const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts') || '[]');

    if (selectedProducts.length === 0) {
        showToast('未找到选配数据', 'warning');
        return;
    }

    showLoading('正在提交报价单...');

    try {
        // 计算价格信息
        const subtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
        const discount = 0;
        const tax = Math.round((subtotal - discount) * 0.13);
        const total = subtotal - discount + tax;

        // 构建报价单数据
        const quoteData = {
            quoteNumber: document.getElementById('quoteNumber').textContent,
            createTime: new Date().toISOString(),
            products: selectedProducts,
            productCount: selectedProducts.length,
            subtotal: subtotal,
            discount: discount,
            tax: tax,
            total: total,
            template: JSON.parse(localStorage.getItem('quoteTemplate') || '{}'),
            status: 'pending', // 待审核
            customerInfo: ''
        };

        // 发送到后台API
        const response = await fetch('http://localhost:5000/api/quotes/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quoteData)
        });

        if (response.ok) {
            const result = await response.json();
            hideLoading();

            // 更新状态显示
            document.getElementById('quoteStatus').textContent = '已提交';
            document.getElementById('quoteStatus').style.backgroundColor = '#4CAF50';

            showToast('报价单已提交成功！报价单号：' + quoteData.quoteNumber, 'success', '提交成功');

            // 可选：跳转到查看页面
            // window.location.href = 'quote-view.html?id=' + result.id;
        } else {
            throw new Error('提交失败');
        }

    } catch (error) {
        console.error('提交失败:', error);
        hideLoading();
        showToast('提交失败，请检查网络连接或联系管理员', 'error', '提交失败');
    }
}

// 打印报价单
function printQuote() {
    window.print();
}

// 保存订单到历史记录
function saveOrderToHistory() {
    const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts') || '[]');

    if (selectedProducts.length === 0) {
        return;
    }

    // 计算订单总额
    const subtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    const discount = 0;
    const tax = Math.round((subtotal - discount) * 0.13);
    const total = subtotal - discount + tax;

    // 生成订单对象
    const order = {
        id: 'ORD' + Date.now(),
        quoteNumber: document.getElementById('quoteNumber').textContent,
        createTime: new Date().toISOString(),
        products: selectedProducts,
        productCount: selectedProducts.length,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        customerInfo: '', // 可以后续添加客户信息功能
        template: JSON.parse(localStorage.getItem('quoteTemplate') || '{}')
    };

    // 获取现有订单历史
    const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');

    // 添加新订单到历史记录
    ordersHistory.unshift(order); // 添加到数组开头，最新的在前面

    // 保存到 localStorage
    localStorage.setItem('ordersHistory', JSON.stringify(ordersHistory));

}
