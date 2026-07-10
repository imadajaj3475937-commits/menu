/**
 * Electronic Restaurant Menu - JavaScript
 * Fully Dynamic - Add/Remove categories and items from JSON only
 */

// ============================================================
// GLOBAL DATA VARIABLES
// ============================================================

let config = {};
let menuData = [];
let categories = [];

// ============================================================
// LOAD DATA FROM JSON FILES
// ============================================================

async function loadData() {
    try {
        console.log('جاري تحميل البيانات...');
        
        const [configRes, menuRes] = await Promise.all([
            fetch('./config.json'),
            fetch('./menu-data.json')
        ]);

        if (!configRes.ok || !menuRes.ok) {
            throw new Error('فشل تحميل ملفات البيانات');
        }

        config = await configRes.json();
        const menuFile = await menuRes.json();
        
        menuData = menuFile.items || [];
        categories = menuFile.categories || [];

        console.log('✓ تم تحميل البيانات بنجاح');
        console.log('عدد الأقسام:', categories.length);
        console.log('عدد الأطباق:', menuData.length);

        updateUIWithConfig();
        generateCategoriesUI();
        generateMenuSections();
        
        app.init();

    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showLoadingError(error.message);
    }
}

// ============================================================
// GENERATE CATEGORIES DYNAMICALLY
// ============================================================

function generateCategoriesUI() {
    const categoriesScroll = document.querySelector('.categories-scroll');
    categoriesScroll.innerHTML = ''; // Clear

    categories.forEach((category, index) => {
        const button = document.createElement('button');
        button.className = `category-btn ${index === 0 ? 'active' : ''}`;
        button.dataset.category = category.id;
        button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        button.textContent = category.name;

        button.addEventListener('click', (e) => {
            app.selectCategory(category.id);
        });

        categoriesScroll.appendChild(button);
    });
}

// ============================================================
// GENERATE MENU SECTIONS DYNAMICALLY
// ============================================================

function generateMenuSections() {
    const menuContent = document.querySelector('.menu-content');
    
    // Clear existing sections (except empty state)
    menuContent.querySelectorAll('.menu-section').forEach(section => {
        section.remove();
    });

    categories.forEach((category) => {
        const section = document.createElement('section');
        section.className = 'menu-section';
        section.id = `${category.id}Section`;
        section.dataset.category = category.id;
        
        if (category.id !== 'all') {
            section.style.display = 'none';
        }

        const titleHTML = `
            <h2 class="section-title">${category.name}</h2>
            ${category.description ? `<p class="section-desc">${category.description}</p>` : ''}
            <div class="foods-grid" id="${category.id}Grid" role="region" aria-label="${category.name}"></div>
        `;

        section.innerHTML = titleHTML;
        menuContent.insertBefore(section, menuContent.querySelector('.empty-state'));
    });
}

// ============================================================
// UPDATE UI WITH CONFIG
// ============================================================

// ============================================================
// UPDATE UI WITH CONFIG (المحدثة لتقرأ كل بيانات الـ JSON)
// ============================================================

