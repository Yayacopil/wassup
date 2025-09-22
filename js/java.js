// JavaScript for ArtFrame Poster Store
    // Cart functionality
    let cart = [];
    let likedItems = JSON.parse(localStorage.getItem('likedItems')) || [];
    let customPosterRequest = null;
    let lastScrollPosition = 0;

    // DOM elements
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const customPosterForm = document.getElementById('custom-poster-form');
    const customPosterModal = document.getElementById('custom-poster-modal');
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Categories extracted from posters
    const categories = [
        { name: "Music", icon: "fas fa-solid fa-music", count: 0 },
        { name: "Cars", icon: "fas fa-solid fa-car", count: 0 },
        { name: "Movies", icon: "fas fa-film", count: 0 },
        { name: "Sports", icon: "fas fa-solid fa-person-skating", count: 0 },
        { name: "Nature", icon: "fas fa-mountain-sun", count: 0 },
        { name: "Inspirational Quotes", icon: "fas fa-comment", count: 0 },
        { name: "Art", icon: "fas fa-solid fa-crop", count: 0 },
        { name: "Other", icon: "fas fa-snowflake", count: 0 }
    ];


    // Calculate category counts
    posters.forEach(poster => {
        const category = categories.find(cat => cat.name === poster.category);
        if (category) {
            category.count++;
        }
    });

    // Render categories dropdown
    function renderCategories() {
        const categoriesDropdown = document.getElementById('categories-dropdown');
        categoriesDropdown.innerHTML = '';
        
        // Filter categories that have at least one poster
        const activeCategories = categories.filter(cat => cat.count > 0);
        
        activeCategories.forEach(category => {
            categoriesDropdown.innerHTML += `
                <a href="#" class="category-dropdown-item" data-category="${category.name}">
                    <i class="${category.icon} mr-2"></i>
                    ${category.name} (${category.count})
                </a>
            `;
        });
    }

    // Render posters and set up add-to-cart and like buttons
    function renderPosters(filterCategory = null) {
        const posterGallery = document.getElementById('poster-gallery');
        posterGallery.innerHTML = '';

        let filteredPosters = posters;
        if (filterCategory) {
            filteredPosters = posters.filter(poster => poster.category === filterCategory);
        }

        filteredPosters.forEach(poster => {
            const isLiked = likedItems.includes(String(poster.id));
            posterGallery.innerHTML += `
                <div class="flex flex-col items-center p-2">
                    <div class="relative w-full cursor-pointer group">
                        <img src="${poster.image}" alt="${poster.title}" 
                            class="w-full h-64 object-contain transition duration-200 hover:scale-105 rounded"
                            loading="lazy"
                            data-id="${poster.id}">
                        <button class="like-btn absolute top-2 right-2 bg-white p-2 rounded-full shadow-md ${isLiked ? 'liked' : ''}" data-item="${poster.id}">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="w-full mt-2 flex flex-col items-start">
                        <h3 class="font-semibold text-sm mb-1">${poster.title}</h3>
                        <span class="text-sm text-gray-600 mb-1">${poster.size} inches</span>
                        <span class="text-sm text-gray-600 mb-1">KSh${poster.price.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <button class="add-to-cart bg-black hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition duration-300 w-full mt-2"
                            data-id="${poster.id}"
                            data-name="${poster.title}"
                            data-price="${poster.price}"
                            data-img="${poster.image}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
        });

        // Make poster image clickable to open modal (no view button)
        posterGallery.querySelectorAll('img[data-id]').forEach(img => {
            img.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const poster = filteredPosters.find(p => p.id === id);
                showProductModal(poster, filteredPosters);
            });
        });

        setupPosterButtons(filteredPosters);
    }

    // Setup add-to-cart and like button listeners
    function setupPosterButtons(currentList = posters) {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                const name = button.getAttribute('data-name');
                const price = parseFloat(button.getAttribute('data-price'));
                const img = button.getAttribute('data-img');
                // Check if item already exists in cart
                const existingItem = cart.find(item => item.id === id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id,
                        name,
                        price,
                        img,
                        quantity: 1
                    });
                }
                updateCart();
                // Animation feedback
                button.innerHTML = '<i class="fas fa-check mr-2"></i> Added';
                button.classList.remove('bg-black');
                button.classList.add('bg-green-500');
                setTimeout(() => {
                    button.innerHTML = 'Add to Cart';
                    button.classList.remove('bg-green-500');
                    button.classList.add('bg-black');
                }, 1500);
            });
        });

        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', () => {
                const itemId = button.getAttribute('data-item');
                const icon = button.querySelector('i');
                if (likedItems.includes(itemId)) {
                    likedItems = likedItems.filter(id => id !== itemId);
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    button.classList.remove('liked');
                } else {
                    likedItems.push(itemId);
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    button.classList.add('liked');
                }
                localStorage.setItem('likedItems', JSON.stringify(likedItems));
            });
        });

        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(button.getAttribute('data-id'));
                const poster = currentList.find(p => p.id === id);
                showProductModal(poster, currentList); // Pass the filtered list
            });
        });
    }

    // Modal logic
    function showProductModal(poster, list = posters) {
        let currentIndex = list.findIndex(p => p.id === poster.id);

        // Modal setup
        let modal = document.getElementById('product-modal');
        let modalContent = document.getElementById('product-modal-content');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'product-modal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
            modal.innerHTML = `<div id="product-modal-content" class="bg-white rounded-lg shadow-lg max-w-md w-full p-0 relative"></div>`;
            document.body.appendChild(modal);
            modalContent = document.getElementById('product-modal-content');
        }

        // Helper to render the current item
        function renderModalContent(index, direction = 0) {
            const item = list[index];
            // direction: -1 for left, 1 for right, 0 for initial
            let slideClass = '';
            if (direction === -1) slideClass = 'slide-in-left';
            if (direction === 1) slideClass = 'slide-in-right';

            modalContent.innerHTML = `
                <button id="close-product-modal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl z-20">&times;</button>
                <div class="flex items-center justify-between px-2 pt-8 pb-2">
                    <button id="prev-product" class="text-2xl text-gray-400 hover:text-gray-700 px-2 py-1" ${index === 0 ? 'disabled' : ''}>&lt;</button>
                    <div class="flex-1 flex justify-center">
                        <div class="relative w-full">
                            <img src="${item.image}" alt="${item.title}" class="w-full max-h-[60vh] object-contain rounded mb-4 transition-all duration-500 opacity-0 ${slideClass}" loading="lazy">
                        </div>
                    </div>
                    <button id="next-product" class="text-2xl text-gray-400 hover:text-gray-700 px-2 py-1" ${index === list.length - 1 ? 'disabled' : ''}>&gt;</button>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-xl mb-2">${item.title}</h3>
                    <p class="text-gray-600 mb-2">${item.size ? item.size + ' inches' : ''}</p>
                    <p class="text-gray-700 mb-2">${item.description || ''}</p>
                    <p class="text-indigo-600 font-bold mb-4">KSh${item.price.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    <button class="add-to-cart bg-black hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition duration-300 w-full"
                        id="modal-add-to-cart"
                        data-id="${item.id}"
                        data-name="${item.title}"
                        data-price="${item.price}"
                        data-img="${item.image}">
                        Add to Cart
                    </button>
                </div>
            `;

            // Animate image in
            setTimeout(() => {
                const img = modalContent.querySelector('img');
                if (img) img.classList.add('opacity-100');
            }, 10);

            // Navigation
            modalContent.querySelector('#close-product-modal').onclick = () => modal.classList.add('hidden');
            modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

            const prevBtn = modalContent.querySelector('#prev-product');
            const nextBtn = modalContent.querySelector('#next-product');
            if (prevBtn) prevBtn.onclick = () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    renderModalContent(currentIndex, -1);
                }
            };
            if (nextBtn) nextBtn.onclick = () => {
                if (currentIndex < list.length - 1) {
                    currentIndex++;
                    renderModalContent(currentIndex, 1);
                }
            };

            // Add to cart logic
            const modalAddBtn = modalContent.querySelector('#modal-add-to-cart');
            modalAddBtn.onclick = function() {
                const btn = this;
                const id = parseInt(btn.getAttribute('data-id'));
                const name = btn.getAttribute('data-name');
                const price = parseFloat(btn.getAttribute('data-price'));
                const img = btn.getAttribute('data-img');
                const existingItem = cart.find(item => item.id === id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ id, name, price, img, quantity: 1 });
                }
                updateCart();
                btn.innerHTML = '<i class="fas fa-check mr-2"></i> Added';
                btn.classList.remove('bg-black', 'hover:bg-blue-700');
                btn.classList.add('bg-green-500');
                setTimeout(() => {
                    btn.innerHTML = 'Add to Cart';
                    btn.classList.remove('bg-green-500');
                    btn.classList.add('bg-black', 'hover:bg-blue-700');
                }, 1500);
            };
        }

        // Show modal and render initial content
        modal.classList.remove('hidden');
        renderModalContent(currentIndex, 0);
    }

    function animateCartBadge() {
    cartCount.classList.add('cart-bounce');
    setTimeout(() => cartCount.classList.remove('cart-bounce'), 400);
}
// Call this inside setupPosterButtons() after updateCart():
animateCartBadge();

    // Update cart UI
    function updateCart() {
        // Update cart count
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items list
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartItemsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                    <i class="fas fa-shopping-cart text-5xl mb-4"></i>
                    <p class="text-lg font-medium">Your cart is empty</p>
                </div>
            `;
        } else {
            emptyCartMessage.classList.add('hidden');
            let itemsHTML = '';
            let subtotal = 0;
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                itemsHTML += `
                    <div class="flex items-start border-b border-gray-200 pb-4">
                        <img src="${item.img}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4" loading="lazy">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-800">${item.name}</h4>
                            <p class="text-gray-600 text-sm">KSh${item.price.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            <div class="flex items-center mt-2">
                                <button class="decrease-quantity px-2 py-1 border border-gray-300 rounded-l" data-index="${index}">-</button>
                                <span class="quantity px-3 py-1 border-t border-b border-gray-300">${item.quantity}</span>
                                <button class="increase-quantity px-2 py-1 border border-gray-300 rounded-r" data-index="${index}">+</button>
                                <button class="remove-item ml-4 text-red-500 text-sm" data-index="${index}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="font-medium">KSh${itemTotal.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                `;
            });
            cartItemsContainer.innerHTML = itemsHTML;

            // Add event listeners to quantity buttons
            document.querySelectorAll('.decrease-quantity').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    if (cart[index].quantity > 1) {
                        cart[index].quantity -= 1;
                    } else {
                        cart.splice(index, 1);
                    }
                    updateCart();
                });
            });

            document.querySelectorAll('.increase-quantity').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    cart[index].quantity += 1;
                    updateCart();
                });
            });

            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = e.target.closest('button').getAttribute('data-index');
                    cart.splice(index, 1);
                    updateCart();
                });
            });
        }

        // Update totals
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartSubtotal.textContent = `KSh${subtotal.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        cartTotal.textContent = `KSh${subtotal.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        localStorage.setItem('cart', JSON.stringify(cart));

        // Always update delivery section visibility
        updateDeliveryVisibility();
    }

    function animateCartBadge() {
        cartCount.classList.add('cart-bounce');
        setTimeout(() => cartCount.classList.remove('cart-bounce'), 400);
    }

    // Cart sidebar open/close
    cartBtn.addEventListener('click', () => {
        lastScrollPosition = window.scrollY; // Save current scroll position
        cartSidebar.classList.add('open');
        cartOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    });

    cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    });

    const deliverySection = document.querySelector('.delivery-section'); 
    // Add this class to your delivery section div

