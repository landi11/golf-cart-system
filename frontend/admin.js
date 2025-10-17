// 全局数据
let categories = [];
let products = [];
let editingProductId = null;
let currentCategoryFilter = null; // 当前分类过滤
let currentCategoryFilterName = ''; // 当前分类过滤名称

// ===== Toast通知系统 =====

function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const titles = {
        success: title || '成功',
        error: title || '错误',
        warning: title || '警告',
        info: title || '提示'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== 确认弹窗系统 =====

function showConfirm(options) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const icon = document.getElementById('confirmIcon');
        const title = document.getElementById('confirmTitle');
        const message = document.getElementById('confirmMessage');
        const cancelBtn = document.getElementById('confirmCancel');
        const okBtn = document.getElementById('confirmOk');

        // 设置内容
        icon.textContent = options.icon || '❓';
        title.textContent = options.title || '确认操作';
        message.textContent = options.message || '您确定要执行此操作吗？';
        cancelBtn.textContent = options.cancelText || '取消';
        okBtn.textContent = options.okText || '确定';

        // 设置按钮样式
        okBtn.className = 'confirm-btn confirm-btn-confirm';
        if (options.type === 'danger') {
            okBtn.classList.add('danger');
        }

        // 显示弹窗
        modal.classList.add('show');

        // 事件处理
        const handleCancel = () => {
            modal.classList.remove('show');
            cancelBtn.removeEventListener('click', handleCancel);
            okBtn.removeEventListener('click', handleOk);
            resolve(false);
        };

        const handleOk = () => {
            modal.classList.remove('show');
            cancelBtn.removeEventListener('click', handleCancel);
            okBtn.removeEventListener('click', handleOk);
            resolve(true);
        };

        cancelBtn.addEventListener('click', handleCancel);
        okBtn.addEventListener('click', handleOk);

        // 点击背景关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };
    });
}

// ===== 登录验证功能 =====

// 检查登录状态
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    if (isLoggedIn !== 'true') {
        // 未登录，跳转到登录页
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 加载管理员信息
function loadAdminInfo() {
    const username = localStorage.getItem('adminUsername') || '管理员';
    const usernameEl = document.getElementById('adminUsername');
    if (usernameEl) {
        usernameEl.textContent = username;
    }
}

// 退出登录
function logout() {
    if (!confirm('确定要退出登录吗？')) return;

    // 清除登录状态（保留记住登录状态的设置）
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('loginTime');

    // 跳转到登录页
    window.location.href = 'login.html';
}

// 页面加载 - 统一的初始化入口
document.addEventListener('DOMContentLoaded', function() {
    // 首先检查登录状态
    if (!checkAdminLogin()) return;

    loadData();
    initNavigation();
    initEventListeners();
    loadUploadedImages();
    updateImageStats();
    initImageEditForm();
    initOrderFilters();
    loadAdminInfo();
});

// 加载数据
async function loadData() {
    try {
        // 优先从 localStorage 读取
        const savedData = localStorage.getItem('productsData');

        if (savedData) {
            // 使用已保存的数据
            const data = JSON.parse(savedData);
            categories = data.categories;
            products = data.products;
        } else {
            // 从 JSON 文件加载初始数据
            // 尝试多个路径，兼容本地和 Vercel
            let response;
            try {
                response = await fetch('/data/products.json');
            } catch {
                response = await fetch('../backend/data/products.json');
            }
            const data = await response.json();
            categories = data.categories;
            products = data.products;
            // 首次加载后保存到 localStorage
            saveData();
        }

        updateDashboard();
        renderProductsTable();
        renderPricesTable();
        loadCategoriesIntoSelect();
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败');
    }
}

// 更新仪表盘
function updateDashboard() {
    const total = products.length;
    const standard = products.filter(p => p.type === 'standard').length;
    const optional = products.filter(p => p.type === 'optional').length;
    const avgPrice = total > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / total) : 0;

    document.getElementById('statTotalProducts').textContent = total;
    document.getElementById('statStandardProducts').textContent = standard;
    document.getElementById('statOptionalProducts').textContent = optional;
    document.getElementById('statAvgPrice').textContent = '¥' + avgPrice.toLocaleString();

    // 分类统计 - 改进的卡片样式
    const categoryStats = document.getElementById('categoryStats');
    categoryStats.innerHTML = '';

    categories.forEach(category => {
        const categoryProducts = products.filter(p => p.category === category.id);
        const count = categoryProducts.length;
        const totalPrice = categoryProducts.reduce((sum, p) => sum + p.price, 0);
        const avgCategoryPrice = count > 0 ? Math.round(totalPrice / count) : 0;

        const div = document.createElement('div');
        div.className = 'category-stat-card';
        div.onclick = () => viewCategoryProducts(category.id, category.name);
        div.innerHTML = `
            <div class="category-stat-header">
                <div class="category-stat-name">${category.name}</div>
                <div class="category-stat-count">${count} 项</div>
            </div>
            <div class="category-stat-body">
                <div class="category-stat-detail">
                    <span class="detail-label">平均价格</span>
                    <span class="detail-value">¥${avgCategoryPrice.toLocaleString()}</span>
                </div>
                <div class="category-stat-detail">
                    <span class="detail-label">分类总值</span>
                    <span class="detail-value">¥${totalPrice.toLocaleString()}</span>
                </div>
            </div>
            <div class="category-stat-footer">
                <span class="view-link">查看商品 →</span>
            </div>
        `;
        categoryStats.appendChild(div);
    });

    // 数据概览
    if (total > 0) {
        const totalValue = products.reduce((sum, p) => sum + p.price, 0);
        const maxPrice = Math.max(...products.map(p => p.price));
        const minPrice = Math.min(...products.map(p => p.price));
        const inStockCount = products.filter(p => p.stock === 'in_stock').length;

        document.getElementById('totalValue').textContent = '¥' + totalValue.toLocaleString();
        document.getElementById('maxPrice').textContent = '¥' + maxPrice.toLocaleString();
        document.getElementById('minPrice').textContent = '¥' + minPrice.toLocaleString();
        document.getElementById('inStockCount').textContent = inStockCount + ' 项';
    }
}

// 查看分类下的商品
function viewCategoryProducts(categoryId, categoryName) {
    // 保存当前过滤
    currentCategoryFilter = categoryId;
    currentCategoryFilterName = categoryName;

    // 切换到配置项管理页面
    switchPage('products');

    // 更新搜索框为空
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    // 显示过滤提示栏
    const filterBar = document.getElementById('categoryFilterBar');
    const filterCategory = document.getElementById('currentFilterCategory');
    if (filterBar && filterCategory) {
        filterBar.style.display = 'flex';
        filterCategory.textContent = categoryName;
    }

    // 渲染该分类的商品
    renderProductsTable('', categoryId);
}

// 清除分类过滤
function clearCategoryFilter() {
    // 清除过滤状态
    currentCategoryFilter = null;
    currentCategoryFilterName = '';

    // 隐藏过滤提示栏
    const filterBar = document.getElementById('categoryFilterBar');
    if (filterBar) {
        filterBar.style.display = 'none';
    }

    // 清空搜索框
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    // 渲染所有商品
    renderProductsTable();
}

