// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    user: null,
    cart: [],
    appliedDiscount: null,
    wonDiscounts: [],
    orders: [],
    currentOrder: null,
    wheelRotation: 0,
    isSpinning: false
};

const foodMenu = [
    { id: 1, name: 'Paneer Tikka', category: 'starters', price: 250, description: 'Grilled paneer with Indian spices', image: 'paneertikka.jpeg' },
    { id: 2, name: 'Samosa', category: 'starters', price: 80, description: 'Crispy potato-filled pastry', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { id: 3, name: 'Butter Chicken', category: 'main', price: 350, description: 'Creamy tomato-based chicken curry', image: 'ButterChicken.jpeg' },
    { id: 4, name: 'Tandoori Chicken', category: 'main', price: 400, description: 'Spiced grilled chicken', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400' },
    { id: 5, name: 'Dal Makhni', category: 'main', price: 200, description: 'Creamy lentil curry', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
    { id: 6, name: 'Biryani', category: 'main', price: 450, description: 'Fragrant rice dish with meat', image: 'biryani.jpeg' },
    { id: 7, name: 'Gulab Jamun', category: 'desserts', price: 120, description: 'Sweet milk solids in syrup', image: 'gulabjamun.jpeg' },
    { id: 8, name: 'Kheer', category: 'desserts', price: 100, description: 'Rice pudding with nuts', image: 'kheer.jpeg' },
    { id: 9, name: 'Mango Lassi', category: 'beverages', price: 90, description: 'Yogurt-based mango drink', image: 'mangolassi.jpeg' },
    { id: 10, name: 'Masala Chai', category: 'beverages', price: 40, description: 'Spiced Indian tea', image: 'masalachai.jpeg' },
    { id: 11, name: 'Spring Roll', category: 'starters', price: 150, description: 'Crispy vegetable roll', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
    { id: 12, name: 'Naan Bread', category: 'main', price: 60, description: 'Soft Indian flatbread', image: 'naanbread.jpeg' }
];

const discounts = [
    { code: 'SAVE10', percent: 10 },
    { code: 'SAVE20', percent: 20 },
    { code: 'FREE50', percent: 50 }
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadStateFromLocalStorage();
    initializeEventListeners();
    renderFoodMenu();
    initializeWheel();
    updateUI();
    updateCartBadge();
});

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================

function saveStateToLocalStorage() {
    localStorage.setItem('foodieHubState', JSON.stringify({
        user: state.user,
        cart: state.cart,
        appliedDiscount: state.appliedDiscount,
        wonDiscounts: state.wonDiscounts,
        orders: state.orders
    }));
}

function loadStateFromLocalStorage() {
    const savedState = localStorage.getItem('foodieHubState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        state.user = parsed.user;
        state.cart = parsed.cart || [];
        state.appliedDiscount = parsed.appliedDiscount;
        state.wonDiscounts = parsed.wonDiscounts || [];
        state.orders = parsed.orders || [];
    }
}

// ============================================
// AUTHENTICATION
// ============================================

document.getElementById('signinBtn').addEventListener('click', () => {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('signInForm').classList.add('active-form');
    document.getElementById('signUpForm').classList.remove('active-form');
});

document.getElementById('closeAuthBtn').addEventListener('click', () => {
    document.getElementById('authModal').style.display = 'none';
});

document.getElementById('toggleToSignup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signInForm').classList.remove('active-form');
    document.getElementById('signUpForm').classList.add('active-form');
});

document.getElementById('toggleToSignin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signUpForm').classList.remove('active-form');
    document.getElementById('signInForm').classList.add('active-form');
});

document.getElementById('signInForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateSignInForm()) {
        const email = document.getElementById('signin-email').value;
        // Check if user exists in orders
        const existingUser = state.orders.find(order => order.userEmail === email);
        if (existingUser) {
            // Load existing user from an order
            state.user = {
                name: existingUser.userName,
                email: existingUser.userEmail,
                phone: existingUser.userPhone,
                address: existingUser.userAddress
            };
        } else {
            // Create new user (for existing account scenario)
            state.user = {
                name: email.split('@')[0],
                email: email,
                phone: '9000000000',
                address: 'Login Address'
            };
        }
        saveStateToLocalStorage();
        document.getElementById('authModal').style.display = 'none';
        updateUI();
        clearAuthForms();
        showNotification('Sign in successful!');
    }
});