function updateDeliveryVisibility() {
    if (cart.length > 0) {
        deliverySection.style.display = 'block';
    } else {
        deliverySection.style.display = 'none';
    }
}

// Run this function whenever the cart is updated
updateDeliveryVisibility();

// Prevent non-numeric input in phone number field
const phoneInput = document.getElementById('phone-number');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d]/g, '');
    });
}

// WhatsApp checkout functionality for CART
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const nameInput = document.getElementById('customer-name');
    const locationInput = document.getElementById('delivery-location');
    const phoneInput = document.getElementById('phone-number');
    const deadlineInput = document.getElementById('cart-deadline');
    const errorSpan = document.getElementById('cart-deadline-error');

    const name = nameInput.value.trim();
    const location = locationInput.value.trim();
    const phone = phoneInput.value.trim();
    const deadline = deadlineInput.value;

    // Kenyan phone number validation
    const phoneRegex = /^(07\d{8}|01\d{8}|2547\d{8})$/;

    let valid = true;

    // Name validation
    if (!name) {
        document.getElementById('customer-name-error').textContent = "Name is required.";
        nameInput.classList.add('border-red-500');
        valid = false;
    } else {
        document.getElementById('customer-name-error').textContent = "";
        nameInput.classList.remove('border-red-500');
    }

    // Location validation
    if (!location) {
        document.getElementById('delivery-location-error').textContent = "Delivery location is required.";
        locationInput.classList.add('border-red-500');
        valid = false;
    } else {
        document.getElementById('delivery-location-error').textContent = "";
        locationInput.classList.remove('border-red-500');
    }

    // Phone validation
    if (!phone) {
        document.getElementById('phone-number-error').textContent = "Phone number is required.";
        phoneInput.classList.add('border-red-500');
        valid = false;
    } else if (!phoneRegex.test(phone)) {
        document.getElementById('phone-number-error').textContent = "Invalid Kenyan phone number.";
        phoneInput.classList.add('border-red-500');
        valid = false;
    } else {
        document.getElementById('phone-number-error').textContent = "";
        phoneInput.classList.remove('border-red-500');
    }

    if (!valid) return;

    // Needed By validation
    const selectedDate = new Date(deadline);
    const minDate = new Date();
    minDate.setHours(0,0,0,0);
    minDate.setDate(minDate.getDate() + 1); // Tomorrow

    if (!deadline) {
        errorSpan.textContent = 'Please select a "Needed By Date".';
        deadlineInput.focus();
        return;
    }
    if (selectedDate < minDate) {
        errorSpan.textContent = 'Please select a "Needed By Date" that is at least one day from today.';
        deadlineInput.focus();
        return;
    } else {
        errorSpan.textContent = '';
    }

    let message = "Hello Wallypop! I'd like to order the following items:\n\n";
    cart.forEach(item => {
        message += `• ${item.name} (Qty: ${item.quantity}) — KSh ${(item.price * item.quantity).toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    message += `\nTotal: KSh ${Number(total).toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
    message += `Name: ${name}\n`;
    message += `Delivery Location: ${location}\n`;
    message += `Phone Number: ${phone}\n`;
    message += `Needed By: ${deadline}\n\n`;
    message += "Please let me know the next steps for payment and delivery. Thank you!";

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/254732657596?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Processing...";

    // After WhatsApp window opens or on error:
    setTimeout(() => {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Checkout";
    }, 2000);
});

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        const overlay = document.getElementById('mobile-menu-overlay');
        if (mobileMenu.classList.contains('open')) {
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        } else {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when overlay is clicked
    document.getElementById('mobile-menu-overlay').addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.getElementById('mobile-menu-overlay').classList.add('hidden');
        document.body.style.overflow = '';
    });

    // Optionally: close mobile menu when a menu link is clicked (for better UX)
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            document.getElementById('mobile-menu-overlay').classList.add('hidden');
            document.body.style.overflow = '';
        });
    });

    // Category filtering
    document.addEventListener('click', (e) => {
        if (e.target.closest('.category-dropdown-item')) {
            e.preventDefault();
            const category = e.target.closest('.category-dropdown-item').getAttribute('data-category');
            renderPosters(category);
            
            // Scroll to poster section
            document.querySelector('#poster-gallery').scrollIntoView({
                behavior: 'smooth'
            });
        }
    });

    // Home button resets poster gallery to show all posters
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            renderPosters(); // Show all posters

            // Scroll to the top of the page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // If you have a specific home section, use this instead:
            document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Continue shopping button functionality
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            document.getElementById('cart-sidebar').classList.remove('open');
            document.getElementById('cart-overlay').classList.add('hidden');
            document.body.style.overflow = '';
            window.scrollTo({ top: lastScrollPosition, behavior: 'smooth' }); // Restore scroll position
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Load cart from localStorage on page load
        const savedCart = localStorage.getItem('cart');
        if (savedCart) cart = JSON.parse(savedCart);
        renderCategories();
        renderPosters();
        updateCart();

        // NEW: custom poster autosave bootstrapping
        loadCustomProgress();
        attachCustomAutosave();
    });


