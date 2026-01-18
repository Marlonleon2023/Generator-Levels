// ==============================
// ImageCache - Sistema de cache
// ==============================
class ImageCache {
    constructor() {
        this.cache = new Map();
        this.loading = new Map();
        this.failed = new Set();
        this.stats = {
            hits: 0,
            misses: 0,
            errors: 0
        };
    }

    async preloadImages(imageUrls, priority = 'low') {
        const promises = imageUrls.map(url => 
            this.loadImage(url, { priority })
        );
        
        // Para baja prioridad, no esperar
        if (priority === 'low') {
            Promise.allSettled(promises).then(results => {
                const failed = results.filter(r => r.status === 'rejected').length;
                if (failed > 0) {
                    console.log(`[ImageCache] Preload ${priority}: ${imageUrls.length - failed}/${imageUrls.length} cargadas`);
                }
            });
            return;
        }
        
        // Para alta prioridad, esperar
        return Promise.allSettled(promises);
    }

    async loadImage(url, options = {}) {
        // Verificar si ya falló recientemente
        if (this.failed.has(url) && options.retry !== true) {
            throw new Error(`Imagen marcada como fallida: ${url}`);
        }

        // Si ya está en cache, retornar
        if (this.cache.has(url)) {
            this.stats.hits++;
            return this.cache.get(url);
        }
        
        // Si ya se está cargando, esperar
        if (this.loading.has(url)) {
            return this.loading.get(url);
        }

        // Crear promesa de carga
        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            
            // Establecer prioridad de carga
            if (options.priority === 'high') {
                img.fetchPriority = 'high';
            } else {
                img.fetchPriority = 'low';
                img.loading = 'lazy';
            }
            
            // Timeout para imágenes muy lentas
            const timeout = setTimeout(() => {
                this.failed.add(url);
                this.loading.delete(url);
                this.stats.errors++;
                reject(new Error(`Timeout loading image: ${url}`));
            }, options.timeout || 10000);
            
            img.onload = () => {
                clearTimeout(timeout);
                this.cache.set(url, img);
                this.loading.delete(url);
                this.stats.misses++;
                
                // Pre-cache de imágenes relacionadas si es WebP
                if (url.includes('.webp')) {
                    this.precacheRelatedFormats(url);
                }
                
                resolve(img);
            };
            
            img.onerror = (e) => {
                clearTimeout(timeout);
                this.failed.add(url);
                this.loading.delete(url);
                this.stats.errors++;
                
                // Intentar formato alternativo
                if (!url.includes('.png') && !url.includes('.jpg')) {
                    setTimeout(() => this.tryAlternativeFormat(url), 1000);
                }
                
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
            
            // Si la imagen ya está en el cache del navegador
            if (img.complete && img.naturalWidth !== 0) {
                clearTimeout(timeout);
                this.cache.set(url, img);
                this.loading.delete(url);
                this.stats.hits++;
                resolve(img);
            }
        });

        this.loading.set(url, loadPromise);
        return loadPromise;
    }

    async tryAlternativeFormat(url) {
        let altUrl = url;
        if (url.includes('.webp')) {
            altUrl = url.replace('.webp', '.png');
        } else if (url.includes('.png')) {
            altUrl = url.replace('.png', '.jpg');
        }
        
        try {
            await this.loadImage(altUrl, { retry: true, priority: 'low' });
            console.log(`[ImageCache] Cargado formato alternativo: ${altUrl}`);
        } catch (err) {
            // Silenciar error de formato alternativo
        }
    }

    precacheRelatedFormats(webpUrl) {
        // Pre-cargar formatos alternativos en segundo plano
        const pngUrl = webpUrl.replace('.webp', '.png');
        const jpgUrl = webpUrl.replace('.webp', '.jpg');
        
        setTimeout(() => {
            [pngUrl, jpgUrl].forEach(url => {
                this.loadImage(url, { priority: 'low' })
                    .catch(() => {}); // Ignorar errores
            });
        }, 3000);
    }

    getImage(url) {
        return this.cache.get(url);
    }

    clearCache() {
        this.cache.clear();
        this.loading.clear();
        this.failed.clear();
        this.stats = { hits: 0, misses: 0, errors: 0 };
    }

    getStats() {
        return { ...this.stats, size: this.cache.size };
    }
}