document.getElementById('signUpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateSignUpForm()) {
        state.user = {
            name: document.getElementById('signup-name').value,
            email: document.getElementById('signup-email').value,
            phone: document.getElementById('signup-phone').value,
            address: document.getElementById('signup-address').value
        };
        saveStateToLocalStorage();
        document.getElementById('authModal').style.display = 'none';
        updateUI();
        clearAuthForms();
        showNotification('Account created successfully!');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    state.user = null;
    state.cart = [];
    state.appliedDiscount = null;
    state.currentOrder = null;
    saveStateToLocalStorage();
    updateUI();
    updateCartBadge();
    showNotification('Logged out successfully!');
});

document.getElementById('signInPromptBtn').addEventListener('click', () => {
    document.getElementById('signinBtn').click();
});

function validateSignInForm() {
    clearErrorMessages(['signin-email', 'signin-password']);
    let isValid = true;

    const email = document.getElementById('signin-email').value;
    if (!email || !isValidEmail(email)) {
        showError('signin-email', 'Please enter a valid email');
        isValid = false;
    }

    const password = document.getElementById('signin-password').value;
    if (!password || password.length < 6) {
        showError('signin-password', 'Password must be at least 6 characters');
        isValid = false;
    }

    return isValid;
}

function validateSignUpForm() {
    clearErrorMessages(['signup-name', 'signup-email', 'signup-phone', 'signup-address', 'signup-password']);
    let isValid = true;

    const name = document.getElementById('signup-name').value;
    if (!name || name.trim().length < 2) {
        showError('signup-name', 'Please enter a valid name');
        isValid = false;
    }

    const email = document.getElementById('signup-email').value;
    if (!email || !isValidEmail(email)) {
        showError('signup-email', 'Please enter a valid email');
        isValid = false;
    }

    const phone = document.getElementById('signup-phone').value;
    if (!phone || !isValidPhone(phone)) {
        showError('signup-phone', 'Please enter a valid 10-digit phone number');
        isValid = false;
    }

    const address = document.getElementById('signup-address').value;
    if (!address || address.trim().length < 10) {
        showError('signup-address', 'Please enter a valid address');
        isValid = false;
    }

    const password = document.getElementById('signup-password').value;
    if (!password || password.length < 6) {
        showError('signup-password', 'Password must be at least 6 characters');
        isValid = false;
    }

    return isValid;
}

function clearAuthForms() {
    document.getElementById('signin-email').value = '';
    document.getElementById('signin-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-phone').value = '';
    document.getElementById('signup-address').value = '';
    document.getElementById('signup-password').value = '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrorMessages(fieldIds) {
    fieldIds.forEach(id => {
        const errorElement = document.getElementById(`${id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    });
}

// ============================================
// MENU & FOOD ITEMS
// ============================================

function renderFoodMenu(category = 'all') {
    const foodGrid = document.getElementById('foodGrid');
    foodGrid.innerHTML = '';

    const filteredMenu = category === 'all' ? foodMenu : foodMenu.filter(item => item.category === category);

    filteredMenu.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <div class="food-image" style="background-image: url('${food.image}');"></div>
            <div class="food-content">
                <span class="food-category">${capitalizeFirstLetter(food.category)}</span>
                <h3 class="food-title">${food.name}</h3>
                <p class="food-description">${food.description}</p>
                <div class="food-footer">
                    <span class="food-price">₹${food.price}</span>
                    <button class="btn-add-cart" data-id="${food.id}">Add to Cart</button>
                </div>
            </div>
        `;

        foodCard.querySelector('.btn-add-cart').addEventListener('click', () => {
            addToCart(food);
        });

        foodGrid.appendChild(foodCard);
    });
}

// Category Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.category;
        renderFoodMenu(category);
    });
});