document.addEventListener('DOMContentLoaded', function() {
    const deadlineInput = document.getElementById('deadline');
    const errorSpan = document.getElementById('deadline-error');
    if (deadlineInput) {
        // Set min date to tomorrow
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const minDate = `${yyyy}-${mm}-${dd}`;
        deadlineInput.setAttribute('min', minDate);

        deadlineInput.addEventListener('input', function() {
            if (deadlineInput.value < minDate) {
                errorSpan.textContent = 'Please select a date at least one day from today.';
                deadlineInput.value = '';
            } else {
                errorSpan.textContent = '';
            }
        });
    }

    // Cart deadline
    const cartDeadlineInput = document.getElementById('cart-deadline');
    const cartErrorSpan = document.getElementById('cart-deadline-error');
    if (cartDeadlineInput) {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const minDate = `${yyyy}-${mm}-${dd}`;
        cartDeadlineInput.setAttribute('min', minDate);

        cartDeadlineInput.addEventListener('input', function() {
            if (cartDeadlineInput.value < minDate) {
                cartErrorSpan.textContent = 'Please select a date at least one day from today.';
                cartDeadlineInput.value = '';
            } else {
                cartErrorSpan.textContent = '';
            }
        });
    }
});

// === Custom Poster Autosave (cart-style) ===
const CUSTOM_KEY = 'customPosterProgress';
const FIELD_IDS = {
  name: 'custom-name',
  description: 'description',
  width: 'width',
  height: 'height',
  deadline: 'custom-deadline',
  deliveryLocation: 'custom-delivery-location',
  phoneNumber: 'custom-phone-number'
};

