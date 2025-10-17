// 全局数据
let categories = [];
let products = [];
let cart = [];
let currentCategoryId = null;
let selectedProduct = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initEventListeners();
});

// 加载数据
async function loadData() {
    try {
        // 优先从 localStorage 读取后台修改的数据
        const savedData = localStorage.getItem('productsData');

        if (savedData) {
            // 如果后台有保存数据，使用后台数据
            const data = JSON.parse(savedData);
            categories = data.categories;
            products = data.products;
        } else {
            // 否则从 JSON 文件加载
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
        }

        renderCategories();
        renderProducts();
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载配置数据失败，请刷新页面重试');
    }
}

// 渲染分类列表
function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    // 添加"全部配置"分类
    const allLi = document.createElement('li');
    allLi.className = 'category-item active';
    allLi.dataset.categoryId = 'all';
    allLi.textContent = '全部配置';
    allLi.onclick = () => selectCategory('all', '全部配置');
    categoryList.appendChild(allLi);

    // 添加其他分类
    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.dataset.categoryId = category.id;
        li.textContent = category.name;
        li.onclick = () => selectCategory(category.id, category.name);
        categoryList.appendChild(li);
    });
}

// 选择分类
function selectCategory(categoryId, categoryName) {
    currentCategoryId = categoryId === 'all' ? null : categoryId;

    // 更新分类激活状态
    document.querySelectorAll('.category-item').forEach(item => {
        if (item.dataset.categoryId === categoryId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 更新标题
    document.getElementById('currentCategory').textContent = categoryName || '全部配置';

    // 重新渲染产品
    renderProducts();
}

// 渲染产品列表
function renderProducts(searchText = '') {
    const productsGrid = document.getElementById('productsGrid');

    // 过滤产品
    let filteredProducts = products;

    if (currentCategoryId) {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategoryId);
    }

    if (searchText) {
        searchText = searchText.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchText) ||
            p.description.toLowerCase().includes(searchText) ||
            p.sku.toLowerCase().includes(searchText)
        );
    }

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">暂无配置项</p>';
        return;
    }

    productsGrid.innerHTML = '';

    filteredProducts.forEach(product => {
        const isInCart = cart.some(item => item.id === product.id);
        const card = createProductCard(product, isInCart);
        productsGrid.appendChild(card);
    });
}

// 创建产品卡片
function createProductCard(product, isInCart) {
    const div = document.createElement('div');
    div.className = 'product-card';

    const categoryName = categories.find(c => c.id === product.category)?.name || '';
    const typeText = product.type === 'standard' ? '标配' : '选配';
    const typeClass = product.type === 'standard' ? 'standard' : 'optional';

    div.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <div class="product-header">
                <div class="product-name">${product.name}</div>
                <span class="product-type ${typeClass}">${typeText}</span>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <div class="product-price">¥${product.price.toLocaleString()}</div>
                <button class="btn-add ${isInCart ? 'added' : ''}" data-product-id="${product.id}">
                    ${isInCart ? '已添加' : '添加'}
                </button>
            </div>
        </div>
    `;

    // 点击卡片查看详情
    div.onclick = (e) => {
        if (!e.target.classList.contains('btn-add')) {
            showProductDetail(product);
        }
    };

    // 添加按钮点击事件
    const btnAdd = div.querySelector('.btn-add');
    btnAdd.onclick = (e) => {
        e.stopPropagation();
        toggleCart(product);
    };

    return div;
}

// 显示产品详情
function showProductDetail(product) {
    selectedProduct = product;
    const modal = document.getElementById('productModal');
    const categoryName = categories.find(c => c.id === product.category)?.name || '';
    const typeText = product.type === 'standard' ? '标配' : '选配';

    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalName').textContent = product.name;
    document.getElementById('modalSku').textContent = product.sku;
    document.getElementById('modalCategory').textContent = categoryName;
    document.getElementById('modalPrice').textContent = '¥' + product.price.toLocaleString();
    document.getElementById('modalType').textContent = typeText;
    document.getElementById('modalDescription').textContent = product.description;

    const isInCart = cart.some(item => item.id === product.id);
    const btnAddToCart = document.getElementById('btnAddToCart');
    btnAddToCart.textContent = isInCart ? '已在选配中' : '添加到选配';
    btnAddToCart.className = 'btn-primary btn-add-to-cart' + (isInCart ? ' added' : '');

    modal.classList.add('show');
}

// 切换购物车
function toggleCart(product) {
    const index = cart.findIndex(item => item.id === product.id);

    if (index > -1) {
        cart.splice(index, 1);
    } else {
        cart.push(product);
    }

    renderProducts(document.getElementById('searchInput').value);
    renderCart();
    updateCartSummary();
}

// 渲染购物车
function renderCart() {
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">暂无选择</p>';
        return;
    }

    cartItems.innerHTML = '';

    cart.forEach(product => {
        const div = document.createElement('div');
        div.className = 'cart-item';

        div.innerHTML = `
            <div class="cart-item-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${product.name}</div>
                <div class="cart-item-price">¥${product.price.toLocaleString()}</div>
            </div>
            <button class="cart-item-remove" data-product-id="${product.id}">&times;</button>
        `;

        const btnRemove = div.querySelector('.cart-item-remove');
        btnRemove.onclick = () => {
            toggleCart(product);
        };

        cartItems.appendChild(div);
    });
}

// 更新购物车统计
function updateCartSummary() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const discount = 0; // 暂无优惠
    const final = total - discount;

    document.getElementById('totalPrice').textContent = '¥' + total.toLocaleString();
    document.getElementById('finalPrice').textContent = '¥' + final.toLocaleString();

    const btnGenerate = document.getElementById('btnGenerate');
    btnGenerate.disabled = cart.length === 0;
}

// 初始化事件监听
function initEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });

    // 关闭弹窗
    const modalClose = document.getElementById('modalClose');
    const modal = document.getElementById('productModal');

    modalClose.onclick = () => {
        modal.classList.remove('show');
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    };

    // 弹窗中添加到购物车
    const btnAddToCart = document.getElementById('btnAddToCart');
    btnAddToCart.onclick = () => {
        if (selectedProduct) {
            toggleCart(selectedProduct);
            modal.classList.remove('show');
        }
    };

    // 生成报价单
    const btnGenerate = document.getElementById('btnGenerate');
    btnGenerate.onclick = () => {
        if (cart.length === 0) {
            alert('请先选择配置项');
            return;
        }
        generateQuote();
    };
}

// 生成报价单
function generateQuote() {
    // 保存选配数据到 localStorage
    localStorage.setItem('selectedProducts', JSON.stringify(cart));

    // 跳转到报价单页面
    window.location.href = 'quote.html';
}
