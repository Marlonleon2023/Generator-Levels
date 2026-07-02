// ============================================
// ModalManager - World, Scenario, Mower modal operations
// Extracted from EnhancedLevelGenerator in main.js
// These methods are assigned to the prototype, so 'this' refers to the generator
// ============================================

// ─── MOWER MODAL ─────────────────────────────────────────────

export function initializeMowerModal() {
    this.generateMowerModalOptions();
    this.setupMowerModalListeners();

    const selectedMowerCard = document.getElementById('selectedMowerCard');
    const mowerModalOverlay = document.getElementById('mowerModalOverlay');
    const mowerModalClose = document.getElementById('mowerModalClose');
    const mowerModalCancel = document.getElementById('mowerModalCancel');
    const mowerModalAccept = document.getElementById('mowerModalAccept');

    if (selectedMowerCard) {
        selectedMowerCard.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (mowerModalOverlay) {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                mowerModalOverlay.classList.add('show');
                document.body.classList.add('modal-open');

                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 0);

                this.highlightSelectedMower(this.levelData.mower_type || "ModernMowers");

                const mowerSearch = document.getElementById('mowerSearch');
                if (mowerSearch) {
                    setTimeout(() => {
                        mowerSearch.focus();
                    }, 100);
                    mowerSearch.value = '';
                    this.filterMowers('');
                }
            }
        });
    }

    const closeModal = () => {
        if (mowerModalOverlay) {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            mowerModalOverlay.classList.remove('show');
            document.body.classList.remove('modal-open');
            setTimeout(() => {
                window.scrollTo(0, scrollY);
            }, 10);
        }
    };

    if (mowerModalClose) {
        mowerModalClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }

    if (mowerModalCancel) {
        mowerModalCancel.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }

    if (mowerModalAccept) {
        mowerModalAccept.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            console.log('Podadoras seleccionadas:', this.levelData.mower_type);
        });
    }

    if (mowerModalOverlay) {
        mowerModalOverlay.addEventListener('click', (e) => {
            if (e.target === mowerModalOverlay) {
                e.preventDefault();
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mowerModalOverlay &&
            mowerModalOverlay.classList.contains('show')) {
            e.preventDefault();
            closeModal();
        }
    });
}

export function generateMowerModalOptions() {
    const mowerGrid = document.getElementById('mowerGrid');
    if (!mowerGrid) return;

    mowerGrid.innerHTML = '';

    this.mowerTypes.forEach(mowerType => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-sm-6';

        const displayName = this.mowerDisplayNames[mowerType] || mowerType;
        const imagePath = this.mowerImages[mowerType] || 'Assets/Mowers/Modern.webp';

        col.innerHTML = `
        <div class="mower-option" data-mower="${mowerType}">
            <img src="${imagePath}" alt="${displayName}" 
                 class="mower-option-img" />
            <div class="mower-option-overlay">${displayName}</div>
        </div>
    `;

        mowerGrid.appendChild(col);
    });
}

export function setupMowerModalListeners() {
    const mowerGrid = document.getElementById('mowerGrid');

    if (mowerGrid) {
        mowerGrid.addEventListener('click', (e) => {
            const mowerOption = e.target.closest('.mower-option');
            if (mowerOption) {
                const mowerType = mowerOption.dataset.mower;
                this.selectMower(mowerType);
            }
        });
    }

    const mowerSearch = document.getElementById('mowerSearch');
    if (mowerSearch) {
        mowerSearch.addEventListener('input', (e) => {
            this.filterMowers(e.target.value.toLowerCase());
        });
    }
}

export function selectMower(mowerType) {
    this.levelData.mower_type = mowerType;
    this.updateSelectedMowerDisplay();
    this.markTabAsChanged('basic');
    this.highlightSelectedMower(mowerType);
}

export function updateSelectedMowerDisplay() {
    const selectedMowerImage = document.getElementById('selectedMowerImage');
    const selectedMowerName = document.getElementById('selectedMowerName');

    if (!selectedMowerImage || !selectedMowerName) return;

    const mowerType = this.levelData.mower_type || "ModernMowers";
    const displayName = this.mowerDisplayNames[mowerType] || mowerType;
    const imagePath = this.mowerImages[mowerType] || 'Assets/Mowers/Modern.webp';

    selectedMowerImage.src = imagePath;
    selectedMowerImage.alt = displayName;
    selectedMowerName.textContent = displayName;
}

