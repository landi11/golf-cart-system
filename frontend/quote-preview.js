// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    loadOrderPreview();
    loadTemplate();
});

// 加载订单预览数据
function loadOrderPreview() {
    // 从 URL 获取订单ID
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        // 如果没有订单ID，尝试从localStorage获取最新订单
        const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
        if (ordersHistory.length === 0) {
            alert('未找到订单数据');
            window.location.href = 'index.html';
            return;
        }
        // 获取最新订单
        const latestOrder = ordersHistory[0];
        displayOrderData(latestOrder);
    } else {
        // 根据ID获取订单
        const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
        const order = ordersHistory.find(o => o.id === orderId);

        if (!order) {
            alert('订单不存在');
            window.location.href = 'index.html';
            return;
        }

        displayOrderData(order);
    }
}

// 显示订单数据
function displayOrderData(order) {
    // 设置订单号和状态
    document.getElementById('orderNumber').textContent = order.quoteNumber;
    document.getElementById('quoteNumber').textContent = order.quoteNumber;

    const status = order.status || 'pending';
    const statusMap = {
        'pending': '待审核',
        'approved': '已审核',
        'rejected': '已拒绝',
        'completed': '已完成'
    };

    document.getElementById('orderStatus').textContent = statusMap[status];
    document.getElementById('statusText').textContent = statusMap[status];

    // 设置状态样式
    const statusBadge = document.getElementById('orderStatus');
    statusBadge.className = 'status-badge status-' + status;

    // 设置时间
    const createTime = new Date(order.createTime);
    document.getElementById('createTime').textContent = createTime.toLocaleString('zh-CN');

    // 渲染产品列表
    renderOrderProducts(order.products);

    // 显示价格信息
    document.getElementById('subtotal').textContent = '¥' + order.subtotal.toLocaleString();
    document.getElementById('discount').textContent = '-¥' + order.discount.toLocaleString();
    document.getElementById('tax').textContent = '¥' + order.tax.toLocaleString();
    document.getElementById('totalPrice').textContent = '¥' + order.total.toLocaleString();
}

// 渲染订单产品
function renderOrderProducts(products) {
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

// 返回首页
function goBack() {
    window.location.href = 'index.html';
}
