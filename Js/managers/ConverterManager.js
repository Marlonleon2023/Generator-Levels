// ============================================
// ConverterManager - JSON/RTON conversion methods
// Extracted from EnhancedLevelGenerator in main.js
// These methods are assigned to the prototype, so 'this' refers to the generator
// ============================================

export function setupConverterListeners() {
    document.getElementById('jsonToRtonBtn').addEventListener('click', () => this.convertJsonToRton());
    document.getElementById('rtonToJsonBtn').addEventListener('click', () => this.convertRtonToJson());
    document.getElementById('loadJsonFileBtn').addEventListener('click', () => this.loadJsonFile());
    document.getElementById('loadRtonFileBtn').addEventListener('click', () => this.loadRtonFile());
    document.getElementById('copyResultBtn').addEventListener('click', () => this.copyResult());
    document.getElementById('downloadResultBtn').addEventListener('click', () => this.downloadResult());
    document.getElementById('clearResultBtn').addEventListener('click', () => this.clearResult());
}

export function convertJsonToRton() {
    try {
        const jsonInput = document.getElementById('jsonInput').value;
        if (!jsonInput.trim()) {
            this.showConverterMessage('Error', 'Por favor ingresa JSON para convertir', 'error');
            return;
        }
        const converter = new JSONARTON();
        converter.set(jsonInput);
        const outputFormat = document.getElementById('outputFormat').value;
        const result = converter.get(outputFormat === 'hex' ? 'hex' : 'binary');
        let displayResult;
        let downloadBlob;
        let fileName;
        let mimeType;
        let baseFileName = this.originalFileName || 'converted';
        baseFileName = baseFileName.replace(/[<>:"/\\|?*]/g, '');
        baseFileName = baseFileName.replace(/\s+ACTUALIZADO/i, '');
        baseFileName = baseFileName.replace(/\s+UPDATED/i, '');
        if (outputFormat === 'hex') {
            displayResult = result;
            downloadBlob = new Blob([result], { type: 'text/plain' });
            fileName = `${baseFileName}.hex`;
            mimeType = 'text/plain';
        } else if (outputFormat === 'array') {
            displayResult = JSON.stringify(Array.from(result), null, 2);
            downloadBlob = new Blob([displayResult], { type: 'application/json' });
            fileName = `${baseFileName}.json`;
            mimeType = 'application/json';
        } else if (outputFormat === 'compact') {
            displayResult = JSON.stringify(Array.from(result));
            downloadBlob = new Blob([displayResult], { type: 'application/json' });
            fileName = `${baseFileName}.json`;
            mimeType = 'application/json';
        } else {
            const hexString = Array.from(result)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .toUpperCase();
            displayResult = '';
            for (let i = 0; i < hexString.length; i += 32) {
                const chunk = hexString.substr(i, 32);
                const line = chunk.replace(/(.{2})/g, '$1 ') + '\n';
                displayResult += line;
            }
            downloadBlob = result;
            fileName = `${baseFileName}.rton`;
            mimeType = 'application/octet-stream';
        }
        document.getElementById('conversionResult').textContent = displayResult;
        this.downloadFile(downloadBlob, fileName, mimeType);
        this.showConverterMessage('Éxito', `JSON convertido a RTON y descargado como ${fileName}`, 'success');
        this.originalFileName = null;
    } catch (error) {
        document.getElementById('conversionResult').textContent = `Error: ${error.message}`;
        this.showConverterMessage('Error', error.message, 'error');
    }
}

export function convertRtonToJson() {
    try {
        const rtonInput = document.getElementById('rtonInput').value.trim();
        if (!rtonInput) {
            this.showConverterMessage('Error', 'Por favor ingresa RTON para convertir', 'error');
            return;
        }
        let bytes;
        if (rtonInput.includes(' ')) {
            const cleanHex = rtonInput.replace(/\s+/g, '');
            bytes = new Uint8Array(cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        } else {
            bytes = new Uint8Array(rtonInput.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        }
        const converter = new RTONAJSON();
        const success = converter.set(bytes);
        if (!success) {
            throw new Error('No se pudo procesar el RTON');
        }
        const jsonResult = converter.get();
        const outputFormat = document.getElementById('outputFormat').value;
        let displayResult;
        let downloadResult;
        if (outputFormat === 'pretty') {
            displayResult = JSON.stringify(JSON.parse(jsonResult), null, 2);
            downloadResult = displayResult;
        } else if (outputFormat === 'compact') {
            displayResult = jsonResult;
            downloadResult = displayResult;
        } else {
            displayResult = jsonResult;
            downloadResult = displayResult;
        }
        document.getElementById('conversionResult').textContent = displayResult;
        let baseFileName = this.originalFileName || 'converted';
        baseFileName = baseFileName.replace(/[<>:"/\\|?*]/g, '');
        const fileName = `${baseFileName}.json`;
        const blob = new Blob([downloadResult], { type: 'application/json' });
        this.downloadFile(blob, fileName, 'application/json');
        this.showConverterMessage('Éxito', `RTON convertido a JSON y descargado como ${fileName}`, 'success');
        this.originalFileName = null;
    } catch (error) {
        document.getElementById('conversionResult').textContent = `Error: ${error.message}`;
        this.showConverterMessage('Error', error.message, 'error');
    }
}

export function loadJsonFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            document.getElementById('jsonInput').value = text;
            this.originalFileName = file.name.replace(/\.json$/i, '');
            this.showConverterMessage('Archivo cargado', `JSON cargado: ${file.name}`, 'success');
        } catch (error) {
            this.showConverterMessage('Error', `Error al cargar archivo: ${error.message}`, 'error');
        }
    };
    input.click();
}

export function loadRtonFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.rton,.bin';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const hexString = Array.from(bytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .toUpperCase();
            document.getElementById('rtonInput').value = hexString;
            this.originalFileName = file.name.replace(/\.(rton|bin)$/i, '');
            this.showConverterMessage('Archivo cargado', `RTON cargado: ${file.name}`, 'success');
        } catch (error) {
            this.showConverterMessage('Error', `Error al cargar archivo: ${error.message}`, 'error');
        }
    };
    input.click();
}

