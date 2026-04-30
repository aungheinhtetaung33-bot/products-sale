// Shared page scripts

document.addEventListener('DOMContentLoaded', () => {
    initResponsiveNav();
    updateCartCount();
    if (document.getElementById('cartList')) {
        displayCart();
    }
    if (document.getElementById('membershipForm')) {
        document.getElementById('membershipForm').addEventListener('submit', handleMembershipSignup);
    }
});

function initResponsiveNav() {
    const header = document.querySelector('header');
    if (!header) return;
    const nav = header.querySelector('nav');
    const toggle = header.querySelector('.nav-toggle');
    if (!nav || !toggle) return;
    toggle.addEventListener('click', () => nav.classList.toggle('show'));
}

function updateCartCount() {
    const cartLink = document.querySelector('nav a[href="cart.html"]');
    if (!cartLink) return;

    let badge = cartLink.querySelector('.cart-count-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-count-badge';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = '700';
        badge.style.background = '#ff5252';
        badge.style.color = 'white';
        badge.style.padding = '2px 7px';
        badge.style.borderRadius = '999px';
        badge.style.marginBottom = '4px';
        badge.style.display = 'inline-block';
        badge.style.lineHeight = '1';
        badge.style.minWidth = '22px';
        badge.style.textAlign = 'center';
        badge.style.boxSizing = 'border-box';
        badge.style.letterSpacing = '0.02em';
        badge.style.cursor = 'default';
        cartLink.insertBefore(badge, cartLink.firstChild);
        cartLink.style.display = 'inline-flex';
        cartLink.style.flexDirection = 'column';
        cartLink.style.alignItems = 'center';
        cartLink.style.gap = '2px';
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
}

function ShopNow() {
    window.location.href = 'products.html';
}

const productImages = {
    'Tent': 'Tent.png.jpg',
    'Backpack': 'backpack.webp',
    'Lighting': 'lighting.webp',
    'CampingGasCansiter': 'Camping Gas Canister Stand Legs _ Portable Stove Stability Base (EN417).jpg',
    'Trail Runner Hiking Boots': 'Hiking boots.jpg',
    'Hiking boots': 'Hiking boots.jpg'
};

function getProductImage(name) {
    return productImages[name] || '';
}

function addToCart(name, price = 0, image = '') {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === name);
    const imageUrl = image || getProductImage(name);
    if (existingItem) {
        existingItem.quantity += 1;
        if (!existingItem.image && imageUrl) {
            existingItem.image = imageUrl;
        }
    } else {
        cart.push({ name, price: Number(price), quantity: 1, image: imageUrl });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${name} added to cart!`);
}

function filterProducts(event, category) {
    const cards = document.querySelectorAll('.card[data-category]');
    cards.forEach(card => {
        const cat = card.dataset.category || 'all';
        card.style.display = category === 'all' || cat === category ? 'block' : 'none';
    });

    document.querySelectorAll('.buttons button').forEach(btn => btn.classList.remove('active-btn'));
    if (event && event.target) {
        event.target.classList.add('active-btn');
    }

    const countText = document.querySelector('.ShowingProducts h5');
    if (countText) {
        const visible = Array.from(cards).filter(card => card.style.display !== 'none').length;
        countText.textContent = `Showing ${visible} products`;
    }
}

function login(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value.trim();
    if (!email || !password) {
        alert('Please fill all fields');
        return;
    }
    alert('Login successful!');
}

function register(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const passwords = form.querySelectorAll('input[type="password"]');
    const password = passwords[0]?.value.trim() || '';
    const confirm = passwords[1]?.value.trim() || '';

    if (!name || !email || !password || !confirm) {
        alert('Please fill all fields');
        return;
    }
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    alert('Registration successful!');
    form.reset();
}

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartList = document.getElementById('cartList');
    const emptyMessage = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (!cartList) return;

    cartList.innerHTML = '';
    if (cart.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (checkoutBtn) checkoutBtn.disabled = true;
        updateSummary();
        updateCartCount();
        return;
    }

    if (emptyMessage) emptyMessage.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;

    let cartUpdated = false;
    cart.forEach(item => {
        if (!item.image) {
            const imageUrl = getProductImage(item.name);
            if (imageUrl) {
                item.image = imageUrl;
                cartUpdated = true;
            }
        }
    });
    if (cartUpdated) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    cart.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'cart-item';
        const imageHtml = item.image ? `<img src="${item.image}" alt="${item.name}">` : '';
        card.innerHTML = `
            ${imageHtml}
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>Price: $${item.price.toFixed(2)}</p>
                <div class="quantity">
                    <button type="button" onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="item-right">
                <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-btn" type="button" onclick="removeItem(${index})">Remove</button>
            </div>
        `;
        cartList.appendChild(card);
    });

    updateSummary();
    updateCartCount();
}

function changeQuantity(index, delta) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart[index]) return;
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart[index]) return;
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 10.0;
    const total = subtotal + shipping;
    localStorage.removeItem('cart');
    displayCart();
    alert(`Checkout complete. Total: $${total.toFixed(2)}. Thank you!`);
}

function selectPlan(plan) {
    const selectElement = document.getElementById('plan');
    if (selectElement) {
        selectElement.value = plan;
        alert(`You selected the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
    }
}

function handleMembershipSignup(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const plan = document.getElementById('plan').value;

    if (name && email && plan) {
        alert(`Thank you, ${name}! You have signed up for the ${plan} membership. A confirmation email will be sent to ${email}.`);
        // Here you could send data to a server or store locally
        document.getElementById('membershipForm').reset();
    } else {
        alert('Please fill in all fields.');
    }
}

function updateSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = cart.length ? 10.0 : 0.0;
    const total = subtotal + shipping;
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}