function saveCustomProgress() {
  const data = {};
  for (const [k, id] of Object.entries(FIELD_IDS)) {
    const el = document.getElementById(id);
    if (el) data[k] = el.value;
  }
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(data));
}

function loadCustomProgress() {
  const raw = localStorage.getItem(CUSTOM_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    for (const [k, id] of Object.entries(FIELD_IDS)) {
      const el = document.getElementById(id);
      if (el && data[k] != null) el.value = data[k];
    }
  } catch (e) {
    console.warn('Bad customPosterProgress in localStorage', e);
    localStorage.removeItem(CUSTOM_KEY);
  }
}

function attachCustomAutosave() {
  const form = document.getElementById('custom-poster-form');
  if (!form) return;
  form.addEventListener('input', saveCustomProgress);
  form.addEventListener('change', saveCustomProgress);
}

// --- Custom Poster Form Logic ---
// Remove the old restore/save progress blocks here

// Custom poster deadline min date logic
const customDeadlineInput = document.getElementById('custom-deadline');
const customErrorSpan = document.getElementById('custom-deadline-error');
if (customDeadlineInput) {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    customDeadlineInput.setAttribute('min', minDate);

    customDeadlineInput.addEventListener('input', function() {
        if (customDeadlineInput.value < minDate) {
            customErrorSpan.textContent = 'Please select a date at least one day from today.';
            customDeadlineInput.value = '';
        } else {
            customErrorSpan.textContent = '';
        }
    });
}