export function highlightSelectedMower(mowerType) {
    document.querySelectorAll('.mower-option').forEach(option => {
        option.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`.mower-option[data-mower="${mowerType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

export function filterMowers(searchTerm) {
    const mowerOptions = document.querySelectorAll('.mower-option');

    mowerOptions.forEach(option => {
        const mowerType = option.dataset.mower.toLowerCase();
        const displayName = option.querySelector('.mower-option-overlay').textContent.toLowerCase();

        if (mowerType.includes(searchTerm) || displayName.includes(searchTerm)) {
            option.style.display = 'block';
            setTimeout(() => {
                option.style.opacity = '1';
                option.style.transform = 'translateY(0)';
            }, 10);
        } else {
            option.style.opacity = '0';
            option.style.transform = 'translateY(10px)';
            setTimeout(() => {
                option.style.display = 'none';
            }, 300);
        }
    });
}

// ─── SCENARIO MODAL ──────────────────────────────────────────

export function initializeScenarioModal() {
    this.generateScenarioModalOptions();
    this.setupScenarioModalListeners();

    const selectedScenarioCard = document.getElementById('selectedScenarioCard');
    const scenarioModalOverlay = document.getElementById('scenarioModalOverlay');
    const scenarioModalClose = document.getElementById('scenarioModalClose');
    const scenarioModalCancel = document.getElementById('scenarioModalCancel');
    const scenarioModalAccept = document.getElementById('scenarioModalAccept');

    if (selectedScenarioCard) {
        selectedScenarioCard.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (scenarioModalOverlay) {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                scenarioModalOverlay.classList.add('show');
                document.body.classList.add('modal-open');

                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 0);

                this.highlightSelectedScenario(this.levelData.stage || "egyptStage");

                const scenarioSearch = document.getElementById('scenarioSearch');
                if (scenarioSearch) {
                    setTimeout(() => {
                        scenarioSearch.focus();
                    }, 100);
                    scenarioSearch.value = '';
                    this.filterScenarios('');
                }
            }
        });
    }

    const closeModal = () => {
        if (scenarioModalOverlay) {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            scenarioModalOverlay.classList.remove('show');
            document.body.classList.remove('modal-open');

            setTimeout(() => {
                window.scrollTo(0, scrollY);
            }, 10);
        }
    };

    if (scenarioModalClose) {
        scenarioModalClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }

    if (scenarioModalCancel) {
        scenarioModalCancel.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }

    if (scenarioModalAccept) {
        scenarioModalAccept.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            console.log('Escenario seleccionado:', this.levelData.stage);
        });
    }

    if (scenarioModalOverlay) {
        scenarioModalOverlay.addEventListener('click', (e) => {
            if (e.target === scenarioModalOverlay) {
                e.preventDefault();
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && scenarioModalOverlay &&
            scenarioModalOverlay.classList.contains('show')) {
            e.preventDefault();
            closeModal();
        }
    });
}

export function generateScenarioModalOptions() {
    const scenarioGrid = document.getElementById('scenarioGrid');
    if (!scenarioGrid) return;

    scenarioGrid.innerHTML = '';

    const allStages = Object.keys(this.stageImages);
    const stages = allStages.filter(stage => stage !== 'default');

    stages.forEach(stage => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6';

        const imagePath = this.stageImages[stage] || this.stageImages['default'];

        col.innerHTML = `
        <div class="scenario-option" data-stage="${stage}">
            <img src="${imagePath}" alt="${stage}" 
                 class="scenario-option-img" />
            <div class="scenario-option-overlay">${stage}</div>
        </div>
    `;

        scenarioGrid.appendChild(col);
    });
}

export function setupScenarioModalListeners() {
    const scenarioGrid = document.getElementById('scenarioGrid');

    if (scenarioGrid) {
        scenarioGrid.addEventListener('click', (e) => {
            const scenarioOption = e.target.closest('.scenario-option');
            if (scenarioOption) {
                const stageName = scenarioOption.dataset.stage;
                this.selectScenario(stageName);
            }
        });
    }

    const scenarioModal = document.getElementById('scenarioModal');
    if (scenarioModal) {
        scenarioModal.addEventListener('show.bs.modal', () => {
            this.generateScenarioModalOptions();
            const currentStage = this.levelData.stage || "";
            this.highlightSelectedScenario(currentStage);
        });
    }

    const scenarioSearch = document.getElementById('scenarioSearch');
    if (scenarioSearch) {
        scenarioSearch.addEventListener('input', (e) => {
            this.filterScenarios(e.target.value.toLowerCase());
        });
    }
}

export function selectScenario(stageName) {
    this.levelData.stage = stageName;
    this.updateSelectedScenarioDisplay();
    this.markTabAsChanged('basic');
    this.highlightSelectedScenario(stageName);
}

export function updateSelectedScenarioDisplay() {
    const selectedScenarioImage = document.getElementById('selectedScenarioImage');
    const selectedScenarioName = document.getElementById('selectedScenarioName');
    const boardStageIndicatorImg = document.getElementById('boardStageIndicatorImg');
    const boardStageIndicatorName = document.getElementById('boardStageIndicatorName');
    const boardContainer = document.getElementById('boardContainer');

    if (!selectedScenarioImage || !selectedScenarioName) return;

    const stageName = this.levelData.stage || "";
    const imagePath = this.stageImages[stageName] || '';
    const hasStage = stageName && stageName !== "NoneStage" && stageName !== "None";

    selectedScenarioImage.src = imagePath || 'Assets/Board/NoneStage.webp';
    selectedScenarioImage.alt = `Escenario ${stageName}`;
    selectedScenarioName.textContent = stageName || __('selectScenario');

    if (boardStageIndicatorImg && boardStageIndicatorName) {
        if (hasStage && imagePath) {
            boardStageIndicatorImg.src = imagePath;
            boardStageIndicatorImg.style.display = 'inline-block';
            boardStageIndicatorName.textContent = stageName;
            boardStageIndicatorName.className = 'badge bg-primary fs-6';
        } else {
            boardStageIndicatorImg.style.display = 'none';
            boardStageIndicatorName.textContent = __('selectScenario');
            boardStageIndicatorName.className = 'badge bg-secondary fs-6';
        }
    }

    const boardTable = document.getElementById('game-board');
    if (boardTable) {
        boardTable.style.background = '';
        if (hasStage && imagePath) {
            boardTable.style.backgroundImage = `url('${imagePath}')`;
            boardTable.style.backgroundSize = 'cover';
            boardTable.style.backgroundPosition = '0 0';
            boardTable.style.backgroundRepeat = 'no-repeat';
        }
    }
}

export function highlightSelectedScenario(stageName) {
    document.querySelectorAll('.scenario-option').forEach(option => {
        option.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`.scenario-option[data-stage="${stageName}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

export function filterScenarios(searchTerm) {
    const scenarioOptions = document.querySelectorAll('.scenario-option');

    scenarioOptions.forEach(option => {
        const stageName = option.dataset.stage.toLowerCase();

        if (stageName.includes(searchTerm)) {
            option.style.display = 'block';
            setTimeout(() => {
                option.style.opacity = '1';
                option.style.transform = 'translateY(0)';
            }, 10);
        } else {
            option.style.opacity = '0';
            option.style.transform = 'translateY(10px)';
            setTimeout(() => {
                option.style.display = 'none';
            }, 300);
        }
    });
}

// ─── WORLD MODAL ─────────────────────────────────────────────

export function initializeWorldModal() {
    this.generateWorldModalOptions();
    this.setupWorldModalListeners();

    const selectedWorldCard = document.getElementById('selectedWorldCard');
    const worldModalOverlay = document.getElementById('worldModalOverlay');
    const worldModalClose = document.getElementById('worldModalClose');
    const worldModalCancel = document.getElementById('worldModalCancel');
    const worldModalAccept = document.getElementById('worldModalAccept');

    if (selectedWorldCard) {
        selectedWorldCard.addEventListener('click', (e) => {
            console.log('Clic en selectedWorldCard');
            e.preventDefault();
            e.stopPropagation();

            if (worldModalOverlay) {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                worldModalOverlay.classList.add('show');
                document.body.classList.add('modal-open');

                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 0);

                this.highlightSelectedWorld(this.levelData.world || "Egipto");

                const worldSearch = document.getElementById('worldSearch');
                if (worldSearch) {
                    setTimeout(() => {
                        worldSearch.focus();
                    }, 100);
                    worldSearch.value = '';
                    this.filterWorlds('');
                }
            }
        });
    } else {
        console.error('No se encontró selectedWorldCard');
    }

    const closeModal = () => {
        if (worldModalOverlay) {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            worldModalOverlay.classList.remove('show');
            document.body.classList.remove('modal-open');

            setTimeout(() => {
                window.scrollTo(0, scrollY);
            }, 10);
        }
    };

    if (worldModalClose) {
        worldModalClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }

    if (worldModalCancel) {
        worldModalCancel.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }

    if (worldModalAccept) {
        worldModalAccept.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            console.log('Mundo seleccionado:', this.levelData.world);
        });
    }

    if (worldModalOverlay) {
        worldModalOverlay.addEventListener('click', (e) => {
            if (e.target === worldModalOverlay) {
                e.preventDefault();
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && worldModalOverlay &&
            worldModalOverlay.classList.contains('show')) {
            e.preventDefault();
            closeModal();
        }
    });
}

export function generateWorldModalOptions() {
    const worldGrid = document.getElementById('worldGrid');
    if (!worldGrid) return;

    worldGrid.innerHTML = '';

    Object.entries(this.worldImages).forEach(([worldName, imagePath]) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6';

        col.innerHTML = `
        <div class="world-option" data-world="${worldName}">
            <img src="${imagePath}" alt="${worldName}" 
                 class="world-option-img" />
            <div class="world-option-overlay">${worldName}</div>
        </div>
    `;

        worldGrid.appendChild(col);
    });
}

export function setupWorldModalListeners() {
    const worldGrid = document.getElementById('worldGrid');
    const worldModal = document.getElementById('worldModal');

    if (worldGrid) {
        worldGrid.addEventListener('click', (e) => {
            const worldOption = e.target.closest('.world-option');
            if (worldOption) {
                const worldName = worldOption.dataset.world;
                this.selectWorld(worldName);
            }
        });
    }

    if (worldModal) {
        worldModal.addEventListener('show.bs.modal', () => {
            const currentWorld = this.levelData.world || "Egipto";
            this.highlightSelectedWorld(currentWorld);
        });
    }

    const worldSearch = document.getElementById('worldSearch');
    if (worldSearch) {
        worldSearch.addEventListener('input', (e) => {
            this.filterWorlds(e.target.value.toLowerCase());
        });
    }
}

export function selectWorld(worldName) {
    this.levelData.world = worldName;
    this.updateSelectedWorldDisplay();
    this.updateStages();
    this.markTabAsChanged('basic');
    this.highlightSelectedWorld(worldName);
}

export function updateSelectedWorldDisplay() {
    const selectedWorldImage = document.getElementById('selectedWorldImage');
    const selectedWorldName = document.getElementById('selectedWorldName');

    if (!selectedWorldImage || !selectedWorldName) return;

    const worldName = this.levelData.world || "Egipto";

    if (this.worldImages[worldName]) {
        selectedWorldImage.src = this.worldImages[worldName];
        selectedWorldImage.alt = `Mundo ${worldName}`;
    }

    selectedWorldName.textContent = worldName;
}

export function highlightSelectedWorld(worldName) {
    document.querySelectorAll('.world-option').forEach(option => {
        option.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`.world-option[data-world="${worldName}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

export function filterWorlds(searchTerm) {
    const worldOptions = document.querySelectorAll('.world-option');

    worldOptions.forEach(option => {
        const worldName = option.dataset.world.toLowerCase();

        if (worldName.includes(searchTerm)) {
            option.style.display = 'block';
            setTimeout(() => {
                option.style.opacity = '1';
                option.style.transform = 'translateY(0)';
            }, 10);
        } else {
            option.style.opacity = '0';
            option.style.transform = 'translateY(10px)';
            setTimeout(() => {
                option.style.display = 'none';
            }, 300);
        }
    });
}

export function updateStages() {
    const world = this.levelData.world;
    this.generateScenarioModalOptions();

    const currentStage = this.levelData.stage;
    const worldScenarios = this.worlds[world] || [];

    const isValidStage = worldScenarios.some(s =>
        s !== "NoneStage" && s === currentStage
    );

    if (currentStage && !isValidStage) {
        const firstStage = worldScenarios.find(s => s !== "NoneStage");
        if (firstStage) {
            this.levelData.stage = firstStage;
            this.updateSelectedScenarioDisplay();
        }
    }
}