function updateUIWithConfig() {
    const appTitle = document.querySelector('.app-title');
    const restaurantName = document.querySelector('.restaurant-name');
    const restaurantDesc = document.querySelector('.restaurant-desc');
    const heroImage = document.querySelector('.hero-image');
    const logoIcon = document.querySelector('.logo-icon');

    // تحديث الاسم والوصف
    if (appTitle) appTitle.textContent = config.restaurant.name;
    if (restaurantName) restaurantName.textContent = config.restaurant.name;
    if (restaurantDesc) restaurantDesc.textContent = config.restaurant.description;

    // تحديث الصور
    if (heroImage) {
        heroImage.src = config.restaurant.coverImage;
        heroImage.alt = config.restaurant.name;
    }

    if (logoIcon) {
        logoIcon.src = config.restaurant.logo;
        logoIcon.alt = `شعار ${config.restaurant.name}`;
    }

    // تحديث روابط الاتصال العامة
    const phoneLink = document.querySelector('[href*="tel:"]');
    if (phoneLink) phoneLink.href = `tel:${config.restaurant.phone}`;

    // --- الإضافات الجديدة لربط باقي ملف الـ JSON بالـ HTML ---

    // 1. تحديث العنوان في الـ Footer
    const footerAddress = document.getElementById('footerAddress');
    if (footerAddress && config.restaurant.address) {
        footerAddress.textContent = config.restaurant.address;
    }

    // 2. تحديث الهاتف في الـ Footer
    const footerPhone = document.getElementById('footerPhone');
    if (footerPhone && config.restaurant.phone) {
        footerPhone.textContent = config.restaurant.phone;
        footerPhone.href = `tel:${config.restaurant.phoneClean || config.restaurant.phone}`;
    }

    // 3. تحديث ساعات العمل تلقائياً من المجموعات (day1, day2...)
    const footerHours = document.getElementById('footerHours');
    if (footerHours && config.restaurant.hours) {
        footerHours.innerHTML = ''; // مسح المواعيد الثابتة القديمة
        Object.values(config.restaurant.hours).forEach(day => {
            if (day.name && day.time) {
                const p = document.createElement('p');
                p.textContent = `${day.name}: ${day.time}`;
                footerHours.appendChild(p);
            }
        });
    }

    // 4. تحديث روابط السوشيال ميديا
    if (config.restaurant.social) {
        const fbLink = document.querySelector('.social-facebook');
        const igLink = document.querySelector('.social-instagram');
        const waLink = document.querySelector('.social-whatsapp');

        if (fbLink) fbLink.href = config.restaurant.social.facebook;
        if (igLink) igLink.href = config.restaurant.social.instagram;
        if (waLink) waLink.href = config.restaurant.social.whatsapp;
    }

    // 5. تحديث الاسم في نص الحقوق بأسفل الصفحة
    const footerCopyName = document.querySelector('.footer-copy-name');
    if (footerCopyName) footerCopyName.textContent = config.restaurant.name;

    applyThemeColors();
}

function applyThemeColors() {
    const root = document.documentElement;
    if (config.restaurant.theme) {
        root.style.setProperty('--primary-color', config.restaurant.theme.primaryColor);
        root.style.setProperty('--primary-dark', config.restaurant.theme.primaryDark);
        root.style.setProperty('--primary-light', config.restaurant.theme.primaryLight);
    }
}