// Submit: prevent reload, validate, show modal (do NOT reset/clear here)
customPosterForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('custom-name').value.trim();
    const description = document.getElementById('description').value.trim();
    const width = document.getElementById('width').value.trim();
    const height = document.getElementById('height').value.trim();
    const deadline = document.getElementById('custom-deadline').value.trim();
    const deliveryLocation = document.getElementById('custom-delivery-location').value.trim();
    const phoneNumber = document.getElementById('custom-phone-number').value.trim();
    const artworkInput = document.getElementById('custom-artwork');
    let artworkFile = null;
    if (artworkInput && artworkInput.files.length > 0) {
        artworkFile = artworkInput.files[0];
    }

    // Validate name, delivery location and phone number
    if (!name || !deliveryLocation || !phoneNumber) {
        alert('Please enter your name, delivery location and phone number.');
        return;
    }
    // Kenyan phone number validation
    const phoneRegex = /^(07\d{8}|01\d{8}|2547\d{8})$/;
    if (!phoneRegex.test(phoneNumber)) {
        alert("Please enter a valid Kenyan phone number (e.g., 0712XXXXXX, 0112XXXXXX, or 2547XXXXXXX).");
        document.getElementById('custom-phone-number').focus();
        return;
    }

    const selectedDate = new Date(deadline);
    const minDate = new Date();
    minDate.setHours(0,0,0,0);
    minDate.setDate(minDate.getDate() + 1); // Tomorrow

    if (selectedDate < minDate) {
        alert('Please select a "Needed By Date" that is at least one day from today.');
        document.getElementById('custom-deadline').focus();
        return;
    }

    // Store the custom poster request for WhatsApp
    customPosterRequest = {
        name,
        description,
        width,
        height,
        deadline,
        deliveryLocation,
        phoneNumber,
        artworkFile,
        hasArtwork: !!artworkFile
    };

    // Show success modal
    customPosterModal.style.display = 'flex';
});