// ============================================
// CART MANAGEMENT
// ============================================

function addToCart(food) {
    if (!state.user) {
        showNotification('Please sign in to add items to cart');
        document.getElementById('signinBtn').click();
        return;
    }

    const existingItem = state.cart.find(item => item.id === food.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push({
            id: food.id,
            name: food.name,
            price: food.price,
            quantity: 1
        });
    }

    saveStateToLocalStorage();
    updateCartBadge();
    updateCartDisplay();
    showNotification(`${food.name} added to cart!`);
}

function removeFromCart(foodId) {
    state.cart = state.cart.filter(item => item.id !== foodId);
    saveStateToLocalStorage();
    updateCartBadge();
    updateCartDisplay();
    showNotification('Item removed from cart');
}

function updateQuantity(foodId, delta) {
    const item = state.cart.find(item => item.id === foodId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(foodId);
        } else {
            saveStateToLocalStorage();
            updateCartDisplay();
        }
    }
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');

    if (state.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-message">Your cart is empty. Start adding items!</p>';
        updateCartTotals();
        return;
    }

    cartItemsContainer.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
            </div>
            <div class="cart-item-total">₹${item.price * item.quantity}</div>
            <button class="btn-remove" data-id="${item.id}">Remove</button>
        </div>
    `).join('');

    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            const delta = action === 'increase' ? 1 : -1;
            updateQuantity(itemId, delta);
        });
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            removeFromCart(itemId);
        });
    });

    updateCartTotals();
}

function updateCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = state.appliedDiscount ? state.appliedDiscount.percent : 0;
    const discountAmount = Math.floor(subtotal * discountPercent / 100);
    const total = subtotal - discountAmount;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('discountDisplay').textContent = state.appliedDiscount ? state.appliedDiscount.code : 'None';
    document.getElementById('discountAmount').textContent = `₹${discountAmount}`;
    document.getElementById('cartTotal').textContent = `₹${total}`;
}

document.getElementById('continueShopping').addEventListener('click', () => {
    document.querySelector('html').scrollTop = 0;
    document.querySelector('body').scrollTop = 0;
    window.scrollTo(0, 0);
});

// ============================================
// GAME ZONE - SPIN THE WHEEL
// ============================================

let wheelCanvas = null;
let wheelCtx = null;

function initializeWheel() {
    wheelCanvas = document.getElementById('wheelCanvas');
    wheelCtx = wheelCanvas.getContext('2d');
    drawWheel();
}

function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = 180;
    const sliceAngle = (2 * Math.PI) / discounts.length;

    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    discounts.forEach((discount, index) => {
        const startAngle = index * sliceAngle + state.wheelRotation;
        const endAngle = (index + 1) * sliceAngle + state.wheelRotation;

        // Draw slice
        wheelCtx.beginPath();
        wheelCtx.moveTo(centerX, centerY);
        wheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
        wheelCtx.closePath();
        wheelCtx.fillStyle = index === 0 ? '#FF6B35' : index === 1 ? '#F7931E' : '#C41E3A';
        wheelCtx.fill();

        // Draw border
        wheelCtx.strokeStyle = '#FFFFFF';
        wheelCtx.lineWidth = 3;
        wheelCtx.stroke();

        // Draw text
        const textAngle = startAngle + sliceAngle / 2;
        const textX = centerX + Math.cos(textAngle) * (radius * 0.6);
        const textY = centerY + Math.sin(textAngle) * (radius * 0.6);

        wheelCtx.fillStyle = '#FFFFFF';
        wheelCtx.font = 'bold 14px Arial';
        wheelCtx.textAlign = 'center';
        wheelCtx.textBaseline = 'middle';
        wheelCtx.save();
        wheelCtx.translate(textX, textY);
        wheelCtx.rotate(textAngle);
        wheelCtx.fillText(discount.code, 0, 0);
        wheelCtx.restore();
    });

    // Draw center circle
    wheelCtx.beginPath();
    wheelCtx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    wheelCtx.fillStyle = '#1A1A1A';
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#FFFFFF';
    wheelCtx.lineWidth = 2;
    wheelCtx.stroke();

    // Draw pointer
    wheelCtx.beginPath();
    wheelCtx.moveTo(centerX, 0);
    wheelCtx.lineTo(centerX - 10, 30);
    wheelCtx.lineTo(centerX + 10, 30);
    wheelCtx.closePath();
    wheelCtx.fillStyle = '#1A1A1A';
    wheelCtx.fill();
}

document.getElementById('spinBtn').addEventListener('click', spinWheel);

function spinWheel() {
    if (!state.user) {
        showNotification('Please sign in to play the game');
        document.getElementById('signinBtn').click();
        return;
    }

    if (state.isSpinning) return;

    state.isSpinning = true;
    document.getElementById('spinBtn').disabled = true;

    const spinAmount = Math.random() * 5 + 5; // 5-10 rotations
    const targetRotation = state.wheelRotation + (spinAmount * 2 * Math.PI) + (Math.random() * (2 * Math.PI / discounts.length));
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    const startRotation = state.wheelRotation;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        state.wheelRotation = startRotation + (targetRotation - startRotation) * easeProgress;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            state.isSpinning = false;
            state.wheelRotation = targetRotation % (2 * Math.PI);
            drawWheel();
            showWheelResult();
        }
    }

    animate();
}

function showWheelResult() {
    const sliceAngle = (2 * Math.PI) / discounts.length;
    // Normalize rotation to 0-2π
    let normalizedRotation = state.wheelRotation % (2 * Math.PI);
    if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;

    // The pointer is at top, so we need to find which slice it points to
    const pointerAngle = (3 * Math.PI / 2) % (2 * Math.PI); // Top of wheel
    let resultAngle = (pointerAngle - normalizedRotation) % (2 * Math.PI);
    if (resultAngle < 0) resultAngle += 2 * Math.PI;

    const winningIndex = Math.floor(resultAngle / sliceAngle);
    const wonDiscount = discounts[winningIndex];

    // Add to won discounts if not already present
    if (!state.wonDiscounts.find(d => d.code === wonDiscount.code)) {
        state.wonDiscounts.push(wonDiscount);
    }
    saveStateToLocalStorage();

    document.getElementById('discountCode').textContent = wonDiscount.code;
    document.getElementById('discountPercent').textContent = `${wonDiscount.percent}% OFF on your next order`;
    document.getElementById('wheelResult').style.display = 'block';
    document.getElementById('spinBtn').disabled = false;

    updateWonDiscountsList();
}

document.getElementById('applyDiscountBtn').addEventListener('click', () => {
    const code = document.getElementById('discountCode').textContent;
    const discount = discounts.find(d => d.code === code);

    if (discount) {
        state.appliedDiscount = discount;
        saveStateToLocalStorage();
        updateCartTotals();
        showNotification(`Discount ${code} applied to cart!`);
        document.getElementById('wheelResult').style.display = 'none';
    }
});

function updateWonDiscountsList() {
    const list = document.getElementById('wonDiscountsList');

    if (state.wonDiscounts.length === 0) {
        list.innerHTML = '<p class="empty-message">No discounts won yet. Play the game to win!</p>';
        return;
    }

    list.innerHTML = state.wonDiscounts.map(discount => `
        <div class="discount-item">
            <span>${discount.code}</span>
            <span>${discount.percent}% OFF</span>
        </div>
    `).join('');
}

// ============================================
// CHECKOUT & DELIVERY
// ============================================

document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (state.cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }

    if (!state.user) {
        showNotification('Please sign in to checkout');
        document.getElementById('signinBtn').click();
        return;
    }

    document.getElementById('checkoutModal').style.display = 'flex';
    updateCheckoutSummary();
    switchCheckoutTab('delivery');
});

document.getElementById('closeCheckoutBtn').addEventListener('click', () => {
    document.getElementById('checkoutModal').style.display = 'none';
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        switchCheckoutTab(tabName);
    });
});

function switchCheckoutTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab-content`).classList.add('active');
}

