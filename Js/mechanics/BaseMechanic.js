export class BaseMechanic {
    constructor(generator, config = {}) {
        this.generator = generator;
        this.id = config.id || 'unknown';
        this.displayName = config.displayName || config.id || 'Unknown';
        this.enabled = false;
    }

    onInit() {}
    setupUI() {}
    updateControls() {}
    collectData(data) {}
    applyData(data) {}
    resetData() {}

    shouldHandleWave(waveNumber) { return false; }
    generateWave(waveNumber, pfWaves, zombieThreats, totalWaves) { return null; }
    modifyWave(waveData, waveNumber, pfWaves, zombieThreats, totalWaves) { return waveData; }

    renderWaveSelector(containerId, selectedWaves, onToggle) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const waveCount = parseInt(document.getElementById('waveCount')?.value) || 10;
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'wave-selector-grid';
        grid.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px;';

        for (let w = 1; w <= waveCount; w++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-sm wave-btn';
            btn.dataset.wave = w;
            btn.textContent = w;

            const isSelected = selectedWaves.includes(w);
            if (isSelected) {
                btn.classList.add('btn-primary');
            } else {
                btn.classList.add('btn-outline-secondary');
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const wave = parseInt(btn.dataset.wave);
                onToggle(wave, btn);
            });

            grid.appendChild(btn);
        }

        container.appendChild(grid);
    }

    renderColumnGrid(containerId, colStart, colEnd, onSelect, disabled = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const lang = document.documentElement.lang || 'es';
        const dict = {
            es: { colStart: 'Inicio:', colEnd: 'Fin:' },
            en: { colStart: 'Start:', colEnd: 'End:' }
        };
        const t = dict[lang] || dict.es;
        const label = document.createElement('div');
        label.className = 'mechanic-column-label';
        label.style.cssText = 'font-size: 0.75rem; font-weight: 600; margin-bottom: 4px;';
        const startLabel = colStart !== undefined ? `Col ${colStart + 1}` : '—';
        const endLabel = colEnd !== undefined ? `Col ${colEnd + 1}` : '—';
        label.textContent = `${t.colStart} ${startLabel}  →  ${t.colEnd} ${endLabel}`;
        container.appendChild(label);

        const wrapper = document.createElement('div');
        wrapper.className = 'mechanic-column-grid';
        wrapper.style.cssText = `display: flex; gap: 2px; padding: 4px 6px; border-radius: 6px; max-width: 280px;${disabled ? ' opacity:0.5;' : ''}`;

        for (let col = 0; col < 9; col++) {
            const colDiv = document.createElement('div');
            colDiv.style.cssText = `flex: 1; display: flex; flex-direction: column; gap: 1px;${disabled ? '' : ' cursor: pointer;'}`;

            const inRange = colStart !== undefined && colEnd !== undefined && col >= colStart && col <= colEnd;

            for (let row = 0; row < 5; row++) {
                const cell = document.createElement('div');
                cell.className = 'mechanic-column-cell' + (inRange ? ' mechanic-column-cell-selected' : '');
                cell.style.cssText = 'width:100%;aspect-ratio:1;border-radius:2px;transition:all 0.1s ease;';
                colDiv.appendChild(cell);
            }

            if (inRange && col === colStart) {
                const tag = document.createElement('div');
                tag.className = 'mechanic-column-arrow';
                tag.textContent = '▶';
                tag.style.cssText = 'font-size:0.5rem;text-align:center;line-height:1;';
                colDiv.appendChild(tag);
            } else if (inRange && col === colEnd) {
                const tag = document.createElement('div');
                tag.className = 'mechanic-column-arrow';
                tag.textContent = '◀';
                tag.style.cssText = 'font-size:0.5rem;text-align:center;line-height:1;';
                colDiv.appendChild(tag);
            }

            if (!disabled) {
                colDiv.addEventListener('click', () => onSelect(col));
                colDiv.addEventListener('mouseenter', () => {
                    const cells = colDiv.querySelectorAll('div');
                    cells.forEach(c => {
                        if (!inRange) c.style.borderColor = '';
                    });
                });
                colDiv.addEventListener('mouseleave', () => {
                    const cells = colDiv.querySelectorAll('div');
                    cells.forEach(c => {
                        if (!inRange) c.style.borderColor = '';
                    });
                });
            }

            wrapper.appendChild(colDiv);
        }

        container.appendChild(wrapper);
    }

    calculateWaves(startId, countId, intervalId, summaryId) {
        const start = this.getInt(startId, 1);
        const count = this.getInt(countId, 3);
        const interval = this.getInt(intervalId, 3);
        const waves = [];
        for (let i = 0; i < count; i++) {
            waves.push(start + i * interval);
        }
        const summary = document.getElementById(summaryId);
        if (summary) {
            summary.textContent = waves.length > 0
                ? `Oleadas: ${waves.join(', ')}`
                : '—';
        }
        return waves;
    }

    getBool(id) {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    }

    getInt(id, fallback = 0) {
        const el = document.getElementById(id);
        return el ? (parseInt(el.value) || fallback) : fallback;
    }

    safeAssign(id, value, type = 'value') {
        const el = document.getElementById(id);
        if (!el) return;
        if (type === 'checked') {
            el.checked = value;
        } else {
            el.value = value;
        }
    }
}
