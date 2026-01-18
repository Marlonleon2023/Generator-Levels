// zombies.js - Archivo simple para cargar zombies

import { ZOMBIE_CATEGORIES, PATHS, FALLBACK_IMAGES } from './constants/resources.js';

// Array para zombies seleccionados
let selectedZombies = [];

// Función para cargar las categorías
function loadCategories() {
    const categoriesPanel = document.getElementById('zombieCategoriesPanel');
    if (!categoriesPanel) return;

    // Limpiar panel
    categoriesPanel.innerHTML = '';

    // Crear botón para "Todos"
    const allButton = document.createElement('button');
    allButton.className = 'category-btn active';
    allButton.dataset.category = 'Todos';
    allButton.innerHTML = `
        <i class="bi bi-grid-fill me-2"></i>Todos
        <span class="badge bg-secondary float-end">${getTotalZombies()}</span>
    `;
    allButton.onclick = () => loadZombies('Todos');
    categoriesPanel.appendChild(allButton);

    // Crear botones para cada categoría
    Object.keys(ZOMBIE_CATEGORIES).forEach(category => {
        if (category === 'Todos') return; // Saltar el array vacío "Todos"
        
        const zombieCount = ZOMBIE_CATEGORIES[category].length;
        if (zombieCount === 0) return;

        const button = document.createElement('button');
        button.className = 'category-btn';
        button.dataset.category = category;
        button.innerHTML = `
            <i class="bi bi-folder-fill me-2"></i>${category}
            <span class="badge bg-secondary float-end">${zombieCount}</span>
        `;
        button.onclick = () => loadZombies(category);
        categoriesPanel.appendChild(button);
    });
}

// Función para obtener el total de zombies únicos
function getTotalZombies() {
    const allZombies = new Set();
    Object.values(ZOMBIE_CATEGORIES).forEach(zombieList => {
        zombieList.forEach(zombie => allZombies.add(zombie));
    });
    return allZombies.size;
}

// Función para cargar zombies de una categoría
function loadZombies(category) {
    const contentPanel = document.getElementById('zombieCategoriesContent');
    if (!contentPanel) return;

    // Limpiar contenido
    contentPanel.innerHTML = '';

    // Actualizar botón activo
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');

    // Obtener zombies de la categoría
    let zombies;
    if (category === 'Todos') {
        // Combinar todos los zombies únicos
        const allZombiesSet = new Set();
        Object.values(ZOMBIE_CATEGORIES).forEach(zombieList => {
            zombieList.forEach(zombie => allZombiesSet.add(zombie));
        });
        zombies = Array.from(allZombiesSet);
    } else {
        zombies = ZOMBIE_CATEGORIES[category] || [];
    }

    // Crear título
    const title = document.createElement('h5');
    title.className = 'mb-3';
    title.textContent = `${category} (${zombies.length} zombies)`;
    contentPanel.appendChild(title);

    // Crear grid de zombies
    const grid = document.createElement('div');
    grid.className = 'row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3';

    // Crear tarjetas para cada zombie
    zombies.forEach(zombieId => {
        const col = document.createElement('div');
        col.className = 'col';
        
        const card = document.createElement('div');
        card.className = 'card h-100 zombie-card';
        card.dataset.zombieId = zombieId;
        
        // Nombre amigable para mostrar
        const displayName = zombieId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        card.innerHTML = `
            <div class="card-body text-center p-2">
                <div class="zombie-img-container mb-2" style="height: 80px; display: flex; align-items: center; justify-content: center;">
                    <img src="${PATHS.IMAGES.ZOMBIES}${zombieId}.webp" 
                         alt="${displayName}"
                         class="img-fluid"
                         style="max-height: 70px;"
                         onerror="this.src='${FALLBACK_IMAGES.zombies}'">
                </div>
                <h6 class="card-title mb-1" style="font-size: 0.9rem;">${displayName}</h6>
                <small class="text-muted d-block mb-2" style="font-size: 0.7rem;">${zombieId}</small>
                <button class="btn btn-sm btn-outline-primary select-btn">
                    <i class="bi bi-plus-circle"></i> Seleccionar
                </button>
            </div>
        `;
        
        col.appendChild(card);
        grid.appendChild(col);
    });

    contentPanel.appendChild(grid);

    // Agregar eventos a los botones de selección
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.onclick = function() {
            const card = this.closest('.zombie-card');
            const zombieId = card.dataset.zombieId;
            toggleZombieSelection(zombieId, card, this);
        };
    });
}

// Función para alternar selección de zombie
function toggleZombieSelection(zombieId, card, button) {
    const index = selectedZombies.indexOf(zombieId);
    
    if (index === -1) {
        // Agregar
        selectedZombies.push(zombieId);
        card.classList.add('border-primary');
        button.innerHTML = '<i class="bi bi-check-circle"></i> Seleccionado';
        button.className = 'btn btn-sm btn-success';
    } else {
        // Remover
        selectedZombies.splice(index, 1);
        card.classList.remove('border-primary');
        button.innerHTML = '<i class="bi bi-plus-circle"></i> Seleccionar';
        button.className = 'btn btn-sm btn-outline-primary';
    }
    
    console.log('Zombies seleccionados:', selectedZombies);
}

// Función para inicializar búsqueda
function initSearch() {
    const searchGlobal = document.getElementById('zombieSearchGlobal');
    const searchContent = document.getElementById('zombieSearchContent');
    
    if (searchGlobal) {
        searchGlobal.addEventListener('input', function(e) {
            filterZombies(e.target.value);
        });
    }
    
    if (searchContent) {
        searchContent.addEventListener('input', function(e) {
            filterZombies(e.target.value);
        });
    }
}

// Función para filtrar zombies
function filterZombies(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const cards = document.querySelectorAll('.zombie-card');
    
    cards.forEach(card => {
        const zombieId = card.dataset.zombieId.toLowerCase();
        const zombieName = card.querySelector('.card-title').textContent.toLowerCase();
        
        if (zombieId.includes(searchLower) || zombieName.includes(searchLower)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para inicializar controles
function initControls() {
    // Botón para añadir seleccionados
    const addBtn = document.getElementById('addSelectedZombiesBtn');
    if (addBtn) {
        addBtn.onclick = function() {
            alert(`${selectedZombies.length} zombies seleccionados:\n${selectedZombies.join('\n')}`);
            // Aquí puedes hacer lo que necesites con los zombies seleccionados
        };
    }
    
    // Botón para limpiar todos
    const clearBtn = document.getElementById('clearAllZombiesBtn');
    if (clearBtn) {
        clearBtn.onclick = function() {
            if (confirm('¿Limpiar todos los zombies seleccionados?')) {
                selectedZombies = [];
                // Restablecer todas las tarjetas
                document.querySelectorAll('.zombie-card').forEach(card => {
                    card.classList.remove('border-primary');
                    const btn = card.querySelector('.select-btn');
                    if (btn) {
                        btn.innerHTML = '<i class="bi bi-plus-circle"></i> Seleccionar';
                        btn.className = 'btn btn-sm btn-outline-primary';
                    }
                });
                console.log('Selección limpiada');
            }
        };
    }
}

// Función principal de inicialización
function initZombies() {
    loadCategories();
    loadZombies('Todos');
    initSearch();
    initControls();
    console.log('Sistema de zombies inicializado');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initZombies);