// 切换页面
function switchPage(page) {
    // 更新导航激活状态
    document.querySelectorAll('.nav-item[data-page]').forEach(nav => {
        if (nav.dataset.page === page) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    // 显示目标页面
    showPage(page);
}

// 渲染配置项表格
function renderProductsTable(searchText = '', categoryFilter = '') {
    const tbody = document.getElementById('productsTableBody');

    let filteredProducts = products;

    // 分类过滤
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }

    // 搜索过滤
    if (searchText) {
        searchText = searchText.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchText) ||
            p.sku.toLowerCase().includes(searchText)
        );
    }

    tbody.innerHTML = '';

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    <p>暂无配置项</p>
                    ${categoryFilter ? '<p><small>该分类下没有商品</small></p>' : ''}
                </td>
            </tr>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const category = categories.find(c => c.id === product.category);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${product.image}" class="product-thumb"></td>
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td>${category ? category.name : '-'}</td>
            <td><strong>¥${product.price.toLocaleString()}</strong></td>
            <td><span class="badge ${product.type}">${product.type === 'standard' ? '标配' : '选配'}</span></td>
            <td><span class="badge ${product.stock === 'in_stock' ? 'in-stock' : 'out-of-stock'}">${getStockText(product.stock)}</span></td>
            <td>
                <button class="btn-primary btn-small" onclick="editProduct('${product.id}')">编辑</button>
                <button class="btn-danger btn-small" onclick="deleteProduct('${product.id}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 获取库存文本
function getStockText(stock) {
    const stockMap = {
        'in_stock': '有货',
        'out_of_stock': '缺货',
        'pre_order': '预订'
    };
    return stockMap[stock] || stock;
}

// 渲染价格表格
function renderPricesTable() {
    const tbody = document.getElementById('pricesTableBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td><strong>¥${product.price.toLocaleString()}</strong></td>
            <td>
                <input type="number" class="price-input" id="price_${product.id}" value="${product.price}" min="0" step="0.01">
            </td>
            <td>
                <button class="btn-primary btn-small" onclick="updatePrice('${product.id}')">更新</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 加载分类到下拉框
function loadCategoriesIntoSelect() {
    const select = document.getElementById('productCategory');
    select.innerHTML = '';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// 初始化导航
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // 更新导航激活状态
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 显示对应页面
            const page = item.dataset.page;
            showPage(page);
        });
    });
}

// 显示页面
function showPage(page) {
    // 隐藏所有页面
    document.querySelectorAll('.page-content').forEach(p => {
        p.style.display = 'none';
    });

    // 显示目标页面
    const targetPage = document.getElementById('page-' + page);
    if (targetPage) {
        targetPage.style.display = 'block';
    }

    // 更新标题
    const titles = {
        'dashboard': '仪表盘',
        'products': '配置项管理',
        'images': '图片管理',
        'prices': '价格管理',
        'templates': '模板管理',
        'orders': '订单历史',
        'quotes': '报价单管理'
    };
    document.getElementById('pageTitle').textContent = titles[page] || '';

    // 如果切换到订单历史页面，加载订单数据
    if (page === 'orders') {
        loadOrdersHistory();
    }

    // 如果切换到报价单管理页面，加载报价单数据
    if (page === 'quotes') {
        loadQuotesData();
    }

    // 如果切换到模板管理页面，加载模板设置
    if (page === 'templates') {
        loadTemplate();
    }
}

// 初始化事件监听
function initEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProductsTable(e.target.value);
        });
    }

    // 配置项表单提交
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProduct();
        });
    }

    // 图片上传拖拽
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '#f0f8ff';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.backgroundColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '';
            const files = e.dataTransfer.files;
            handleFileUpload(files);
        });

        fileInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
        });
    }

    // 配置项图片上传
    const productImageInput = document.getElementById('productImage');
    if (productImageInput) {
        productImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // 验证文件
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('图片文件不能超过5MB');
                return;
            }

            // 读取并预览
            const reader = new FileReader();
            reader.onload = function(e) {
                const imagePreview = document.getElementById('imagePreview');
                const selectedImagePath = document.getElementById('selectedImagePath');

                imagePreview.innerHTML = `<img src="${e.target.result}" alt="预览">`;
                selectedImagePath.value = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}

// 显示配置项弹窗
function showProductModal(productId = null) {
    editingProductId = productId;
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');

    if (productId) {
        // 编辑模式
        const product = products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('modalTitle').textContent = '编辑配置项';
        document.getElementById('productName').value = product.name;
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productType').value = product.type;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description;

        const imagePreview = document.getElementById('imagePreview');
        const selectedImagePath = document.getElementById('selectedImagePath');
        imagePreview.innerHTML = `<img src="${product.image}" alt="预览">`;
        selectedImagePath.value = product.image;
    } else {
        // 新增模式
        document.getElementById('modalTitle').textContent = '新增配置项';
        form.reset();
        const imagePreview = document.getElementById('imagePreview');
        const selectedImagePath = document.getElementById('selectedImagePath');
        imagePreview.innerHTML = `<img src="../public/images/测试.jpg" alt="预览">`;
        selectedImagePath.value = '../public/images/测试.jpg';
    }

    modal.classList.add('show');
}

// 关闭配置项弹窗
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
    editingProductId = null;
}

// 保存配置项（已移至下方统一实现）

// 编辑配置项
function editProduct(productId) {
    showProductModal(productId);
}

// 删除配置项
async function deleteProduct(productId) {
    const confirmed = await showConfirm({
        icon: '🗑️',
        title: '删除配置项',
        message: '确定要删除这个配置项吗？此操作不可恢复。',
        type: 'danger',
        okText: '删除'
    });

    if (!confirmed) return;

    const index = products.findIndex(p => p.id === productId);
    if (index > -1) {
        products.splice(index, 1);
        saveData();
        renderProductsTable();
        renderPricesTable();
        updateDashboard();
        showToast('配置项已删除', 'success');
    }
}

// 更新价格
function updatePrice(productId) {
    const input = document.getElementById('price_' + productId);
    const newPrice = parseFloat(input.value);

    if (isNaN(newPrice) || newPrice < 0) {
        showToast('请输入有效的价格', 'error');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
        product.price = newPrice;
        saveData();
        renderProductsTable();
        updateDashboard();
        showToast('价格更新成功', 'success');
    }
}

// 批量更新价格
function batchUpdatePrices() {
    const percentage = prompt('请输入调整百分比（如：10 表示增加10%，-10 表示减少10%）：');
    if (!percentage) return;

    const percent = parseFloat(percentage) / 100;
    if (isNaN(percent)) {
        alert('请输入有效的百分比');
        return;
    }

    if (!confirm(`确定要将所有价格${percent > 0 ? '增加' : '减少'} ${Math.abs(percentage)}% 吗？`)) return;

    products.forEach(product => {
        product.price = Math.round(product.price * (1 + percent));
    });

    saveData();
    renderProductsTable();
    renderPricesTable();
    updateDashboard();
    alert('批量调整成功！');
}