// ==============================
// LazyImageLoader - Carga perezosa
// ==============================
class LazyImageLoader {
    constructor(options = {}) {
        this.observer = null;
        this.options = {
            rootMargin: options.rootMargin || '100px',
            threshold: options.threshold || 0.01,
            placeholder: options.placeholder || this.generatePlaceholder()
        };
        this.initObserver();
    }

    generatePlaceholder() {
        // Placeholder SVG optimizado
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <rect width="50" height="50" fill="#f5f5f5"/>
                <path d="M25,20 L15,30 L35,30 Z" fill="#e0e0e0" opacity="0.5"/>
            </svg>
        `.replace(/\s+/g, ' ').trim());
    }

    initObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                this.options
            );
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }

    observeImage(imgElement, imageUrl, fallbackUrl, options = {}) {
        // Asignar placeholder primero
        imgElement.src = this.options.placeholder;
        imgElement.classList.add('lazy-loading');
        
        // Almacenar datos
        imgElement.dataset.src = imageUrl;
        imgElement.dataset.fallback = fallbackUrl;
        imgElement.dataset.priority = options.priority || 'normal';
        
        // Usar intersection observer si está disponible
        if (this.observer) {
            this.observer.observe(imgElement);
            
            // Timeout de respaldo
            if (options.timeout) {
                setTimeout(() => {
                    if (imgElement.classList.contains('lazy-loading')) {
                        this.loadImage(imgElement);
                    }
                }, options.timeout);
            }
        } else {
            // Fallback: cargar inmediatamente
            this.loadImage(imgElement);
        }
    }

    async loadImage(imgElement) {
        if (!imgElement.dataset.src) return;
        
        const imageUrl = imgElement.dataset.src;
        const fallbackUrl = imgElement.dataset.fallback;
        const priority = imgElement.dataset.priority;
        
        // Remover clase de loading
        imgElement.classList.remove('lazy-loading');
        
        try {
            // Usar ImageCache global si está disponible
            if (window.globalImageCache) {
                const img = await window.globalImageCache.loadImage(imageUrl, { 
                    priority: priority === 'high' ? 'high' : 'low' 
                });
                imgElement.src = img.src;
            } else {
                // Carga directa
                const img = new Image();
                img.fetchPriority = priority === 'high' ? 'high' : 'low';
                
                await new Promise((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error('Failed to load'));
                    img.src = imageUrl;
                });
                
                imgElement.src = imageUrl;
            }
            
            imgElement.classList.add('lazy-loaded');
            imgElement.classList.remove('lazy-error');
            
            // Despachar evento de carga completa
            imgElement.dispatchEvent(new Event('lazyloaded'));
            
        } catch (error) {
            // Usar fallback
            imgElement.src = fallbackUrl;
            imgElement.classList.add('lazy-error');
            imgElement.classList.remove('lazy-loaded');
            
            // Despachar evento de error
            imgElement.dispatchEvent(new Event('lazyerror'));
        }
    }

    forceLoad(imgElement) {
        if (imgElement.dataset.src) {
            this.loadImage(imgElement);
        }
    }

    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// ==============================
// ImageOptimizer - Optimización
// ==============================
class ImageOptimizer {
    static supportsWebP() {
        if (this._supportsWebP !== undefined) return this._supportsWebP;
        
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            this._supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        } else {
            this._supportsWebP = false;
        }
        return this._supportsWebP;
    }

    static supportsAvif() {
        if (this._supportsAvif !== undefined) return this._supportsAvif;
        
        const avif = new Image();
        avif.onload = avif.onerror = () => {
            this._supportsAvif = (avif.width === 2);
        };
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        
        return this._supportsAvif || false;
    }

    static getOptimalFormat() {
        if (this.supportsAvif()) return 'avif';
        if (this.supportsWebP()) return 'webp';
        return 'png';
    }

    static async compressImage(url, maxWidth = 100, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                // Calcular nuevo tamaño manteniendo proporción
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Configurar calidad de renderizado
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, width, height);
                
                // Usar el mejor formato disponible
                const format = this.getOptimalFormat();
                const mimeType = `image/${format}`;
                
                if (format === 'webp' || format === 'avif') {
                    canvas.toBlob(
                        blob => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        },
                        mimeType,
                        quality
                    );
                } else {
                    // PNG o JPEG
                    const compressedUrl = canvas.toDataURL(mimeType, quality);
                    resolve(compressedUrl);
                }
            };
            
            img.onerror = reject;
            img.src = url;
        });
    }
}

// ==============================
// OptimizedBoardManager
// ==============================
class OptimizedBoardManager extends BoardManager {
    constructor(levelGenerator) {
        super(levelGenerator);
        
        // Inicializar sistema de cache global
        if (!window.globalImageCache) {
            window.globalImageCache = new ImageCache();
        }
        this.imageCache = window.globalImageCache;
        
        // Inicializar lazy loader
        this.lazyLoader = new LazyImageLoader({
            rootMargin: '200px', // Cargar antes de que sean visibles
            threshold: 0.01
        });
        
        // Estado de pre-carga
        this.preloadedTypes = new Set();
        this.criticalLoaded = false;
        this.pendingPreloads = new Set();
        
        // Métodos optimizados para URLs
        this.optimizedImageMethods = {
            plants: this.getOptimizedPlantImageUrl.bind(this),
            zombies: this.getOptimizedZombieImageUrl.bind(this),
            gravestones: this.getOptimizedGravestoneImageUrl.bind(this)
        };
    }

    // ==============================
    // MÉTODOS OPTIMIZADOS DE IMAGEN
    // ==============================
    
    getOptimizedImageUrl(elementName, type) {
        const normalizedName = elementName.toLowerCase().replace(/\s+/g, '');
        const format = ImageOptimizer.getOptimalFormat();
        
        let basePath;
        switch(type) {
            case 'plants':
                basePath = this.imagePaths.plants;
                break;
            case 'zombies':
                basePath = this.imagePaths.zombies;
                break;
            case 'gravestones':
                basePath = this.imagePaths.gravestones;
                break;
            default:
                basePath = '';
        }
        
        // Intentar con el formato óptimo primero
        const optimalUrl = `${basePath}${normalizedName}.${format}`;
        
        // Si no es WebP/AVIF, usar el método original
        if (format === 'png' || format === 'jpg') {
            switch(type) {
                case 'plants': return this.getPlantImageUrl(elementName);
                case 'zombies': return this.getZombieImageUrl(elementName);
                case 'gravestones': return this.getGravestoneImageUrl(elementName);
            }
        }
        
        return optimalUrl;
    }
    
    getOptimizedPlantImageUrl(plantName) {
        return this.getOptimizedImageUrl(plantName, 'plants');
    }
    
    getOptimizedZombieImageUrl(zombieName) {
        return this.getOptimizedImageUrl(zombieName, 'zombies');
    }
    
    getOptimizedGravestoneImageUrl(gravestoneName) {
        return this.getOptimizedImageUrl(gravestoneName, 'gravestones');
    }

    // ==============================
    // INICIALIZACIÓN OPTIMIZADA
    // ==============================
    
    async initialize() {
        console.time('BoardManager Initialization');
        
        // 1. Pre-cargar imágenes críticas (primera fila)
        await this.preloadCriticalImages();
        
        // 2. Renderizar inmediatamente con placeholders
        this.renderBoardOptimized();
        
        // 3. Pre-cargar el resto en segundo plano
        this.preloadRemainingImages();
        
        // 4. Configurar listeners optimizados
        this.setupOptimizedEventListeners();
        
        // 5. Actualizar preview
        this.updatePreview();
        
        this.initialized = true;
        
        console.timeEnd('BoardManager Initialization');
        
        // Reportar estadísticas
        setTimeout(() => {
            const stats = this.imageCache.getStats();
            console.log('[ImageCache Stats]', stats);
        }, 3000);
    }

    async preloadCriticalImages() {
        if (this.criticalLoaded) return;
        
        const criticalImages = new Set();
        
        // 1. Imágenes de la primera fila del tablero
        for (let col = 1; col <= 9; col++) {
            const elements = this.board[1]?.[col];
            if (elements) {
                this.collectImageUrlsFromElements(elements, criticalImages);
            }
        }
        
        // 2. Elementos frecuentes (primeros 3 de cada tipo)
        this.availableElements.plants.slice(0, 3).forEach(plant => {
            criticalImages.add(this.getOptimizedPlantImageUrl(plant.alias_type));
        });
        
        this.availableElements.zombies.slice(0, 3).forEach(zombie => {
            criticalImages.add(this.getOptimizedZombieImageUrl(zombie.alias_type));
        });
        
        this.availableElements.gravestones.slice(0, 2).forEach(grave => {
            criticalImages.add(this.getOptimizedGravestoneImageUrl(grave.alias_type));
        });
        
        // 3. Fallbacks (ya están en base64, no necesitan preload)
        
        // Convertir a array y pre-cargar con alta prioridad
        const imageArray = Array.from(criticalImages);
        if (imageArray.length > 0) {
            await this.imageCache.preloadImages(imageArray, 'high');
        }
        
        this.criticalLoaded = true;
        console.log(`[Preload] ${imageArray.length} imágenes críticas pre-cargadas`);
    }

    collectImageUrlsFromElements(elements, urlSet) {
        if (elements.plants?.length > 0) {
            const plant = elements.plants[0];
            const url = plant.imageUrl || this.getOptimizedPlantImageUrl(plant.name);
            urlSet.add(url);
        }
        if (elements.zombies?.length > 0) {
            const zombie = elements.zombies[0];
            const url = zombie.imageUrl || this.getOptimizedZombieImageUrl(zombie.name);
            urlSet.add(url);
        }
        if (elements.gravestones?.length > 0) {
            const grave = elements.gravestones[0];
            const url = grave.imageUrl || this.getOptimizedGravestoneImageUrl(grave.name);
            urlSet.add(url);
        }
    }

    async preloadRemainingImages() {
        // Esperar un poco para no bloquear la UI inicial
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const allImages = new Set();
        
        // Agrupar por tipo para carga eficiente
        const types = ['plants', 'zombies', 'gravestones'];
        
        types.forEach(type => {
            this.availableElements[type].forEach(element => {
                const url = this.getOptimizedImageUrl(element.alias_type, type);
                allImages.add(url);
            });
        });
        
        // Convertir a array y pre-cargar con baja prioridad
        const imageArray = Array.from(allImages);
        this.imageCache.preloadImages(imageArray, 'low');
        
        console.log(`[Preload] ${imageArray.length} imágenes en segundo plano`);
    }

    // ==============================
    // RENDERIZADO OPTIMIZADO
    // ==============================
    
    renderBoardOptimized() {
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return;
        
        // Limpiar solo si es necesario
        if (boardElement.children.length === 0) {
            boardElement.innerHTML = '';
        }
        
        // Usar requestAnimationFrame para renderizado suave
        requestAnimationFrame(() => {
            this.renderBoardWithVirtualization();
        });
    }

    renderBoardWithVirtualization() {
        const boardElement = document.getElementById('game-board');
        
        // Renderizar todas las celdas pero con lazy loading
        for (let row = 1; row <= 5; row++) {
            let tr = boardElement.querySelector(`tr:nth-child(${row})`);
            
            if (!tr) {
                tr = document.createElement('tr');
                boardElement.appendChild(tr);
            }
            
            for (let col = 1; col <= 9; col++) {
                this.renderCellOptimized(row, col, tr);
            }
        }
    }

    renderCellOptimized(row, col, parentRow = null) {
        let td;
        
        if (parentRow) {
            td = parentRow.querySelector(`td:nth-child(${col})`);
            if (!td) {
                td = document.createElement('td');
                td.dataset.row = row;
                td.dataset.col = col;
                td.className = 'board-cell';
                parentRow.appendChild(td);
            }
        } else {
            td = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!td) return;
        }
        
        // Limpiar solo si el contenido cambió
        const currentContent = this.board[row][col];
        const previousContent = td.dataset.contentHash;
        const contentHash = this.hashContent(currentContent);
        
        if (previousContent === contentHash) {
            return; // No cambió, evitar re-render
        }
        
        td.dataset.contentHash = contentHash;
        td.innerHTML = '';
        
        const cellContent = document.createElement('div');
        cellContent.className = 'cell-content';
        
        const elements = currentContent;
        
        // Determinar prioridad de carga basada en posición
        const isAboveFold = row <= 3;
        const loadPriority = isAboveFold ? 'high' : 'low';
        
        // Plantas
        if (elements.plants.length > 0) {
            const plant = elements.plants[0];
            const plantDiv = this.createElementDiv('plant', plant, loadPriority);
            cellContent.appendChild(plantDiv);
        }
        
        // Zombies
        if (elements.zombies.length > 0) {
            const zombie = elements.zombies[0];
            const zombieDiv = this.createElementDiv('zombie', zombie, loadPriority);
            cellContent.appendChild(zombieDiv);
        }
        
        // Lápidas
        if (elements.gravestones.length > 0) {
            const grave = elements.gravestones[0];
            const graveDiv = this.createElementDiv('gravestone', grave, loadPriority);
            cellContent.appendChild(graveDiv);
        }
        
        td.appendChild(cellContent);
        td.addEventListener('click', (e) => this.handleCellClick(row, col, e));
    }

    createElementDiv(type, element, priority) {
        const div = document.createElement('div');
        div.className = `cell-element ${type}-element`;
        div.title = this.getElementTitle(type, element);
        
        // Obtener URL optimizada
        let imageUrl;
        switch(type) {
            case 'plant':
                imageUrl = element.imageUrl || this.getOptimizedPlantImageUrl(element.name);
                break;
            case 'zombie':
                imageUrl = element.imageUrl || this.getOptimizedZombieImageUrl(element.name);
                break;
            case 'gravestone':
                imageUrl = element.imageUrl || this.getOptimizedGravestoneImageUrl(element.name);
                break;
        }
        
        // Fallback
        const fallbackUrl = this.fallbackImages[type + 's'];
        
        // Crear imagen con lazy loading
        const img = document.createElement('img');
        img.className = 'cell-thumbnail lazy';
        img.alt = element.name;
        
        // Configurar lazy loading
        this.lazyLoader.observeImage(img, imageUrl, fallbackUrl, {
            priority: priority,
            timeout: priority === 'high' ? 3000 : 10000
        });
        
        // Modificadores
        let modifiersHtml = '';
        if (type === 'plant') {
            modifiersHtml = this.getPlantModifiersHtml(element);
        } else if (type === 'zombie') {
            modifiersHtml = this.getZombieModifiersHtml(element);
        }
        
        div.appendChild(img);
        
        if (modifiersHtml) {
            const modifiersDiv = document.createElement('div');
            modifiersDiv.className = 'cell-modifiers';
            modifiersDiv.innerHTML = modifiersHtml;
            div.appendChild(modifiersDiv);
        }
        
        return div;
    }

    hashContent(content) {
        // Hash simple para detectar cambios
        const str = JSON.stringify(content);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    getElementTitle(type, element) {
        switch(type) {
            case 'plant':
                return this.getPlantTitle(element);
            case 'zombie':
                return this.getZombieTitle(element);
            case 'gravestone':
                return `Lápida: ${element.name}`;
            default:
                return element.name;
        }
    }

    // ==============================
    // EVENT LISTENERS OPTIMIZADOS
    // ==============================
    
    setupOptimizedEventListeners() {
        // Debounce para eventos frecuentes
        this.debouncedUpdatePreview = this.debounce(this.updatePreview.bind(this), 300);
        this.debouncedUpdateCellInfo = this.debounce(this.updateCellInfo.bind(this), 100);
        
        // Botón limpiar todo optimizado
        const btnClearBoard = document.getElementById('btn-clear-board');
        if (btnClearBoard) {
            btnClearBoard.addEventListener('click', () => {
                if (confirm('¿Estás seguro de limpiar todo el tablero?')) {
                    this.clearBoardOptimized();
                }
            });
        }
        
        // Observer para cambios en el tablero
        this.setupBoardObserver();
    }

    clearBoardOptimized() {
        this.board = this.initializeBoard();
        this.boardModules = {
            plants: [],
            zombies: [],
            gravestones: []
        };
        
        // Renderizar con animación
        this.animateBoardClear();
        
        // Actualizar con debounce
        this.debouncedUpdatePreview();
        this.debouncedUpdateCellInfo();
        
        this.showToast('Tablero limpiado', 'Todos los elementos han sido removidos', 'warning');
    }

    animateBoardClear() {
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.opacity = '0.5';
                cell.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    this.renderCellOptimized(
                        parseInt(cell.dataset.row),
                        parseInt(cell.dataset.col)
                    );
                    
                    cell.style.opacity = '';
                    cell.style.transform = '';
                }, 100);
            }, index * 20); // Efecto cascada
        });
    }

    setupBoardObserver() {
        // Observar cambios en elementos del tablero para pre-carga inteligente
        if ('IntersectionObserver' in window) {
            this.boardObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const cell = entry.target;
                        const row = parseInt(cell.dataset.row);
                        const col = parseInt(cell.dataset.col);
                        
                        // Pre-cargar imágenes de celdas que serán visibles
                        this.preloadCellImages(row, col);
                    }
                });
            }, { rootMargin: '300px' });
            
            // Observar todas las celdas
            document.querySelectorAll('.board-cell').forEach(cell => {
                this.boardObserver.observe(cell);
            });
        }
    }

    preloadCellImages(row, col) {
        const elements = this.board[row]?.[col];
        if (!elements) return;
        
        const urls = [];
        this.collectImageUrlsFromElements(elements, new Set(urls));
        
        if (urls.length > 0) {
            this.imageCache.preloadImages(urls, 'medium');
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==============================
    // MÉTODOS ESPECÍFICOS PARA PlantManager
    // ==============================
    
    optimizePlantManager(plantManager) {
        if (!plantManager) return;
        
        // Sobrescribir método getPlantImageUrl para usar cache
        const originalGetPlantImageUrl = plantManager.getPlantImageUrl;
        
        plantManager.getPlantImageUrl = (plantName) => {
            const url = originalGetPlantImageUrl.call(plantManager, plantName);
            const optimizedUrl = this.getOptimizedPlantImageUrl(plantName);
            
            // Pre-cargar en cache
            this.imageCache.loadImage(optimizedUrl, { priority: 'low' })
                .catch(() => {}); // Ignorar errores
                
            return url; // Mantener URL original para compatibilidad
        };
        
        // Optimizar carga de imágenes en modales
        this.optimizePlantModals(plantManager);
        
        console.log('[Optimization] PlantManager optimizado');
    }

    optimizePlantModals(plantManager) {
        // Interceptar showPlantModal para pre-cargar imágenes
        const originalShowPlantModal = plantManager.showPlantModal;
        
        plantManager.showPlantModal = function(mode) {
            // Pre-cargar imágenes antes de mostrar el modal
            const availablePlants = this.getAvailablePlantsForMode(mode);
            availablePlants.slice(0, 10).forEach(plant => {
                const url = plantManager.getPlantImageUrl(plant);
                window.globalImageCache?.loadImage(url, { priority: 'medium' })
                    .catch(() => {});
            });
            
            // Llamar al método original
            return originalShowPlantModal.call(this, mode);
        };
        
        // Optimizar loadPlantGrid
        const originalLoadPlantGrid = plantManager.loadPlantGrid;
        
        plantManager.loadPlantGrid = function(mode, plants) {
            // Llamar al método original
            originalLoadPlantGrid.call(this, mode, plants);
            
            // Configurar lazy loading para imágenes del modal
            setTimeout(() => {
                this.setupLazyLoadingInModal(mode);
            }, 0);
        };
        
        // Añadir método para lazy loading en modales
        plantManager.setupLazyLoadingInModal = function(mode) {
            const container = document.getElementById(`plantGrid-${mode}`);
            if (!container) return;
            
            const images = container.querySelectorAll('.plant-modal-image');
            images.forEach((img, index) => {
                const priority = index < 15 ? 'high' : 'low';
                window.boardManager?.lazyLoader.observeImage(img, img.src, plantManager.fallbackImage, {
                    priority: priority,
                    timeout: 10000
                });
            });
        };
        
        // Definir fallback image para plantManager
        plantManager.fallbackImage = 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
                <rect width="100" height="100" fill="#eee"/>
                <text x="50" y="50" font-family="Arial" font-size="14" text-anchor="middle" fill="#666">🌱</text>
            </svg>
        `);
    }

    // ==============================
    // MÉTODOS DE LIMPIEZA
    // ==============================
    
    destroy() {
        // Limpiar observers
        this.lazyLoader.disconnect();
        if (this.boardObserver) {
            this.boardObserver.disconnect();
        }
        
        // Limpiar timeouts
        this.pendingPreloads.forEach(timeout => clearTimeout(timeout));
        this.pendingPreloads.clear();
        
        // Limpiar listeners
        super.setupEventListeners = () => {}; // Sobrescribir para no añadir nuevos
        
        console.log('[OptimizedBoardManager] Destruido');
    }

    // ==============================
    // MÉTODOS OVERRIDE PARA COMPATIBILIDAD
    // ==============================
    
    addElementToCell(row, col) {
        super.addElementToCell(row, col);
        
        // Pre-cargar imagen del elemento añadido
        if (this.selectedElement) {
            const url = this.selectedElement.imageUrl;
            if (url) {
                this.imageCache.loadImage(url, { priority: 'high' })
                    .catch(() => {});
            }
        }
    }

    clearCell(row, col) {
        super.clearCell(row, col);
        
        // Animar limpieza
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.style.animation = 'cellClear 0.3s ease';
            setTimeout(() => {
                cell.style.animation = '';
            }, 300);
        }
    }
}