function showLoadingError(message) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <p style="font-size: 16px; margin-bottom: 10px;">عذراً، حدث خطأ</p>
                <p style="font-size: 14px; color: #999; margin-bottom: 20px;">${message}</p>
                <button onclick="location.reload()" style="
                    background: #ff7b29;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">إعادة محاولة</button>
            </div>
        `;
    }
}

// ============================================================
// APPLICATION
// ============================================================

const app = {
    state: {
        currentCategory: 'all',
        favorites: [],
        darkMode: false,
        searchQuery: '',
        isLoading: true,
        isMobileMenuOpen: false
    },

    init() {
        this.loadState();
        this.setupEventListeners();
        this.renderFoods(this.filterFoods('all'));
        this.hideLoadingScreen();
        this.setupIntersectionObserver();
    },

loadState() {
        const savedState = localStorage.getItem('appState');
        const savedFavorites = localStorage.getItem('favorites');
        
        if (savedState) {
            this.state.darkMode = JSON.parse(savedState).darkMode;
        }
        
        if (savedFavorites) {
            this.state.favorites = JSON.parse(savedFavorites);
        }

        if (this.state.darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('themeToggle').classList.add('active');
            // التعديل هنا: نتحقق أولاً إن كان الزر موجوداً في الـ HTML قبل إعطائه قيمة true
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.checked = true;
            }
        }
    },

    saveState() {
        localStorage.setItem('appState', JSON.stringify({ darkMode: this.state.darkMode }));
        localStorage.setItem('favorites', JSON.stringify(this.state.favorites));
    },

setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // تحويل إلى كومنت لأن العنصر حُذف مع القائمة الجانبية
        // if (document.getElementById('darkModeToggle')) {
        //     document.getElementById('darkModeToggle').addEventListener('change', () => this.toggleTheme());
        // }

        document.getElementById('searchBtn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchInput').addEventListener('input', (e) => this.search(e.target.value));
        document.getElementById('clearSearch').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.search('');
        });

        // تحويل كل ما يتعلق بالقائمة الجانبية المحذوفة إلى كومنت لمنع الأخطاء
        // document.getElementById('menuBtn').addEventListener('click', () => this.toggleMenuDrawer());
        // document.getElementById('drawerClose').addEventListener('click', () => this.toggleMenuDrawer());
        // document.getElementById('menuDrawer').addEventListener('click', (e) => {
        //     if (e.target === document.getElementById('menuDrawer')) {
        //         this.toggleMenuDrawer();
        //     }
        // });

        document.getElementById('whatsappBtn').addEventListener('click', () => this.whatsappChat());
        document.getElementById('callBtn').addEventListener('click', () => this.call());
       // document.getElementById('orderFloatBtn').addEventListener('click', () => this.order());
        document.getElementById('backToTopBtn').addEventListener('click', () => this.scrollToTop());

        //  document.getElementById('qrMenuBtn').addEventListener('click', () => this.showQRCode());
        // document.getElementById('printMenuBtn').addEventListener('click', () => this.printMenu());

        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                this.closeModal();
            }
        });

        document.getElementById('qrClose').addEventListener('click', () => this.closeQRModal());
        document.getElementById('qrModalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('qrModalOverlay')) {
                this.closeQRModal();
            }
        });

        window.addEventListener('scroll', () => this.updateScrollProgress());
        window.addEventListener('scroll', () => this.updateBackToTopButton());

        document.getElementById('shareBtn').addEventListener('click', () => this.shareFood());
        document.getElementById('orderBtn').addEventListener('click', () => this.order());
        document.getElementById('downloadQR').addEventListener('click', () => this.downloadQR());
    },

    filterFoods(category) {
        if (category === 'all') {
            return menuData;
        }
        return menuData.filter(food => food.category === category);
    },

    search(query) {
        this.state.searchQuery = query.toLowerCase();
        
        if (query === '') {
            this.selectCategory(this.state.currentCategory);
            return;
        }

        const results = menuData.filter(food => 
            food.name.toLowerCase().includes(query) || 
            food.description.toLowerCase().includes(query)
        );

        const emptyState = document.getElementById('emptyState');
        document.querySelectorAll('.menu-section').forEach(section => {
            section.style.display = 'none';
        });

        if (results.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            const allSection = document.getElementById('allSection');
            if (allSection) {
                allSection.style.display = 'block';
                const allGrid = document.getElementById('allGrid');
                if (allGrid) {
                    allGrid.innerHTML = '';
                    this.renderFoods(results);
                }
            }
        }
    },

    renderFoods(foods) {
        const gridId = this.state.currentCategory === 'all' ? 'allGrid' : `${this.state.currentCategory}Grid`;
        const grid = document.getElementById(gridId);

        if (!grid) {
            console.error(`Grid not found: ${gridId}`);
            return;
        }

        grid.innerHTML = '';

        foods.forEach(food => {
            const isFavorite = this.state.favorites.includes(food.id);
            const foodHTML = this.createFoodCard(food, isFavorite);
            grid.insertAdjacentHTML('beforeend', foodHTML);
        });

        this.attachCardListeners();
    },

    attachCardListeners() {
        document.querySelectorAll('.food-card').forEach(card => {
            card.addEventListener('click', () => {
                const foodId = parseInt(card.dataset.foodId);
                const food = menuData.find(f => f.id === foodId);
                if (food) {
                    this.openModal(food);
                }
            });
        });

        document.querySelectorAll('.btn-favorite-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const foodId = parseInt(btn.dataset.foodId);
                this.toggleFavorite(foodId);
                this.updateFavoriteButton(btn, foodId);
            });
        });
    },

createFoodCard(food, isFavorite) {
    // Set default values for missing data
    const name = food.name || 'بدون اسم';
    const description = food.description || 'بدون وصف';
    const price = food.price || 0;
    const image = food.image || './img/placeholder.png';
    const badge = food.badge || null;
    const available = food.available !== false; // Default to true
    const rating = food.rating || 0;

    const badgeHTML = badge ? `<span class="food-badge ${badge}">${this.getBadgeText(badge)}</span>` : '';
    const availabilityHTML = !available ? `<div class="food-availability">غير متوفر</div>` : '';
    const favoriteClass = isFavorite ? 'active' : '';
    const priceFormatted = price.toLocaleString('ar-IQ');

    return `
        <div class="food-card" data-food-id="${food.id || 0}">
            <div class="food-image-wrapper">
                <img src="${image}" 
                     alt="${name}" 
                     class="food-image" 
                     loading="lazy"
                     onerror="this.src='./img/placeholder.png'">
                ${badgeHTML}
                ${availabilityHTML}
            </div>
            <div class="food-details">
                <div class="food-header">
                    <h3 class="food-name">${name}</h3>
                </div>
                <p class="food-description">${description}</p>
                <div class="food-footer">
                    <div class="food-price">
                        ${priceFormatted}<span class="food-price-currency"> د.ع</span>
                    </div>
                    <div class="food-actions">
                        <button class="btn-favorite-small ${favoriteClass}" data-food-id="${food.id || 0}" title="إضافة إلى المفضلة">
                            ♡
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
},

    getBadgeText(badge) {
        const badges = {
            'new': 'جديد',
            'hot': 'ساخن',
            'best': 'الأفضل',
            'spicy': 'حار'
        };
        return badges[badge] || badge;
    },

    selectCategory(category) {
        this.state.currentCategory = category;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            }
        });

        document.querySelectorAll('.menu-section').forEach(section => {
            section.style.display = 'none';
        });

        const sectionId = category === 'all' ? 'allSection' : `${category}Section`;
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }

        const foods = this.filterFoods(category);
        this.renderFoods(foods);

        document.getElementById('searchInput').value = '';
        this.state.searchQuery = '';
    },

    toggleTheme() {
        this.state.darkMode = !this.state.darkMode;
        document.body.classList.toggle('dark-mode');
        this.saveState();
    },

    toggleSearch() {
        document.getElementById('searchContainer').classList.toggle('active');
        if (document.getElementById('searchContainer').classList.contains('active')) {
            document.getElementById('searchInput').focus();
        }
    },

    toggleFavorite(foodId) {
        const index = this.state.favorites.indexOf(foodId);
        if (index > -1) {
            this.state.favorites.splice(index, 1);
        } else {
            this.state.favorites.push(foodId);
        }
        this.saveState();
    },

    updateFavoriteButton(btn, foodId) {
        if (this.state.favorites.includes(foodId)) {
            btn.classList.add('active');
            this.showToast('تمت إضافة العنصر إلى المفضلة');
        } else {
            btn.classList.remove('active');
            this.showToast('تمت إزالة العنصر من المفضلة');
        }
    },