function updateCheckoutSummary() {
    const summary = document.getElementById('checkoutSummary');
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = state.appliedDiscount ? state.appliedDiscount.percent : 0;
    const discountAmount = Math.floor(subtotal * discountPercent / 100);
    const total = subtotal - discountAmount;

    let html = '';
    state.cart.forEach(item => {
        html += `
            <div class="summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `;
    });

    html += `
        <div class="summary-item">
            <span>Subtotal</span>
            <span>₹${subtotal}</span>
        </div>
    `;

    if (state.appliedDiscount) {
        html += `
            <div class="summary-item">
                <span>${state.appliedDiscount.code} (${state.appliedDiscount.percent}% OFF)</span>
                <span>-₹${discountAmount}</span>
            </div>
        `;
    }

    html += `
        <div class="summary-item total">
            <span>Total Amount</span>
            <span>₹${total}</span>
        </div>
    `;

    summary.innerHTML = html;
}

document.getElementById('deliveryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateDeliveryForm()) {
        completeCheckout();
    }
});

document.getElementById('confirmDeliveryBtn').addEventListener('click', () => {
    const form = document.getElementById('deliveryForm');
    if (form.reportValidity() && validateDeliveryForm()) {
        completeCheckout();
    }
});

function validateDeliveryForm() {
    clearErrorMessages(['delivery-state', 'delivery-city', 'delivery-pincode']);
    let isValid = true;

    const state_val = document.getElementById('delivery-state').value;
    if (!state_val || state_val.trim().length < 2) {
        showError('delivery-state', 'Please enter a valid state');
        isValid = false;
    }

    const city = document.getElementById('delivery-city').value;
    if (!city || city.trim().length < 2) {
        showError('delivery-city', 'Please enter a valid city');
        isValid = false;
    }

    const pincode = document.getElementById('delivery-pincode').value;
    if (!pincode || !/^[0-9]{6}$/.test(pincode)) {
        showError('delivery-pincode', 'Please enter a valid 6-digit PIN code');
        isValid = false;
    }

    const paymentMethod = document.getElementById('payment-method').value;
    if (!paymentMethod) {
        showNotification('Please select a payment method');
        isValid = false;
    }

    return isValid;
}