// 导出价格表
function exportPrices() {
    let csv = 'SKU,配置名称,价格\n';

    products.forEach(product => {
        csv += `${product.sku},"${product.name}",${product.price}\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', '价格表_' + new Date().getTime() + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 加载模板设置
function loadTemplate() {
    const template = JSON.parse(localStorage.getItem('quoteTemplate') || '{}');

    if (template.companyName) {
        document.getElementById('companyName').value = template.companyName;
    }
    if (template.companyPhone) {
        document.getElementById('companyPhone').value = template.companyPhone;
    }
    if (template.companyAddress) {
        document.getElementById('companyAddress').value = template.companyAddress;
    }
    if (template.validDays) {
        document.getElementById('validDays').value = template.validDays;
    }
}

// 保存模板设置
function saveTemplate() {
    const companyName = document.getElementById('companyName').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const validDays = document.getElementById('validDays').value;

    const template = {
        companyName,
        companyPhone,
        companyAddress,
        validDays: parseInt(validDays)
    };

    localStorage.setItem('quoteTemplate', JSON.stringify(template));
    showToast('模板设置已保存', 'success');
}

// ===== 图片管理功能 =====

// 待上传文件列表
let pendingFiles = [];

// 已上传图片库
let uploadedImages = [];

// 处理文件上传
function handleFileUpload(files) {
    if (files.length === 0) return;

    // 验证文件
    const validFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let file of files) {
        // 检查文件类型
        if (!file.type.match('image/(jpeg|png|webp)')) {
            alert(`${file.name} 不是支持的图片格式（仅支持 JPG、PNG、WEBP）`);
            continue;
        }

        // 检查文件大小
        if (file.size > maxSize) {
            alert(`${file.name} 文件过大（超过5MB）`);
            continue;
        }

        validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // 添加到待上传列表
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            pendingFiles.push({
                file: file,
                name: file.name,
                size: file.size,
                dataUrl: e.target.result
            });
            renderUploadPreview();
        };
        reader.readAsDataURL(file);
    });
}

// 渲染上传预览
function renderUploadPreview() {
    const uploadPreview = document.getElementById('uploadPreview');
    const previewGrid = document.getElementById('previewGrid');

    if (pendingFiles.length === 0) {
        uploadPreview.style.display = 'none';
        return;
    }

    uploadPreview.style.display = 'block';
    previewGrid.innerHTML = '';

    pendingFiles.forEach((fileData, index) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <img src="${fileData.dataUrl}" alt="${fileData.name}">
            <div class="preview-item-info">
                <div class="preview-item-name">${fileData.name}</div>
                <div class="preview-item-size">${formatFileSize(fileData.size)}</div>
            </div>
            <button class="preview-item-remove" onclick="removePendingFile(${index})">&times;</button>
        `;
        previewGrid.appendChild(div);
    });
}

// 移除待上传文件
function removePendingFile(index) {
    pendingFiles.splice(index, 1);
    renderUploadPreview();
}

// 清空上传预览
function clearUploadPreview() {
    pendingFiles = [];
    renderUploadPreview();
    document.getElementById('fileInput').value = '';
}

// 确认上传
function confirmUpload() {
    if (pendingFiles.length === 0) return;

    // 将文件添加到图片库（使用 Base64 存储）
    pendingFiles.forEach(fileData => {
        const image = {
            id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: fileData.name,
            size: fileData.size,
            dataUrl: fileData.dataUrl,
            uploadDate: new Date().toISOString(),
            description: "",  // 默认描述为空
            tags: []  // 默认标签为空
        };
        uploadedImages.push(image);
    });

    // 保存图片库
    saveUploadedImages();

    // 清空待上传列表
    clearUploadPreview();

    // 更新显示
    renderImagesGrid();
    updateImageStats();

    alert(`成功上传 ${pendingFiles.length} 张图片！`);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 渲染图片库网格
function renderImagesGrid() {
    const imagesGrid = document.getElementById('imagesGrid');

    if (uploadedImages.length === 0) {
        imagesGrid.innerHTML = `
            <div class="empty-gallery">
                <div class="empty-gallery-icon">📷</div>
                <p>还没有上传任何图片</p>
                <p><small>点击上方上传区域添加图片</small></p>
            </div>
        `;
        return;
    }

    imagesGrid.innerHTML = '';

    uploadedImages.forEach(image => {
        const div = document.createElement('div');
        div.className = 'image-card';

        // 构建标签HTML
        let tagsHTML = '';
        if (image.tags && image.tags.length > 0) {
            tagsHTML = '<div class="image-card-tags">';
            image.tags.forEach(tag => {
                tagsHTML += '<span class="image-tag">' + tag + '</span>';
            });
            tagsHTML += '</div>';
        }

        // 描述HTML
        const descriptionHTML = image.description ?
            '<div class="image-card-description">' + image.description + '</div>' : '';

        div.innerHTML = `
            <img src="${image.dataUrl}" alt="${image.name}">
            <div class="image-card-info">
                <div class="image-card-name">${image.name}</div>
                <div class="image-card-meta">${formatFileSize(image.size)}</div>
                ${descriptionHTML}
                ${tagsHTML}
            </div>
            <div class="image-card-actions">
                <button class="image-card-btn edit" onclick="editImage('${image.id}')" title="编辑">✏️</button>
                <button class="image-card-btn delete" onclick="deleteImage('${image.id}')" title="删除">🗑️</button>
            </div>
        `;
        imagesGrid.appendChild(div);
    });
}

// 删除图片
async function deleteImage(imageId) {
    const confirmed = await showConfirm({
        icon: '🖼️',
        title: '删除图片',
        message: '确定要删除这张图片吗？',
        type: 'danger',
        okText: '删除'
    });

    if (!confirmed) return;

    const index = uploadedImages.findIndex(img => img.id === imageId);
    if (index > -1) {
        uploadedImages.splice(index, 1);
        saveUploadedImages();
        renderImagesGrid();
        updateImageStats();
        showToast('图片已删除', 'success');
    }
}

// 更新图片统计
function updateImageStats() {
    const count = uploadedImages.length;
    const totalSize = uploadedImages.reduce((sum, img) => sum + img.size, 0);

    document.getElementById('uploadedCount').textContent = count;
    document.getElementById('totalSize').textContent = formatFileSize(totalSize);
}

// 保存图片库到 localStorage
function saveUploadedImages() {
    localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
}

// 从 localStorage 加载图片库
function loadUploadedImages() {
    const saved = localStorage.getItem('uploadedImages');
    if (saved) {
        uploadedImages = JSON.parse(saved);
        renderImagesGrid();
    }
}

// ===== 图片选择功能 =====

let selectingForProduct = false;

// 从图片库选择
function selectFromGallery() {
    const modal = document.getElementById('galleryModal');
    const galleryGrid = document.getElementById('galleryGrid');

    selectingForProduct = true;

    if (uploadedImages.length === 0) {
        galleryGrid.innerHTML = `
            <div class="empty-gallery">
                <div class="empty-gallery-icon">📷</div>
                <p>图片库为空</p>
                <p><small>请先上传图片</small></p>
            </div>
        `;
    } else {
        galleryGrid.innerHTML = '';
        uploadedImages.forEach(image => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.onclick = () => selectImage(image);
            div.innerHTML = `
                <img src="${image.dataUrl}" alt="${image.name}">
                <div class="gallery-item-name">${image.name}</div>
            `;
            galleryGrid.appendChild(div);
        });
    }

    modal.classList.add('show');
}

