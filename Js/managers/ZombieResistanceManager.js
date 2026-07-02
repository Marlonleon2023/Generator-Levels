class ZombieResistanceManager {
    constructor(generator) {
        this.generator = generator;
        this.enabled = false;
        this.selectedFamilies = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    getFamilyImageUrl(family) {
        return `Assets/Family/${family}.webp`;
    }

    setupEventListeners() {
        const toggle = document.getElementById('enableZombieResistances');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.enabled = e.target.checked;
                this.toggleUI(e.target.checked);
                if (this.generator) this.generator.markTabAsChanged('basic');
            });
        }

        const btn = document.getElementById('selectFamiliesBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.showFamilyModal();
            });
        }
    }

    toggleUI(enabled) {
        const section = document.getElementById('zombieResistanceConfigSection');
        const btn = document.getElementById('selectFamiliesBtn');
        if (section) {
            if (enabled) {
                section.classList.remove('disabled');
                if (btn) btn.disabled = false;
            } else {
                section.classList.add('disabled');
                if (btn) btn.disabled = true;
            }
        }
    }

    showFamilyModal() {
        const modalId = 'zombieResistanceModal';
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const bodyTransform = document.body.style.transform;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = modalId;

        modal.innerHTML = `
            <div class="modal-container" style="max-width: 700px;">
                <div class="modal-header">
                    <h5 class="modal-title">Resistencias de Familias</h5>
                    <button type="button" class="modal-close-btn" aria-label="Cerrar">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row g-3" id="familyGrid">
                        <!-- Families will be loaded here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="d-flex justify-content-between w-100 align-items-center">
                        <div>
                            <span id="familySelectedCount" class="badge bg-primary">0 seleccionadas</span>
                        </div>
                        <div>
                            <button type="button" class="btn btn-secondary" id="cancelFamiliesBtn">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirmFamiliesBtn">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.body.style.transform = 'none';
        document.body.classList.add('modal-open');

        this.loadFamilyGrid();

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(modal)) modal.remove();
                document.body.style.transform = bodyTransform;
                document.body.classList.remove('modal-open');
            }, 300);
        };

        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        modal.querySelector('#cancelFamiliesBtn').addEventListener('click', closeModal);
        modal.querySelector('#confirmFamiliesBtn').addEventListener('click', () => {
            this.confirmFamilySelection();
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function handleEscape(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        });

        setTimeout(() => modal.classList.add('active'), 10);
    }

    loadFamilyGrid() {
        const container = document.getElementById('familyGrid');
        const countElement = document.getElementById('familySelectedCount');
        if (!container) return;

        container.innerHTML = '';

        let selectedCount = 0;

        const families = window.ZOMBIE_FAMILIES || [
            "ailmint", "appeasemint", "armamint", "bombardmint",
            "concealmint", "containmint", "enchantmint", "enforcemint",
            "enlightenmint", "filamint", "forcemint", "peppermint",
            "reinforcemint", "spearmint", "wintermint"
        ];
        families.forEach(family => {
            const existing = this.selectedFamilies.find(f => f.FamilyType === family);
            const damageValue = existing ? existing.DamageResistance : 1;
            const conditionValue = existing ? existing.ConditionResistance : 1;
            const isSelected = !!existing;

            const col = document.createElement('div');
            col.className = 'col-6 col-md-4';

            const imgUrl = this.getFamilyImageUrl(family);
            const displayName = family.charAt(0).toUpperCase() + family.slice(1);

            col.innerHTML = `
                <div class="family-select-card ${isSelected ? 'selected' : ''}" data-family="${family}">
                    <div class="family-image-container">
                        <img src="${imgUrl}" alt="${family}" class="family-modal-image"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI0MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+TjwvdGV4dD48L3N2Zz4='">
                    </div>
                    <div class="family-modal-name">${displayName}</div>
                    <div class="family-damage-selector">
                        <label class="damage-label">Daño:</label>
                        <select class="form-select form-select-sm family-damage-select" ${!isSelected ? 'disabled' : ''}>
                            <option value="0" ${damageValue === 0 ? 'selected' : ''}>0 - Desactivado</option>
                            <option value="1" ${damageValue === 1 ? 'selected' : ''}>1 - Normal</option>
                            <option value="2" ${damageValue === 2 ? 'selected' : ''}>2 - Doble</option>
                            <option value="3" ${damageValue === 3 ? 'selected' : ''}>3 - Triple</option>
                        </select>
                    </div>
                    <div class="family-condition-selector">
                        <label class="damage-label">Condición:</label>
                        <select class="form-select form-select-sm family-condition-select" ${!isSelected ? 'disabled' : ''}>
                            <option value="0" ${conditionValue === 0 ? 'selected' : ''}>0 - Desactivado</option>
                            <option value="1" ${conditionValue === 1 ? 'selected' : ''}>1 - Normal</option>
                            <option value="2" ${conditionValue === 2 ? 'selected' : ''}>2 - Resistente</option>
                            <option value="3" ${conditionValue === 3 ? 'selected' : ''}>3 - Inmune</option>
                        </select>
                    </div>
                </div>
            `;

            container.appendChild(col);

            if (isSelected) selectedCount++;

            const card = col.querySelector('.family-select-card');
            const damageSelect = col.querySelector('.family-damage-select');
            const conditionSelect = col.querySelector('.family-condition-select');

            card.addEventListener('click', (e) => {
                if (e.target.tagName === 'SELECT') return;
                const isActive = card.classList.toggle('selected');
                damageSelect.disabled = !isActive;
                conditionSelect.disabled = !isActive;
                if (isActive) {
                    if (!this.selectedFamilies.find(f => f.FamilyType === family)) {
                        this.selectedFamilies.push({
                            FamilyType: family,
                            DamageResistance: parseInt(damageSelect.value),
                            ConditionResistance: parseInt(conditionSelect.value)
                        });
                    }
                } else {
                    this.selectedFamilies = this.selectedFamilies.filter(f => f.FamilyType !== family);
                }
                this.updateSelectedCount();
            });

            damageSelect.addEventListener('change', () => {
                const entry = this.selectedFamilies.find(f => f.FamilyType === family);
                if (entry) entry.DamageResistance = parseInt(damageSelect.value);
            });

            conditionSelect.addEventListener('change', () => {
                const entry = this.selectedFamilies.find(f => f.FamilyType === family);
                if (entry) entry.ConditionResistance = parseInt(conditionSelect.value);
            });
        });

        if (countElement) {
            countElement.textContent = `${selectedCount} seleccionadas`;
        }
    }

    updateSelectedCount() {
        const countElement = document.getElementById('familySelectedCount');
        if (countElement) {
            const count = this.selectedFamilies.length;
            countElement.textContent = `${count} seleccionadas`;
        }
    }

    confirmFamilySelection() {
        const cards = document.querySelectorAll('#familyGrid .family-select-card');
        this.selectedFamilies = [];

        cards.forEach(card => {
            if (card.classList.contains('selected')) {
                const family = card.dataset.family;
                const damageSelect = card.querySelector('.family-damage-select');
                const conditionSelect = card.querySelector('.family-condition-select');
                this.selectedFamilies.push({
                    FamilyType: family,
                    DamageResistance: parseInt(damageSelect.value),
                    ConditionResistance: parseInt(conditionSelect.value)
                });
            }
        });

        this.updateDisplay();
        if (this.generator) this.generator.markTabAsChanged('basic');
    }

    updateDisplay() {
        const container = document.getElementById('selectedFamiliesContainer');
        if (!container) return;

        container.innerHTML = '';

        if (this.selectedFamilies.length === 0) {
            container.innerHTML = `
                <div class="alert alert-secondary text-center py-2 mb-0">
                    <small class="mb-0">No hay familias seleccionadas</small>
                </div>
            `;
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'd-flex flex-wrap gap-1';

        this.selectedFamilies.forEach((family) => {
            const imgUrl = this.getFamilyImageUrl(family.FamilyType);
            const roman = ['', 'I', 'II', 'III'][family.DamageResistance] || '';

            const wrapper = document.createElement('div');
            wrapper.className = 'selected-family-icon';
            wrapper.dataset.family = family.FamilyType;
            wrapper.title = `${family.FamilyType} (Daño: ${family.DamageResistance})`;

            wrapper.innerHTML = `
                <img src="${imgUrl}" alt="${family.FamilyType}"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSIyMCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij4/PC90ZXh0Pjwvc3ZnPg=='">
                ${roman ? `<span class="family-damage-overlay">${roman}</span>` : ''}
            `;

            wrapper.addEventListener('click', () => {
                this.selectedFamilies = this.selectedFamilies.filter(f => f.FamilyType !== family.FamilyType);
                this.updateDisplay();
                if (this.generator) this.generator.markTabAsChanged('basic');
            });

            grid.appendChild(wrapper);
        });

        container.appendChild(grid);
    }

    getModuleData() {
        if (!this.enabled || this.selectedFamilies.length === 0) return null;

        return {
            "aliases": ["ZombieResistances"],
            "objclass": "ZombieResistancesModuleProperties",
            "objdata": {
                "FamilyResistances": {
                    "global": this.selectedFamilies.map(f => ({
                        "ConditionResistance": f.ConditionResistance,
                        "DamageResistance": f.DamageResistance,
                        "FamilyType": f.FamilyType
                    }))
                }
            }
        };
    }

    hasActiveFamilies() {
        return this.enabled && this.selectedFamilies.length > 0;
    }
}

if (typeof window !== 'undefined') {
    window.ZombieResistanceManager = ZombieResistanceManager;
}