// ==============================
// INICIALIZACIÓN GLOBAL
// ==============================
document.addEventListener('DOMContentLoaded', function() {
    // Cache global compartido
    if (!window.globalImageCache) {
        window.globalImageCache = new ImageCache();
    }
    
    const boardTab = document.getElementById('board-tab');
    if (boardTab) {
        boardTab.addEventListener('click', function() {
            if (!window.boardManager) {
                window.boardManager = new OptimizedBoardManager(window.levelGenerator);
                
                // Optimizar PlantManager si existe
                if (window.plantManager) {
                    setTimeout(() => {
                        window.boardManager.optimizePlantManager(window.plantManager);
                    }, 500);
                }
                
                setTimeout(() => {
                    window.boardManager.initialize();
                }, 100);
            }
        });
    }
    
    // Inicializar si ya estamos en la pestaña board
    const boardPane = document.getElementById('board');
    if (boardPane && boardPane.classList.contains('active')) {
        if (!window.boardManager) {
            window.boardManager = new OptimizedBoardManager(window.levelGenerator);
            
            // Optimizar PlantManager si existe
            if (window.plantManager) {
                window.boardManager.optimizePlantManager(window.plantManager);
            }
            
            setTimeout(() => {
                window.boardManager.initialize();
            }, 100);
        }
    }
    
    // CSS para animaciones
    const style = document.createElement('style');
    style.textContent = `
        .lazy-loading {
            opacity: 0.7;
            filter: blur(5px);
            transition: opacity 0.3s, filter 0.3s;
        }
        
        .lazy-loaded {
            opacity: 1;
            filter: blur(0);
        }
        
        .lazy-error {
            opacity: 0.5;
        }
        
        @keyframes cellClear {
            0% { background-color: rgba(255, 0, 0, 0.1); }
            100% { background-color: transparent; }
        }
        
        .cell-modifiers {
            position: absolute;
            bottom: 2px;
            right: 2px;
            display: flex;
            gap: 2px;
        }
        
        .cell-modifier {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 3px;
            padding: 1px 3px;
            font-size: 10px;
            line-height: 1;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .cell-modifier.level {
            background: #4CAF50;
            color: white;
        }
    `;
    document.head.appendChild(style);
});

// ==============================
// UTILIDADES ADICIONALES
// ==============================
function prefetchCriticalResources() {
    // Pre-fetch recursos críticos
    const links = [
        'Assets/Plants/sunflower.webp',
        'Assets/Zombies/zombie_normal.webp',
        'Assets/Gravestones/gravestone_normal.webp'
    ];
    
    links.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = 'image';
        document.head.appendChild(link);
    });
}

// Iniciar pre-fetch temprano
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prefetchCriticalResources);
} else {
    prefetchCriticalResources();
}