// 选择图片
function selectImage(image) {
    const imagePreview = document.getElementById('imagePreview');
    const selectedImagePath = document.getElementById('selectedImagePath');

    imagePreview.innerHTML = `<img src="${image.dataUrl}" alt="${image.name}">`;
    selectedImagePath.value = image.dataUrl;

    closeGalleryModal();
    alert('图片已选择：' + image.name);
}

// 关闭图片库弹窗
function closeGalleryModal() {
    const modal = document.getElementById('galleryModal');
    modal.classList.remove('show');
    selectingForProduct = false;
}

// 使用测试图片
function useTestImage() {
    const imagePreview = document.getElementById('imagePreview');
    const selectedImagePath = document.getElementById('selectedImagePath');
    const testImagePath = '../public/images/测试.jpg';

    imagePreview.innerHTML = `<img src="${testImagePath}" alt="测试图片">`;
    selectedImagePath.value = testImagePath;

    alert('已设置为测试图片');
}

// 初始化配置项图片上传监听（已移至 initEventListeners 统一管理）

// 修改保存配置项函数，使用选中的图片
function saveProduct() {
    const name = document.getElementById('productName').value;
    const sku = document.getElementById('productSku').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const type = document.getElementById('productType').value;
    const stock = document.getElementById('productStock').value;
    const description = document.getElementById('productDescription').value;
    const imagePath = document.getElementById('selectedImagePath').value;

    if (editingProductId) {
        // 更新现有配置项
        const product = products.find(p => p.id === editingProductId);
        if (product) {
            product.name = name;
            product.sku = sku;
            product.category = category;
            product.price = price;
            product.type = type;
            product.stock = stock;
            product.description = description;
            product.image = imagePath;
        }
    } else {
        // 新增配置项
        const newProduct = {
            id: 'prod_' + Date.now(),
            sku: sku,
            name: name,
            category: category,
            price: price,
            description: description,
            image: imagePath,
            type: type,
            stock: stock
        };
        products.push(newProduct);
    }

    // 保存数据
    saveData();
    closeProductModal();
    renderProductsTable();
    renderPricesTable();
    updateDashboard();

    alert('保存成功！');
}

// 保存数据（实际项目中应该发送到后端）
function saveData() {
    const data = {
        categories: categories,
        products: products
    };

    // 在实际项目中，这里应该发送到后端API
    // 目前仅保存到 localStorage 用于演示
    localStorage.setItem('productsData', JSON.stringify(data));

}

// ===== 图片编辑功能 =====

let editingImageId = null;

// 打开图片编辑弹窗
function editImage(imageId) {
    editingImageId = imageId;
    const image = uploadedImages.find(img => img.id === imageId);
    if (!image) return;

    const modal = document.getElementById('imageEditModal');
    const form = document.getElementById('imageEditForm');

    // 填充表单
    document.getElementById('editImagePreview').src = image.dataUrl;
    document.getElementById('editImageName').value = image.name;
    document.getElementById('editImageDescription').value = image.description || '';
    document.getElementById('editImageTags').value = image.tags ? image.tags.join(',') : '';
    document.getElementById('editImageSize').textContent = formatFileSize(image.size);
    document.getElementById('editImageDate').textContent = new Date(image.uploadDate).toLocaleString('zh-CN');

    modal.classList.add('show');
}

// 关闭图片编辑弹窗
function closeImageEditModal() {
    const modal = document.getElementById('imageEditModal');
    modal.classList.remove('show');
    editingImageId = null;
}

// 初始化图片编辑表单
function initImageEditForm() {
    const imageEditForm = document.getElementById('imageEditForm');
    if (imageEditForm) {
        imageEditForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const image = uploadedImages.find(img => img.id === editingImageId);
            if (!image) return;

            // 更新图片信息
            image.name = document.getElementById('editImageName').value;
            image.description = document.getElementById('editImageDescription').value;

            const tagsInput = document.getElementById('editImageTags').value;
            image.tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

            // 保存到 localStorage
            saveUploadedImages();

            // 更新显示
            renderImagesGrid();

            // 关闭弹窗
            closeImageEditModal();

            alert('图片信息已更新！');
        });
    }
}

// ===== 订单历史管理功能 =====

let currentViewingOrder = null;

// 加载订单历史
function loadOrdersHistory() {
    const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');

    // 更新统计数据
    updateOrdersStats(ordersHistory);

    // 渲染订单表格
    renderOrdersTable(ordersHistory);
}

// 更新订单统计
function updateOrdersStats(orders) {
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

    // 计算今日订单
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createTime);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    }).length;

    document.getElementById('statTotalOrders').textContent = totalOrders;
    document.getElementById('statTotalAmount').textContent = '¥' + totalAmount.toLocaleString();
    document.getElementById('statTodayOrders').textContent = todayOrders;
}

// 渲染订单表格
function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                    <p>暂无订单记录</p>
                    <p><small>生成报价单后会自动保存到这里</small></p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';

    orders.forEach(order => {
        const createTime = new Date(order.createTime);
        const timeStr = createTime.toLocaleString('zh-CN');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="order-checkbox-item" data-order-id="${order.id}" onchange="updateBatchDeleteButton()">
            </td>
            <td><strong>${order.quoteNumber}</strong></td>
            <td>${timeStr}</td>
            <td style="text-align: center;">${order.productCount} 项</td>
            <td><strong style="color: #4CAF50;">¥${order.total.toLocaleString()}</strong></td>
            <td>${order.customerInfo || '-'}</td>
            <td>
                <button class="btn-primary btn-small" onclick="viewOrderDetail('${order.id}')">查看详情</button>
                <button class="btn-secondary btn-small" onclick="deleteOrder('${order.id}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 全选/取消全选
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllOrders');
    const checkboxes = document.querySelectorAll('.order-checkbox-item');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    updateBatchDeleteButton();
}

// 更新批量删除按钮状态
function updateBatchDeleteButton() {
    const checkboxes = document.querySelectorAll('.order-checkbox-item:checked');
    const batchDeleteBtn = document.getElementById('batchDeleteBtn');
    const selectedCount = document.getElementById('selectedCount');

    if (checkboxes.length > 0) {
        batchDeleteBtn.style.display = 'inline-block';
        selectedCount.textContent = checkboxes.length;
    } else {
        batchDeleteBtn.style.display = 'none';
    }

    // 更新全选复选框状态
    const allCheckboxes = document.querySelectorAll('.order-checkbox-item');
    const selectAllCheckbox = document.getElementById('selectAllOrders');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allCheckboxes.length > 0 && checkboxes.length === allCheckboxes.length;
    }
}