openModal(food) {
    // Set default values
    const image = food.image || './img/placeholder.png';
    const name = food.name || 'بدون اسم';
    const description = food.description || 'بدون وصف';
    const price = food.price || 0;
    const rating = food.rating || 0;
    const calories = food.calories || 0;
    const protein = food.protein || 'غير متوفر';
    const ingredients = food.ingredients || [];
    const badge = food.badge || null;

    const modal = document.getElementById('foodModal');
    const overlay = document.getElementById('modalOverlay');
    
    document.getElementById('modalImage').src = image;
    document.getElementById('modalImage').onerror = () => {
        document.getElementById('modalImage').src = './img/placeholder.png';
    };
    
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalPrice').innerHTML = `${price.toLocaleString('ar-IQ')} د.ع`;
    document.getElementById('modalRating').textContent = `⭐ ${rating}`;
    document.getElementById('modalCalories').textContent = calories || '—';
    document.getElementById('modalProtein').textContent = protein || '—';

    const ingredientsList = document.getElementById('modalIngredients');
    if (ingredients.length > 0) {
        ingredientsList.innerHTML = ingredients.map(ing => `<li>${ing}</li>`).join('');
    } else {
        ingredientsList.innerHTML = '<li>المكونات غير متوفرة</li>';
    }

    const badgeContainer = document.getElementById('badgeContainer');
    badgeContainer.innerHTML = badge ? `<span>${this.getBadgeText(badge)}</span>` : '';

    const favoriteBtn = document.getElementById('modalFavorite');
    if (this.state.favorites.includes(food.id)) {
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.classList.remove('active');
    }

    favoriteBtn.onclick = () => {
        this.toggleFavorite(food.id);
        favoriteBtn.classList.toggle('active');
    };

    overlay.classList.add('active');
    modal.style.display = 'block';
    window.currentFood = food;
},

    closeModal() {
        const modal = document.getElementById('foodModal');
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    },