// WhatsApp custom poster checkout
whatsappCheckoutBtn.addEventListener('click', () => {
    if (!customPosterRequest) return;

    let message = "Hello Wallypop! I'd like to request a custom poster with the following details:\n\n";
    message += `Name: ${customPosterRequest.name}\n`;
    message += `Description: ${customPosterRequest.description}\n`;
    message += `Size: ${customPosterRequest.width} x ${customPosterRequest.height} inches\n`;
    message += `Needed by: ${customPosterRequest.deadline}\n`;
    message += `Delivery Location: ${customPosterRequest.deliveryLocation}\n`;
    message += `Phone Number: ${customPosterRequest.phoneNumber}\n`;
    if (customPosterRequest.artworkFile) {
        message += "Artwork: Attached (Send via WhatsApp after this message)\n";
    }
    message += "Please let me know if you need any additional information. Thank you!";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/254732657596?text=${encodedMessage}`, '_blank');

    // Reset everything after sending
    const formEl = document.getElementById('custom-poster-form');
    if (formEl) formEl.reset();
    localStorage.removeItem('customPosterProgress');
    customPosterRequest = null;
    customPosterModal.style.display = 'none';
});

// Close: just hide modal, do NOT reset form
closeModalBtn.addEventListener('click', function() {
    customPosterModal.style.display = 'none';
});

// Sorting logic (replace sales with price)
document.getElementById('sort-up').addEventListener('click', function() {
    // Sort posters by price descending (highest price first)
    posters.sort((a, b) => (b.price || 0) - (a.price || 0));
    renderPosters();
});

document.getElementById('sort-down').addEventListener('click', function() {
    // Sort posters by price ascending (lowest price first)
    posters.sort((a, b) => (a.price || 0) - (b.price || 0));
    renderPosters();
});