function completeCheckout() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountPercent = state.appliedDiscount ? state.appliedDiscount.percent : 0;
    const discountAmount = Math.floor(subtotal * discountPercent / 100);
    const total = subtotal - discountAmount;

    const order = {
        orderId: 'ORD' + Date.now(),
        userName: state.user.name,
        userEmail: state.user.email,
        userPhone: state.user.phone,
        userAddress: state.user.address,
        items: [...state.cart],
        deliveryState: document.getElementById('delivery-state').value,
        deliveryCity: document.getElementById('delivery-city').value,
        deliveryPincode: document.getElementById('delivery-pincode').value,
        deliveryLandmark: document.getElementById('delivery-landmark').value,
        paymentMethod: document.getElementById('payment-method').value,
        subtotal: subtotal,
        discount: state.appliedDiscount,
        discountAmount: discountAmount,
        total: total,
        status: 'placed',
        timestamp: new Date().toISOString()
    };

    state.orders.push(order);
    state.currentOrder = order;
    state.cart = [];
    state.appliedDiscount = null;

    saveStateToLocalStorage();
    updateUI();
    updateCartBadge();

    // Switch to tracking tab
    switchCheckoutTab('tracking');

    // Clear delivery form
    document.getElementById('deliveryForm').reset();

    showNotification('Order placed successfully!');
}

document.getElementById('simulateDeliveryBtn').addEventListener('click', () => {
    if (!state.currentOrder) return;

    const steps = ['placed', 'preparing', 'dispatched', 'delivered'];
    const currentStatus = state.currentOrder.status;
    const currentIndex = steps.indexOf(currentStatus);

    if (currentIndex < steps.length - 1) {
        state.currentOrder.status = steps[currentIndex + 1];
        updateOrderTracking();
        saveStateToLocalStorage();
    }
});