// 批量删除订单
async function batchDeleteOrders() {
    const checkboxes = document.querySelectorAll('.order-checkbox-item:checked');
    const orderIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-order-id'));

    if (orderIds.length === 0) {
        showToast('请选择要删除的订单', 'warning');
        return;
    }

    const confirmed = await showConfirm({
        icon: '🗑️',
        title: '批量删除订单',
        message: `确定要删除选中的 ${orderIds.length} 个订单吗？此操作不可恢复。`,
        type: 'danger',
        okText: '删除'
    });

    if (!confirmed) return;

    let ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');

    // 删除选中的订单
    ordersHistory = ordersHistory.filter(order => !orderIds.includes(order.id));

    localStorage.setItem('ordersHistory', JSON.stringify(ordersHistory));

    // 重新加载订单列表
    loadOrdersHistory();

    showToast(`成功删除 ${orderIds.length} 个订单`, 'success');
}

// 一键清空所有订单
async function clearAllOrders() {
    const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');

    if (ordersHistory.length === 0) {
        showToast('暂无订单记录', 'info');
        return;
    }

    const confirmed = await showConfirm({
        icon: '🧹',
        title: '清空所有订单',
        message: `确定要清空所有 ${ordersHistory.length} 个订单吗？此操作不可恢复！`,
        type: 'danger',
        okText: '清空'
    });

    if (!confirmed) return;

    localStorage.setItem('ordersHistory', JSON.stringify([]));

    // 重新加载订单列表
    loadOrdersHistory();

    showToast('已清空所有订单', 'success');
}

// 查看订单详情
function viewOrderDetail(orderId) {
    const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
    const order = ordersHistory.find(o => o.id === orderId);

    if (!order) {
        alert('订单不存在');
        return;
    }

    currentViewingOrder = order;

    // 构建订单详情HTML
    let productsHTML = '<div class="order-products-list">';
    order.products.forEach((product, index) => {
        productsHTML += `
            <div class="order-product-item">
                <div class="order-product-index">${index + 1}</div>
                <img src="${product.image}" class="order-product-image" alt="${product.name}">
                <div class="order-product-info">
                    <div class="order-product-name">${product.name}</div>
                    <div class="order-product-sku">SKU: ${product.sku}</div>
                    <div class="order-product-desc">${product.description}</div>
                </div>
                <div class="order-product-price">¥${product.price.toLocaleString()}</div>
            </div>
        `;
    });
    productsHTML += '</div>';

    const detailHTML = `
        <div class="order-detail-header">
            <div class="order-detail-row">
                <div class="order-detail-label">订单编号：</div>
                <div class="order-detail-value"><strong>${order.quoteNumber}</strong></div>
            </div>
            <div class="order-detail-row">
                <div class="order-detail-label">生成时间：</div>
                <div class="order-detail-value">${new Date(order.createTime).toLocaleString('zh-CN')}</div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3>配置明细（共 ${order.productCount} 项）</h3>
            ${productsHTML}
        </div>

        <div class="order-detail-section">
            <h3>价格汇总</h3>
            <div class="order-price-summary">
                <div class="order-price-row">
                    <span>配置总价：</span>
                    <span>¥${order.subtotal.toLocaleString()}</span>
                </div>
                <div class="order-price-row">
                    <span>优惠金额：</span>
                    <span style="color: #f44336;">-¥${order.discount.toLocaleString()}</span>
                </div>
                <div class="order-price-row">
                    <span>税费（13%）：</span>
                    <span>¥${order.tax.toLocaleString()}</span>
                </div>
                <div class="order-price-row order-total">
                    <span>订单总额：</span>
                    <span style="color: #4CAF50; font-size: 20px;">¥${order.total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('orderDetailContent').innerHTML = detailHTML;

    // 显示弹窗
    const modal = document.getElementById('orderDetailModal');
    modal.classList.add('show');
}

// 关闭订单详情弹窗
function closeOrderDetailModal() {
    const modal = document.getElementById('orderDetailModal');
    modal.classList.remove('show');
    currentViewingOrder = null;
}

// 查看完整报价单
function viewOrderQuote() {
    if (!currentViewingOrder) return;

    // 将订单数据临时存储
    localStorage.setItem('selectedProducts', JSON.stringify(currentViewingOrder.products));
    if (currentViewingOrder.template) {
        localStorage.setItem('quoteTemplate', JSON.stringify(currentViewingOrder.template));
    }

    // 打开报价单页面
    window.open('quote.html', '_blank');
}

// 重新导出订单
function reExportOrder() {
    if (!currentViewingOrder) return;

    // 先保存订单数据，避免关闭弹窗时被清空
    const orderToExport = currentViewingOrder;

    // 关闭订单详情弹窗
    closeOrderDetailModal();

    // 使用订单ID作为导出的报价单ID
    currentExportQuoteId = orderToExport.id;

    // 临时保存订单数据供导出使用
    window.tempExportOrder = orderToExport;

    // 显示导出选择弹窗
    const modal = document.getElementById('exportQuoteModal');
    modal.classList.add('show');
}

// 删除订单
async function deleteOrder(orderId) {
    const confirmed = await showConfirm({
        icon: '📋',
        title: '删除订单',
        message: '确定要删除这个订单吗？',
        type: 'danger',
        okText: '删除'
    });

    if (!confirmed) return;

    let ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
    const index = ordersHistory.findIndex(o => o.id === orderId);

    if (index > -1) {
        ordersHistory.splice(index, 1);
        localStorage.setItem('ordersHistory', JSON.stringify(ordersHistory));

        // 重新加载订单列表
        loadOrdersHistory();

        showToast('订单已删除', 'success');
    }
}

// 导出订单记录
function exportOrdersHistory() {
    const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');

    if (ordersHistory.length === 0) {
        alert('暂无订单记录');
        return;
    }

    // 生成CSV
    let csv = '\ufeff订单编号,生成时间,配置数量,订单总额,客户信息\n';

    ordersHistory.forEach(order => {
        const createTime = new Date(order.createTime).toLocaleString('zh-CN');
        csv += `"${order.quoteNumber}","${createTime}",${order.productCount},${order.total},"${order.customerInfo || ''}"\n`;
    });

    // 下载CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', '订单记录_' + new Date().getTime() + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 初始化订单搜索和过滤
function initOrderFilters() {
    const orderSearchInput = document.getElementById('orderSearchInput');
    const orderDateFilter = document.getElementById('orderDateFilter');

    if (orderSearchInput) {
        orderSearchInput.addEventListener('input', filterOrders);
    }

    if (orderDateFilter) {
        orderDateFilter.addEventListener('change', filterOrders);
    }
}

// 过滤订单
function filterOrders() {
    const searchText = document.getElementById('orderSearchInput').value.toLowerCase();
    const dateFilter = document.getElementById('orderDateFilter').value;

    let ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');

    // 日期过滤
    if (dateFilter !== 'all') {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        ordersHistory = ordersHistory.filter(order => {
            const orderDate = new Date(order.createTime);
            orderDate.setHours(0, 0, 0, 0);

            if (dateFilter === 'today') {
                return orderDate.getTime() === now.getTime();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return orderDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return orderDate >= monthAgo;
            }
            return true;
        });
    }

    // 文本搜索
    if (searchText) {
        ordersHistory = ordersHistory.filter(order =>
            order.quoteNumber.toLowerCase().includes(searchText) ||
            (order.customerInfo && order.customerInfo.toLowerCase().includes(searchText))
        );
    }

    // 更新显示
    updateOrdersStats(ordersHistory);
    renderOrdersTable(ordersHistory);
}

// ===== 报价单管理功能 =====

const API_BASE_URL = 'http://localhost:5000/api';
let currentEditingQuote = null;

// 加载报价单数据
async function loadQuotesData() {
    try {
        const response = await fetch(`${API_BASE_URL}/quotes`);
        const result = await response.json();

        if (result.success) {
            const quotes = result.data;
            updateQuotesStats(quotes);
            renderQuotesTable(quotes);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('加载报价单失败:', error);
        // 如果后台未启动，从localStorage加载
        const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        updateQuotesStats(localQuotes);
        renderQuotesTable(localQuotes);
    }
}

// 更新报价单统计
function updateQuotesStats(quotes) {
    const total = quotes.length;
    const pending = quotes.filter(q => q.status === 'pending').length;
    const approved = quotes.filter(q => q.status === 'approved').length;

    document.getElementById('statTotalQuotes').textContent = total;
    document.getElementById('statPendingQuotes').textContent = pending;
    document.getElementById('statApprovedQuotes').textContent = approved;
}

// 渲染报价单表格
function renderQuotesTable(quotes) {
    const tbody = document.getElementById('quotesTableBody');
    const statusFilter = document.getElementById('quoteStatusFilter').value;

    // 状态过滤
    let filteredQuotes = quotes;
    if (statusFilter !== 'all') {
        filteredQuotes = quotes.filter(q => q.status === statusFilter);
    }

    if (filteredQuotes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📄</div>
                    <p>暂无报价单记录</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';

    filteredQuotes.forEach(quote => {
        const createTime = new Date(quote.createTime).toLocaleString('zh-CN');
        const statusMap = {
            'pending': '待审核',
            'approved': '已审核',
            'rejected': '已拒绝',
            'completed': '已完成'
        };
        const statusClass = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger',
            'completed': 'info'
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${quote.quoteNumber}</strong></td>
            <td>${createTime}</td>
            <td style="text-align: center;">${quote.productCount} 项</td>
            <td><strong style="color: #4CAF50;">¥${quote.total.toLocaleString()}</strong></td>
            <td>
                <span class="badge ${statusClass[quote.status]}">${statusMap[quote.status]}</span>
            </td>
            <td>
                <button class="btn-primary btn-small" onclick="viewQuoteDetail('${quote.id}')">查看</button>
                <button class="btn-secondary btn-small" onclick="editQuote('${quote.id}')">编辑</button>
                ${quote.status === 'pending' ? `
                    <button class="btn-success btn-small" onclick="approveQuote('${quote.id}')">审核通过</button>
                ` : ''}
                ${quote.status === 'approved' ? `
                    <button class="btn-primary btn-small" data-quote-id="${quote.id}" onclick="showExportQuoteModal(this.getAttribute('data-quote-id'))">导出报价单</button>
                ` : ''}
                <button class="btn-danger btn-small" onclick="deleteQuote('${quote.id}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 查看报价单详情
async function viewQuoteDetail(quoteId) {
    try {
        const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`);
        const result = await response.json();

        if (result.success) {
            const quote = result.data;
            alert(`报价单详情\n\n报价单号：${quote.quoteNumber}\n状态：${quote.status}\n总价：¥${quote.total.toLocaleString()}\n产品数量：${quote.productCount}`);
        }
    } catch (error) {
        console.error('获取报价单详情失败:', error);
        alert('获取报价单详情失败');
    }
}