shareFood() {
    if (!window.currentFood) return;
    
    const name = window.currentFood.name || 'طبق';
    const description = window.currentFood.description || '';
    const price = window.currentFood.price || 0;
    
    const text = `تحقق من ${name} من مطعم ${config.restaurant.name}!\n${description}\nالسعر: ${price.toLocaleString('ar-IQ')} د.ع`;
    
    if (navigator.share) {
        navigator.share({
            title: name,
            text: text
        }).catch(err => console.log('Share error:', err));
    } else {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('تم نسخ التفاصيل إلى الحافظة');
        });
    }
},

    showQRCode() {
        const overlay = document.getElementById('qrModalOverlay');
        const qrContainer = document.getElementById('qrCode');
        
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: window.location.href,
            width: 200,
            height: 200,
            colorDark: '#222',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        overlay.classList.add('active');
        this.toggleMenuDrawer();
    },

    closeQRModal() {
        document.getElementById('qrModalOverlay').classList.remove('active');
    },

    downloadQR() {
        const qrCanvas = document.querySelector('#qrCode canvas');
        if (qrCanvas) {
            const link = document.createElement('a');
            link.href = qrCanvas.toDataURL('image/png');
            link.download = `menu-qr-${config.restaurant.name}.png`;
            link.click();
            this.showToast('تم تحميل رمز QR');
        }
    },

    printMenu() {
        window.print();
        this.toggleMenuDrawer();
    },

    toggleMenuDrawer() {
        document.getElementById('menuDrawer').classList.toggle('active');
    },

    whatsappChat() {
        const phone = config.restaurant.phoneClean || '9647501234567';
        const message = `مرحبا، أود معرفة المزيد عن القائمة في ${config.restaurant.name}`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    },

    call() {
        window.location.href = `tel:${config.restaurant.phone}`;
    },

    order() {
        this.showToast('شكراً لطلبك! سيتم معالجة الطلب قريباً');
        this.closeModal();
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    updateScrollProgress() {
        const scrollProgress = document.getElementById('scrollProgress');
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        scrollProgress.style.width = scrollPercentage + '%';
    },

    updateBackToTopButton() {
        const btn = document.getElementById('backToTopBtn');
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    },

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 800);
    },

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.menu-section').forEach(section => {
            observer.observe(section);
        });
    }
};

// ============================================================
// INITIALIZATION
// ============================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
} else {
    loadData();
}

window.app = app;
window.config = config;