function updateOrderTracking() {
    if (!state.currentOrder) return;

    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(step => {
        step.classList.remove('active');
    });

    const messages = {
        placed: 'Your order has been placed successfully!',
        preparing: 'Your order is being prepared in our kitchen.',
        dispatched: 'Your order is out for delivery!',
        delivered: 'Your order has been delivered. Thank you for ordering!'
    };

    const currentStatusStep = document.querySelector(`[data-step="${state.currentOrder.status}"]`);
    if (currentStatusStep) {
        const precedingSteps = currentStatusStep.parentElement.querySelectorAll(`[data-step]:not([data-step="${state.currentOrder.status}"])`);
        precedingSteps.forEach((step, index) => {
            if (index < Array.from(currentStatusStep.parentElement.children).indexOf(currentStatusStep)) {
                step.classList.add('active');
            }
        });
        currentStatusStep.classList.add('active');
    }

    document.getElementById('trackingMessage').textContent = messages[state.currentOrder.status];
}

// ============================================
// PROFILE SECTION
// ============================================

function updateProfileDisplay() {
    const profileContent = document.getElementById('profileContent');
    const profilePlaceholder = document.getElementById('profilePlaceholder');

    if (state.user) {
        profilePlaceholder.style.display = 'none';
        profileContent.style.display = 'block';

        document.getElementById('profileName').textContent = state.user.name;
        document.getElementById('profileEmail').textContent = state.user.email;
        document.getElementById('profilePhone').textContent = state.user.phone;
        document.getElementById('profileAddress').textContent = state.user.address;

        // Display order history
        const userOrders = state.orders.filter(order => order.userEmail === state.user.email);
        const orderHistoryList = document.getElementById('orderHistoryList');

        if (userOrders.length === 0) {
            orderHistoryList.innerHTML = '<p class="empty-message">No orders placed yet.</p>';
        } else {
            orderHistoryList.innerHTML = userOrders.map(order => `
                <div class="order-item">
                    <div class="order-id">Order #${order.orderId}</div>
                    <div class="order-date">${new Date(order.timestamp).toLocaleDateString()}</div>
                    <div class="order-amount">Total: ₹${order.total}</div>
                </div>
            `).join('');
        }
    } else {
        profileContent.style.display = 'none';
        profilePlaceholder.style.display = 'block';
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function updateUI() {
    const signinBtn = document.getElementById('signinBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (state.user) {
        signinBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        signinBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }

    updateCartDisplay();
    updateProfileDisplay();
    updateWonDiscountsList();
    if (state.currentOrder) {
        updateOrderTracking();
    }
}

function initializeEventListeners() {
    // Modal close on overlay click
    document.getElementById('authModal').addEventListener('click', (e) => {
        if (e.target.id === 'authModal') {
            document.getElementById('authModal').style.display = 'none';
        }
    });

    document.getElementById('checkoutModal').addEventListener('click', (e) => {
        if (e.target.id === 'checkoutModal') {
            document.getElementById('checkoutModal').style.display = 'none';
        }
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showNotification(message) {
    // Simple alert notification - could be enhanced with toast UI
    console.log(message);
    // You can uncomment to use alerts:
    // alert(message);

    // Alternative: Create a toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #27AE60;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animations to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// DEMO DATA INITIALIZATION
// ============================================

// Pre-populate with a sample order for demonstration
window.addEventListener('load', () => {
    if (state.orders.length === 0) {
        const demoOrder = {
            orderId: 'ORD1234567890',
            userName: 'Demo User',
            userEmail: 'demo@example.com',
            userPhone: '9876543210',
            userAddress: 'Demo Address, Delhi, 110001',
            items: [
                { id: 3, name: 'Butter Chicken', price: 350, quantity: 1 },
                { id: 12, name: 'Naan Bread', price: 60, quantity: 2 }
            ],
            deliveryState: 'Delhi',
            deliveryCity: 'New Delhi',
            deliveryPincode: '110001',
            deliveryLandmark: 'Demo Landmark',
            paymentMethod: 'cod',
            subtotal: 470,
            discount: null,
            discountAmount: 0,
            total: 470,
            status: 'delivered',
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        };
        state.orders.push(demoOrder);
        saveStateToLocalStorage();
    }
});