// 编辑报价单
async function editQuote(quoteId) {
    try {
        const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`);
        const result = await response.json();

        if (result.success) {
            currentEditingQuote = result.data;
            showQuoteEditModal(currentEditingQuote);
        }
    } catch (error) {
        console.error('获取报价单失败:', error);
        alert('获取报价单失败');
    }
}

// 显示报价单编辑弹窗
function showQuoteEditModal(quote) {
    const modal = document.getElementById('quoteEditModal');
    const content = document.getElementById('quoteEditContent');

    // 计算原始总价
    const originalTotal = quote.total;
    const originalSubtotal = quote.subtotal;

    let productsHTML = '<div class="quote-products-edit-modern">';
    quote.products.forEach((product, index) => {
        productsHTML += `
            <div class="quote-product-card">
                <div class="product-card-left">
                    <div class="product-index-badge">${index + 1}</div>
                    <div class="product-image-container">
                        <img src="${product.image}" class="product-edit-thumb" alt="${product.name}">
                    </div>
                    <div class="product-info-section">
                        <h4 class="product-title">${product.name}</h4>
                        <div class="product-meta">
                            <span class="meta-item">
                                <span class="meta-label">SKU:</span>
                                <span class="meta-value">${product.sku}</span>
                            </span>
                        </div>
                        <p class="product-description">${product.description}</p>
                    </div>
                </div>
                <div class="product-card-right">
                    <div class="price-edit-section">
                        <label class="price-label">单价（¥）</label>
                        <div class="price-input-wrapper">
                            <span class="currency-symbol">¥</span>
                            <input type="number"
                                   id="product_price_${index}"
                                   value="${product.price}"
                                   min="0"
                                   step="0.01"
                                   class="price-input-modern"
                                   placeholder="0.00">
                        </div>
                        <div class="price-original">原价: ¥${product.price.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    });
    productsHTML += '</div>';

    content.innerHTML = `
        <div class="quote-info-banner">
            <div class="quote-info-left">
                <div class="quote-number-display">
                    <span class="quote-label">报价单号</span>
                    <span class="quote-number">${quote.quoteNumber}</span>
                </div>
                <div class="quote-meta-info">
                    <span class="meta-item">📅 ${new Date(quote.createTime).toLocaleString('zh-CN')}</span>
                    <span class="meta-item">📦 ${quote.productCount} 项配置</span>
                </div>
            </div>
            <div class="quote-info-right">
                <div class="status-badge-large ${quote.status === 'pending' ? 'status-pending' : 'status-approved'}">
                    ${quote.status === 'pending' ? '⏳ 待审核' : '✅ 已审核'}
                </div>
            </div>
        </div>

        <div class="edit-section">
            <div class="section-title">
                <span class="title-icon">📦</span>
                <span class="title-text">产品配置清单</span>
                <span class="title-count">${quote.products.length} 项</span>
            </div>
            ${productsHTML}
        </div>

        <div class="edit-section">
            <div class="section-title">
                <span class="title-icon">💰</span>
                <span class="title-text">价格调整</span>
            </div>
            <div class="price-adjustment-grid">
                <div class="adjustment-item">
                    <label class="adjustment-label">优惠金额</label>
                    <div class="price-input-wrapper">
                        <span class="currency-symbol">¥</span>
                        <input type="number"
                               id="edit_discount"
                               value="${quote.discount}"
                               min="0"
                               step="0.01"
                               class="price-input-modern"
                               placeholder="0.00">
                    </div>
                </div>
                <div class="adjustment-item">
                    <label class="adjustment-label">价格预览</label>
                    <div class="total-preview-modern" id="currentTotal">
                        <div class="preview-row">
                            <span>配置总价：</span>
                            <span>¥${originalSubtotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="edit-section">
            <div class="section-title">
                <span class="title-icon">📝</span>
                <span class="title-text">备注信息</span>
            </div>
            <textarea id="edit_remarks"
                      class="remarks-textarea-modern"
                      rows="4"
                      placeholder="在此添加备注信息、特殊要求或审核意见...">${quote.remarks || ''}</textarea>
        </div>
    `;

    modal.classList.add('show');

    // 添加价格实时计算
    setupPriceCalculation(quote);
}