export function copyResult() {
    const result = document.getElementById('conversionResult').textContent;
    if (!result || result === 'Resultado aparecerá aquí...') {
        this.showConverterMessage('Sin resultado', 'No hay resultado para copiar', 'warning');
        return;
    }
    navigator.clipboard.writeText(result).then(() => {
        this.showConverterMessage('Copiado', 'Resultado copiado al portapapeles', 'success');
    }).catch(err => {
        this.showConverterMessage('Error', 'No se pudo copiar: ' + err, 'error');
    });
}

export function downloadResult() {
    const result = document.getElementById('conversionResult').textContent;
    if (!result || result === 'Resultado aparecerá aquí...') {
        this.showConverterMessage('Sin resultado', 'No hay resultado para descargar', 'warning');
        return;
    }
    const outputFormat = document.getElementById('outputFormat').value;
    let extension, mimeType;
    if (outputFormat === 'hex' || outputFormat === 'array') {
        extension = 'txt';
        mimeType = 'text/plain';
    } else {
        extension = 'json';
        mimeType = 'application/json';
    }
    const blob = new Blob([result], { type: mimeType });
    const fileName = `conversion_result_${Date.now()}.${extension}`;
    this.downloadFile(blob, fileName, mimeType);
    this.showConverterMessage('Descargado', 'Resultado descargado correctamente', 'success');
}

export function downloadFile(blob, fileName, mimeType) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function clearResult() {
    document.getElementById('conversionResult').textContent = 'Resultado aparecerá aquí...';
    document.getElementById('jsonInput').value = '';
    document.getElementById('rtonInput').value = '';
    this.showConverterMessage('Limpiado', 'Todos los campos han sido limpiados', 'info');
}

export function showConverterMessage(title, message, type = 'info') {
    this.showMessage(title, message, type);
}
