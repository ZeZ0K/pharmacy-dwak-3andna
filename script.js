document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded - initializing pharmacy website");
  
  // Shopping Cart functionality
  let cart = [];
  const cartIcon = document.querySelector('.cart-icon');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartCount = document.querySelector('.cart-count');

  console.log("Cart elements:", { cartIcon, cartSidebar, cartCount });

  // Toggle cart sidebar
  cartIcon.addEventListener('click', () => {
    cartSidebar.classList.toggle('active');
    console.log("Cart sidebar toggled");
  });

  // Close cart sidebar
  document.querySelector('.close-cart').addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    console.log("Cart sidebar closed");
  });

  // Add to cart functionality
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const medCard = e.target.closest('.med-card');
      const medName = medCard.querySelector('h2').textContent.split(' ')[0];
      const medPrice = medCard.querySelector('.price').textContent;
      const medImage = medCard.querySelector('img').src;
      
      addToCart({
        name: medName,
        price: medPrice,
        image: medImage
      });
      console.log(`Added ${medName} to cart`);
    });
  });

  function addToCart(item) {
    cart.push(item);
    updateCartCount();
    updateCartSidebar();
  }

  function updateCartCount() {
    cartCount.textContent = cart.length;
  }

  function updateCartSidebar() {
    const cartItems = document.querySelector('.cart-items');
    const totalAmount = document.querySelector('.total-amount');
    let total = 0;
    
    cartItems.innerHTML = '';
    cart.forEach((item, idx) => {
      const price = parseFloat(item.price.replace('$', ''));
      total += price;
      
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${item.price}</p>
        </div>
        <button class="remove-from-cart" aria-label="Remove ${item.name} from cart" tabindex="0">&times;</button>
      `;
      cartItem.querySelector('.remove-from-cart').addEventListener('click', () => {
        cart.splice(idx, 1);
        updateCartCount();
        updateCartSidebar();
        console.log(`Removed ${item.name} from cart`);
      });
      cartItems.appendChild(cartItem);
    });
    
    totalAmount.textContent = `$${total.toFixed(2)}`;
  }

  // --- SEARCH AND CATEGORY FIX ---
  const searchInput = document.getElementById('searchInput');
  const categoryCards = document.querySelectorAll('.category-card');
  const categoryGroups = document.querySelectorAll('.category-group');

  console.log("Categories found:", categoryCards.length);
  console.log("Category groups found:", categoryGroups.length);
  
  // Log all category groups with their IDs
  categoryGroups.forEach(group => {
    console.log(`Category group: ${group.id}, display: ${group.style.display}`);
  });

  // Add 'No results found' message
  let noResultsMsg = document.createElement('div');
  noResultsMsg.textContent = 'No results found.';
  noResultsMsg.className = 'no-results-msg';
  document.querySelector('main').appendChild(noResultsMsg);
  noResultsMsg.style.display = 'none';

  let activeCategory = 'pain';

  // FIXED CATEGORY DISPLAY FUNCTION
  function showCategory(categoryId) {
    console.log(`Attempting to show category: ${categoryId}`);
    
    // First hide all category groups
    categoryGroups.forEach(group => {
      group.style.display = 'none';
      console.log(`Hidden group: ${group.id}`);
    });
    
    // Then show the selected category
    const selectedGroup = document.getElementById(categoryId);
    if (selectedGroup) {
      selectedGroup.style.display = 'flex'; // Force display flex for better layout
      console.log(`Showing category: ${categoryId}, Element:`, selectedGroup);
    } else {
      console.error(`Category group with ID "${categoryId}" not found!`);
    }
    
    noResultsMsg.style.display = 'none';
  }

  // IMPROVED CATEGORY CLICK HANDLER
  categoryCards.forEach(card => {
    card.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent any default behavior
      
      const category = this.getAttribute('data-category');
      console.log(`Category card clicked: ${category}`);
      
      // Remove active from all
      categoryCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      // Update active category
      activeCategory = category;
      
      // Clear search
      searchInput.value = '';
      
      // Show the selected category
      showCategory(category);
    });
  });

  // Initial category display
  console.log("Setting initial category to:", activeCategory);
  showCategory(activeCategory);

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    console.log(`Searching for: ${searchTerm}`);
    
    let found = false;
    if (searchTerm === '') {
      // Restore category view
      showCategory(activeCategory);
      document.querySelectorAll('.category-group').forEach(group => {
        group.querySelectorAll('.med-card').forEach(card => {
          card.style.display = '';
        });
      });
      noResultsMsg.style.display = 'none';
      return;
    }
    
    // Show all groups
    categoryGroups.forEach(group => {
      group.style.display = 'flex';
      let anyVisible = false;
      group.querySelectorAll('.med-card').forEach(card => {
        const medName = card.querySelector('h2').textContent.toLowerCase();
        if (medName.includes(searchTerm)) {
          card.style.display = '';
          anyVisible = true;
          found = true;
        } else {
          card.style.display = 'none';
        }
      });
      // Hide group if no meds visible
      group.style.display = anyVisible ? 'flex' : 'none';
    });
    
    // Remove active highlight from categories
    categoryCards.forEach(c => c.classList.remove('active'));
    
    // Show/hide no results message
    noResultsMsg.style.display = found ? 'none' : 'block';
  });
  // --- END SEARCH AND CATEGORY FIX ---

  // Medication Details Modal
  const modal = document.getElementById('medDetailsModal');
  const closeModal = document.querySelector('.close');

  console.log("Modal elements:", { modal, closeModal });

  // Explicitly bind showMedDetails to the window object
  window.showMedDetails = function(medName) {
    console.log(`Showing details for: ${medName}`);
    
    // Find the medCard in any group
    let medCard = null;
    document.querySelectorAll('.med-card').forEach(card => {
      if (card.querySelector('h2').textContent.includes(medName)) {
        medCard = card;
      }
    });
    
    if (!medCard) {
      console.error(`Medication card for ${medName} not found!`);
      return;
    }
    
    const modalImage = document.getElementById('modalImage');
    const modalName = document.getElementById('modalName');
    const modalArabicName = document.getElementById('modalArabicName');
    const modalPrice = document.querySelector('.modal-price');
    const modalStock = document.querySelector('.modal-stock');
    const modalDesc = document.getElementById('modalDesc');
    
    // Update modal content
    modalImage.src = medCard.querySelector('img').src;
    modalImage.alt = medName;
    
    // Display just the English name in the title
    modalName.textContent = medName;
    
    // Extract just the Arabic name
    const arabicNameElement = medCard.querySelector('.arabic-name');
    modalArabicName.textContent = arabicNameElement ? arabicNameElement.textContent : '';
    
    modalPrice.textContent = medCard.querySelector('.price').textContent;
    modalStock.textContent = medCard.querySelector('.stock').textContent;
    modalStock.className = 'modal-stock ' + medCard.querySelector('.stock').className;
    
    // Add description based on medication
    modalDesc.textContent = getMedDescription(medName);
    
    // Display the modal
    modal.style.display = 'block';
    console.log("Modal displayed");
  };

  function getMedDescription(medName) {
    // Updated descriptions with detailed information
    const descriptions = {
      'Panadol': 'بانادول (Panadol) – Relieves pain and reduces fever.',
      'Brufen': 'بروفين (Brufen) – Reduces pain, fever, and inflammation.',
      'Amoclan': 'اموكلان (Amoclan) – Antibiotic for bacterial infections.',
      'Flagyl': 'فلاجيل (Flagyl) – Treats bacterial and parasitic infections.',
      'Fucidin': 'فويسدين (Fucidin) – Antibiotic cream for skin infections.',
      'Zyrtec': 'زيرتك (Zyrtec) – Treats allergies like runny nose and hives.',
      'Claritin': 'كلارتين شراب (Claritin Syrup) – Relieves allergy symptoms like sneezing and itching.',
      'Cosopt': 'كوزوبت قطرة (Cosopt Eye Drops) – Lowers eye pressure in glaucoma.',
      'Motilium': 'موتيليوم (Motilium) – Helps with nausea, vomiting, and stomach discomfort.',
      'Nanazoxid': 'نانازوكسيد (Nanazoxid) – Treats diarrhea caused by infection.',
      'Cidostone': 'سيدوستون حقن (Cidostone Injection) – Helps treat or prevent kidney stones.',
      'Silconzoc': 'Specialty medication for skin conditions.',
      'Eltroxin': 'التروكسين (Eltroxin) – Treats low thyroid hormone (hypothyroidism).',
      'Atozet': 'اتوزيت (Atozet) – Lowers cholesterol.',
      'Actemra': 'اكتيمرا (Actemra) – Treats rheumatoid arthritis and inflammation.',
      'Diprosalic': 'ديبروساليك (Diprosalic) – Cream for skin redness, itching, and scaling.',
      'Keppra': 'كيبرا (Keppra) – Controls seizures in epilepsy.'
    };
    
    return descriptions[medName] || 'No description available.';
  }

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    console.log("Modal closed via X button");
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      console.log("Modal closed via outside click");
    }
  });

  // Prescription Upload
  const prescriptionModal = document.getElementById('prescriptionModal');
  const prescriptionForm = document.getElementById('prescriptionForm');

  console.log("Prescription elements:", { prescriptionModal, prescriptionForm });

  prescriptionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle prescription upload
    alert('Prescription uploaded successfully!');
    prescriptionModal.style.display = 'none';
    console.log("Prescription uploaded");
  });

  // Request form submission
  document.getElementById('requestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you! We will contact you soon.');
    this.reset();
    console.log("Request form submitted");
  });

  // --- MODAL ESCAPE KEY ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.style.display === 'block') modal.style.display = 'none';
      if (cartSidebar.classList.contains('active')) cartSidebar.classList.remove('active');
      if (prescriptionModal && prescriptionModal.style.display === 'block') prescriptionModal.style.display = 'none';
      console.log("Closed modal/sidebar with Escape key");
    }
  });
  // --- END MODAL ESCAPE KEY ---
  
  console.log("Website initialization complete");
});