// 关闭报价单编辑弹窗
function closeQuoteEditModal() {
    const modal = document.getElementById('quoteEditModal');
    modal.classList.remove('show');
    currentEditingQuote = null;
}

// 保存报价单修改
async function saveQuoteChanges() {
    if (!currentEditingQuote) return;

    try {
        // 收集修改后的数据
        const updatedProducts = currentEditingQuote.products.map((product, index) => {
            const priceInput = document.getElementById(`product_price_${index}`);
            return {
                ...product,
                price: parseFloat(priceInput.value)
            };
        });

        const discount = parseFloat(document.getElementById('edit_discount').value);
        const remarks = document.getElementById('edit_remarks').value;

        // 重新计算总价
        const subtotal = updatedProducts.reduce((sum, p) => sum + p.price, 0);
        const tax = Math.round((subtotal - discount) * 0.13);
        const total = subtotal - discount + tax;

        const updateData = {
            products: updatedProducts,
            subtotal,
            discount,
            tax,
            total,
            remarks
        };

        const response = await fetch(`${API_BASE_URL}/quotes/${currentEditingQuote.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('报价单修改成功', 'success');
            closeQuoteEditModal();
            loadQuotesData();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('保存报价单失败:', error);
        showToast('保存报价单失败：' + error.message, 'error');
    }
}

// 审核通过报价单
async function approveQuote(quoteId) {
    const confirmed = await showConfirm({
        icon: '✅',
        title: '审核报价单',
        message: '确定要审核通过这个报价单吗？',
        okText: '审核通过'
    });

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'approved' })
        });

        const result = await response.json();

        if (result.success) {
            showToast('报价单已审核通过', 'success');
            loadQuotesData();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('审核失败:', error);
        showToast('审核失败：' + error.message, 'error');
    }
}

// 当前要导出的报价单ID
let currentExportQuoteId = null;

// 显示导出报价单弹窗
function showExportQuoteModal(quoteId) {
    if (!quoteId || quoteId === 'null' || quoteId === 'undefined') {
        showToast('报价单ID无效，无法导出', 'error');
        return;
    }

    currentExportQuoteId = quoteId;
    const modal = document.getElementById('exportQuoteModal');
    modal.classList.add('show');
}

// 关闭导出报价单弹窗
function closeExportQuoteModal() {
    const modal = document.getElementById('exportQuoteModal');
    modal.classList.remove('show');
    currentExportQuoteId = null;
}

// 导出报价单为图片
async function exportQuoteAsImage() {
    if (!currentExportQuoteId) return;

    // 先保存ID，避免关闭弹窗时被清空
    const quoteId = currentExportQuoteId;

    try {
        closeExportQuoteModal();
        showToast('正在生成报价单图片...', 'info');

        let quote;

        // 如果是从订单导出，直接使用临时保存的订单数据
        if (window.tempExportOrder && window.tempExportOrder.id === quoteId) {
            quote = window.tempExportOrder;
            // 使用后清除临时数据
            delete window.tempExportOrder;
        } else if (currentViewingOrder && currentViewingOrder.id === quoteId) {
            quote = currentViewingOrder;
        } else {
            // 否则从后端API获取报价单数据
            const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error('获取报价单数据失败');
            }

            quote = result.data;
        }

        // 生成报价单HTML
        const quoteHTML = generateQuoteHTML(quote);

        // 渲染到隐藏容器
        const container = document.getElementById('quotePreviewContainer');
        container.innerHTML = quoteHTML;

        // 等待图片加载
        await waitForImages(container);

        // 使用html2canvas生成图片
        const canvas = await html2canvas(container.querySelector('.quote-paper'), {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        // 下载图片
        const link = document.createElement('a');
        link.download = `报价单_${quote.quoteNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 清空容器
        container.innerHTML = '';

        showToast('报价单图片已导出', 'success');
    } catch (error) {
        console.error('导出图片失败:', error);
        showToast('导出图片失败：' + error.message, 'error');
    }
}

// 导出报价单为PDF
async function exportQuoteAsPDF() {
    if (!currentExportQuoteId) return;

    // 先保存ID，避免关闭弹窗时被清空
    const quoteId = currentExportQuoteId;

    try {
        closeExportQuoteModal();
        showToast('正在生成报价单PDF...', 'info');

        let quote;

        // 如果是从订单导出，直接使用临时保存的订单数据
        if (window.tempExportOrder && window.tempExportOrder.id === quoteId) {
            quote = window.tempExportOrder;
            // 使用后清除临时数据
            delete window.tempExportOrder;
        } else if (currentViewingOrder && currentViewingOrder.id === quoteId) {
            quote = currentViewingOrder;
        } else {
            // 否则从后端API获取报价单数据
            const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error('获取报价单数据失败');
            }

            quote = result.data;
        }

        // 生成报价单HTML
        const quoteHTML = generateQuoteHTML(quote);

        // 渲染到隐藏容器
        const container = document.getElementById('quotePreviewContainer');
        container.innerHTML = quoteHTML;

        // 等待图片加载
        await waitForImages(container);

        // 使用html2canvas生成图片
        const canvas = await html2canvas(container.querySelector('.quote-paper'), {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        // 使用jsPDF生成PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4宽度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`报价单_${quote.quoteNumber}.pdf`);

        // 清空容器
        container.innerHTML = '';

        showToast('报价单PDF已导出', 'success');
    } catch (error) {
        console.error('导出PDF失败:', error);
        showToast('导出PDF失败：' + error.message, 'error');
    }
}

// 删除报价单
async function deleteQuote(quoteId) {
    const confirmed = await showConfirm({
        icon: '🗑️',
        title: '删除报价单',
        message: '确定要删除这个报价单吗？此操作不可恢复。',
        type: 'danger',
        okText: '删除'
    });

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showToast('报价单已删除', 'success');
            loadQuotesData();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('删除失败:', error);
        showToast('删除失败：' + error.message, 'error');
    }
}

// 刷新报价单列表
function refreshQuotes() {
    loadQuotesData();
}

// 按状态筛选报价单
function filterQuotesByStatus() {
    loadQuotesData();
}

// 设置价格实时计算
function setupPriceCalculation(quote) {
    // 监听所有价格输入框
    quote.products.forEach((product, index) => {
        const priceInput = document.getElementById(`product_price_${index}`);
        if (priceInput) {
            priceInput.addEventListener('input', () => calculateQuoteTotal(quote));
        }
    });

    // 监听优惠金额
    const discountInput = document.getElementById('edit_discount');
    if (discountInput) {
        discountInput.addEventListener('input', () => calculateQuoteTotal(quote));
    }
}

// 生成报价单HTML（按照quote.html模板）
function generateQuoteHTML(quote) {
    // 获取模板设置
    const template = JSON.parse(localStorage.getItem('quoteTemplate') || '{}');
    const companyName = template.companyName || 'XX高尔夫球车有限公司';
    const companyPhone = template.companyPhone || '400-888-8888';
    const companyAddress = template.companyAddress || '广东省深圳市XX区XX路XX号';
    const validDays = template.validDays || 30;

    // 计算有效期
    const quoteDate = new Date(quote.createTime);
    const validUntil = new Date(quoteDate);
    validUntil.setDate(validUntil.getDate() + validDays);

    // 格式化日期
    const formatDate = (date) => {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // 状态显示
    const statusMap = {
        'pending': '待审核',
        'approved': '已审核',
        'rejected': '已拒绝',
        'completed': '已完成'
    };

    // 生成产品行
    let productsHTML = '';
    quote.products.forEach((product, index) => {
        productsHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><img src="${product.image}" class="product-thumbnail"></td>
                <td>
                    <div class="product-name">${product.name}</div>
                </td>
                <td>
                    <div class="product-description">${product.description}</div>
                </td>
                <td>${product.sku}</td>
                <td class="price">¥${product.price.toLocaleString()}</td>
                <td>1</td>
                <td class="price">¥${product.price.toLocaleString()}</td>
            </tr>
        `;
    });

    // 生成完整HTML，包含quote-style.css的内联样式
    return `
        <link rel="stylesheet" href="quote-style.css">
        <div class="quote-paper">
            <!-- 报价单头部 -->
            <div class="quote-header">
                <div class="company-info">
                    <h1 class="company-name">${companyName}</h1>
                    <p class="company-contact">
                        <span>电话：${companyPhone}</span>
                        <span>地址：${companyAddress}</span>
                    </p>
                </div>
                <div class="quote-title">
                    <h2>产品报价单（${statusMap[quote.status] || '初始版'}）</h2>
                    <p class="quote-number">报价单号：${quote.quoteNumber}</p>
                    <p class="quote-status">状态：<span class="status-badge">${statusMap[quote.status]}</span></p>
                </div>
            </div>

            <!-- 报价单信息 -->
            <div class="quote-info">
                <div class="info-row">
                    <span>报价日期：<strong>${formatDate(quoteDate)}</strong></span>
                    <span>有效期至：<strong>${formatDate(validUntil)}</strong></span>
                </div>
            </div>

            <!-- 配置明细表 -->
            <div class="quote-table-wrapper">
                <h3 class="section-title">配置明细</h3>
                <table class="quote-table">
                    <thead>
                        <tr>
                            <th width="60">序号</th>
                            <th width="120">产品图片</th>
                            <th width="150">配置名称</th>
                            <th>配置描述</th>
                            <th width="120">SKU</th>
                            <th width="100">单价</th>
                            <th width="60">数量</th>
                            <th width="100">小计</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsHTML}
                    </tbody>
                </table>
            </div>

            <!-- 价格汇总 -->
            <div class="quote-summary">
                <div class="summary-row">
                    <span>配置总价：</span>
                    <span class="amount">¥${quote.subtotal.toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span>优惠金额：</span>
                    <span class="amount discount">-¥${quote.discount.toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span>税费（增值税13%）：</span>
                    <span class="amount">¥${quote.tax.toLocaleString()}</span>
                </div>
                <div class="summary-row total">
                    <span>最终总价：</span>
                    <span class="amount final">¥${quote.total.toLocaleString()}</span>
                </div>
            </div>

            <!-- 备注说明 -->
            <div class="quote-notes">
                <h4>备注说明</h4>
                <ul>
                    <li>本报价单仅供参考，最终价格以实际成交为准</li>
                    <li>产品图片仅供参考，实物以实际交付为准</li>
                    <li>配置项可能因库存情况有所调整，请以实际为准</li>
                    <li>本报价单在有效期内有效，过期需重新报价</li>
                    <li>如有任何疑问，请联系我们的销售人员</li>
                    ${quote.remarks ? `<li>备注：${quote.remarks}</li>` : ''}
                </ul>
            </div>

            <!-- 报价单底部 -->
            <div class="quote-footer">
                <p>感谢您的信任与支持！</p>
                <p class="footer-contact">
                    联系电话：${companyPhone} | 网址：www.golfcart.com
                </p>
            </div>
        </div>
    `;
}

// 等待图片加载完成
function waitForImages(container) {
    return new Promise((resolve) => {
        const images = container.querySelectorAll('img');
        if (images.length === 0) {
            resolve();
            return;
        }

        let loadedCount = 0;
        const totalImages = images.length;

        images.forEach(img => {
            if (img.complete) {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            } else {
                img.onload = img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
            }
        });

        // 超时保护（5秒）
        setTimeout(() => resolve(), 5000);
    });
}

// 计算报价单总价
function calculateQuoteTotal(quote) {
    // 计算产品总价
    let subtotal = 0;
    quote.products.forEach((product, index) => {
        const priceInput = document.getElementById(`product_price_${index}`);
        if (priceInput) {
            subtotal += parseFloat(priceInput.value) || 0;
        }
    });

    // 获取优惠金额
    const discountInput = document.getElementById('edit_discount');
    const discount = parseFloat(discountInput.value) || 0;

    // 计算税费和总价
    const tax = Math.round((subtotal - discount) * 0.13);
    const total = subtotal - discount + tax;

    // 计算价格变化
    const originalTotal = quote.total;
    const priceDiff = total - originalTotal;
    const diffPercent = originalTotal > 0 ? ((priceDiff / originalTotal) * 100).toFixed(1) : 0;

    // 更新显示
    const totalPreview = document.getElementById('currentTotal');
    if (totalPreview) {
        totalPreview.innerHTML = `
            <div class="preview-row">
                <span>配置总价：</span>
                <span class="price-value">¥${subtotal.toLocaleString()}</span>
            </div>
            <div class="preview-row">
                <span>优惠金额：</span>
                <span class="price-value discount-value">-¥${discount.toLocaleString()}</span>
            </div>
            <div class="preview-row">
                <span>税费 (13%)：</span>
                <span class="price-value">¥${tax.toLocaleString()}</span>
            </div>
            <div class="preview-divider"></div>
            <div class="preview-row total-row">
                <span>最终总价：</span>
                <span class="price-value total-value">¥${total.toLocaleString()}</span>
            </div>
            ${priceDiff !== 0 ? `
            <div class="preview-row change-row">
                <span>价格变化：</span>
                <span class="price-change ${priceDiff > 0 ? 'increase' : 'decrease'}">
                    ${priceDiff > 0 ? '+' : ''}¥${priceDiff.toLocaleString()}
                    (${priceDiff > 0 ? '+' : ''}${diffPercent}%)
                </span>
            </div>
            ` : ''}
        `;
    }
}
