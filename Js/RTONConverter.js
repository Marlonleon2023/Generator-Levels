// RTONConverter.js
// Clase para convertir JSON a formato RTON (Binary JSON)

// Преобразование JSON в RTON - Transformación de JSON a RTON
class JSONARTON {
    // Строка в формате json - Cadena en formato JSON
    _json = null;

    // Массив байт для конвертации в RTON - Array de bytes para conversión a RTON
    _rton = [];

    // Массив кеша строк - Array de caché de strings
    _cache_str = [];

    // Массив кеша UTF 8 строк - Array de caché de strings UTF-8
    _cache_utf = [];

    // Массив преобразованный из JSON - Array convertido desde JSON
    _array = [];

    // Устанавливаем JSON и начальные данные - Establecemos JSON y datos iniciales
    set(json) {
        // Обнуляем данные - Reiniciamos los datos
        this._json = JSON.parse(json);
        this._rton = [];
        this._cache_str = [];
        this._cache_utf = [];
        this._array = JSON.parse(json, (key, value, context) => {
            // Если это число с дробной частью - Si es un número con parte decimal
            if (typeof value == "number" && context.source.indexOf(".") !== -1) {
                return {"__type__": "double", "__value__": context.source}
            // Если число не входит в int32 и uint32 - Si el número no está en int32 y uint32
            } else if (typeof value == "number" && (-2147483648 > value || value > 4294967295)) {
                // Если число не входит в int64 и uint64 - Si el número no está en int64 y uint64
                if (-9223372036854775808n > BigInt(context.source) || BigInt(context.source) > 18446744073709551615n)
                    throw(`Key "${key}" contains the number "${context.source}" which is not included in int64 or uint64`);
                return {"__type__": "bigint", "__value__": context.source}
            // Если обычное число - Si es un número normal
            } else if (typeof value == "number") {
                return {"__type__": "int", "__value__": context.source}
            // Если другое значение - Si es otro valor
            } else {
                return value;
            }
        });

        return true;
    }

    // Возвращаем RTON строку - Retornamos la cadena RTON
    get(type = "array") {
        // Добавляем первые элементы RTON1000 - Añadimos los primeros elementos RTON1000
        this._rton.push(0x52, 0x54, 0x4f, 0x4e, 0x01, 0x00, 0x00, 0x00);

        // Преобразуем в RTON - Convertimos a RTON
        this._toObject(this._array, true);
        
        // Добавляем последние DONE - Añadimos el DONE final
        this._rton.push(0x44, 0x4f, 0x4e, 0x45);

        // Если нужен результат в виде массива байт - Si se necesita el resultado como array de bytes
        if (type == "array") {
            return this._rton;
        // в виде двоичных данных - como datos binarios
        } else if (type == "binary") {
            const binary = new Uint8Array(this._rton);
            return new Blob([binary], {type: "application/octet-stream"});
        // в виде удобной HEX строки - como string HEX conveniente
        } else if (type == "hex") {
            let res = "";
            for (let i = 0; i < this._rton.length; i += 2) {
                if (i != 0 && i % 16 == 0)
                    res += "\n";
                res += this._rton[i].toString(16).padStart(2, '0');
                res += (this._rton[i + 1] != undefined) ? this._rton[i + 1]?.toString(16).padStart(2, '0') + " " : "";
            }
            return res;
        // Если указан не верное представление - Si se especifica una representación incorrecta
        } else {
            throw(`The representation "${type}" does not match`);
        }
    }

    // Преобразование списка в RTON - Transformación de lista a RTON
    _parse(item) {
        // Получаем тип - Obtenemos el tipo
        let type = typeof item;
        // Преобразуем в зависимости от типа - Convertimos dependiendo del tipo
        if (Array.isArray(item) && item.length === 0) {// Если это пустой массив - Si es un array vacío
            this._rton.push(0x86, 0xfd, 0x00, 0xfe);
        } else if (Array.isArray(item)) {// Если это массив - Si es un array
            this._toArray(item);
        } else if (type === "object" && item.__type__ == "double") { // double
            this._toDouble(item.__value__);
        } else if (type === "object" && item.__type__ == "bigint") { // bigint - entero grande
            this._toBigInt(item.__value__);
        } else if (type === "object" && item.__type__ == "int") { // int - entero
            this._toInt(item.__value__);
        } else if (type === "object") { // Если это объект - Si es un objeto
            this._toObject(item);
        } else if (type === "boolean" && item === false) { // false
            this._rton.push(0x00);
        } else if (type == 'boolean' && item === true) { // true
            this._rton.push(0x01);
        } else if (type === "string" && item === '""') { // empty string - string vacío
            this._rton.push(0x81, 0x00);
        } else if (type === "string" && item === '"RTID(0)"') { // empty rtid - rtid vacío
            this._rton.push(0x84);
        } else if (type === "string" && item === '"RTID()"') { // null rtid - rtid nulo
            this._rton.push(0x83, 0x00);
        } else if (type === "string" && /RTID\(.{1,2}\..{1,2}\..{8}@.*?\)/i.test(item)) { // rtid ID
            this._toRtidID(item);
        } else if (type === "string" && /^RTID\(.*@.*\)$/i.test(item)) { // rtid
            this._toRtid(item);
        } else if (type === "string") { // string
            this._toSting(item);
        } else { // Что-то не найденное - Algo no encontrado
            throw(`Unrecognized type: "${type}" with value "${item}"`);
        }

    }

    // Преобразование списка в объект - Transformación de lista a objeto
    _toObject(item, root = false) {
        // Начало объекта если он не корневой - Inicio del objeto si no es raíz
        if ( ! root)
            this._rton.push(0x85);

        // Проходимся по ключам и значениям объекта - Recorremos las claves y valores del objeto
        for (let i in item) {
            // Добавляем ключ - Añadimos la clave
            this._toSting(i);

            // Добавляем значение - Añadimos el valor
            this._parse(item[i]);
        }

        // Конец объекта если он не корневой - Fin del objeto si no es raíz
        this._rton.push(0xff);
    }

    // Преобразование списка в массив - Transformación de lista a array
    _toArray(item) {
        // Начало массива - Inicio del array
        this._rton.push(0x86, 0xfd);
        // Количество элементов - Cantidad de elementos
        this._toNum(item.length);
        // Проходимся массиву - Recorremos el array
        for (let i of item) {
            // Добавляем значение - Añadimos el valor
            this._parse(i);
        }

        // Конец массива - Fin del array
        this._rton.push(0xfe);
    }

    // Преобразование строки в RTON - Transformación de string a RTON
    _toSting(str) {
        // Преобразуем в 8 битовый массив - Convertimos a array de 8 bits
        let strUTF = new TextEncoder().encode(str);

        // Если это обычная строка - Si es un string normal
        if (str.length == strUTF.length) {
            let pos = this._cache_str.indexOf(str);
            // Если строка есть в кеше - Si el string está en caché
            if (pos !== -1) {
                this._rton.push(0x91);
                this._toNum(pos);
            } else {
                // Добавляем сроку в кэш - Añadimos el string al caché
                this._cache_str.push(str);
                this._rton.push(0x90);
                this._toNum(str.length);
                for (let i = 0; i < str.length; i++)
                    this._rton.push(str.charCodeAt(i));
            }
        // Если это UTF 8 строка - Si es un string UTF-8
        } else {
            let pos = this._cache_utf.indexOf(str);
            // Если строка есть в кеше - Si el string está en caché
            if (pos !== -1) {
                this._rton.push(0x93);
                this._toNum(pos);
            } else {
                // Добавляем сроку в кэш - Añadimos el string al caché
                this._cache_utf.push(str);
                this._rton.push(0x92);
                this._toNum(str.length);
                this._toNum(strUTF.length);
                for (let i = 0; i < strUTF.length; i++)
                    this._rton.push(strUTF[i]);
            }
        }
    }

    // Преобразование номера в RTON - Transformación de número a RTON
    _toNum(num) {
        // Если это ноль - Si es cero
        if ( ! num) {
            this._rton.push(0x00);
            return;
        }
        // Разбиваем число на байты - Dividimos el número en bytes
        while (num) {
            let temp = num % 0x100;
            num = parseInt(num / 0x100) * 2;
            if (temp > 0x7f) {
                num++;
            } else if (num > 0) {
                temp += 0x80;
            }
            this._rton.push(temp);
        }
    }

    // Преобразование RTID ID в RTON (83 02 [L1] [L2] [string] [U2] [U1] [4-byte ID])
    _toRtidID(rtid) {
        // Начало RTID - Inicio de RTID
        this._rton.push(0x83, 0x02);
        // Разбираем RTID - Analizamos RTID
        const matches = rtid.match(/RTID\((.{1,2})\.(.{1,2})\.(.{8})@(.*?)\)/i);

        // Добавляем первую часть - Añadimos la primera parte
        this._toNum(matches[4].length);
        this._toNum(matches[4].length);
        for (let i = 0; i < matches[4].length; i++)
            this._rton.push(matches[4].charCodeAt(i));

        // Добавляем U2 - Añadimos U2
        this._rton.push(Number("0x" + matches[2]));
        if (Number("0x" + matches[2]) > 127)
            this._rton.push(1);

        // Добавляем U1 - Añadimos U1
        this._rton.push(Number("0x" + matches[1]));
        if (Number("0x" + matches[1]) > 127)
            this._rton.push(1);

        // Добавляем ID - Añadimos ID
        for (let i = 8; i > 0; i -= 2) 
            this._rton.push(Number("0x" + matches[3].slice(i - 2, i)));
    }

    // Преобразование RTID в RTON (83 03 [L1] [L2] [string] [L3] [L4] [string 2])
    _toRtid(rtid) {
        // Начало RTID - Inicio de RTID
        this._rton.push(0x83, 0x03);
        // Разбираем RTID - Analizamos RTID
        const matches = rtid.match(/^RTID\((.*)@(.*)\)$/i);

        // Добавляем первую часть - Añadimos la primera parte
        this._toNum(matches[2].length);
        this._toNum(matches[2].length);
        for (let i = 0; i < matches[2].length; i++)
            this._rton.push(matches[2].charCodeAt(i));

        // Добавляем вторую часть - Añadimos la segunda parte
        this._toNum(matches[1].length);
        this._toNum(matches[1].length);
        for (let i = 0; i < matches[1].length; i++)
            this._rton.push(matches[1].charCodeAt(i));
    }

    // Преобразование числа в RTON - Transformación de número a RTON
    _toInt(num) {
        num = parseInt(num);
        let depth = false;
        if (num === 0) { // 0
            this._rton.push(0x9);
            return;
        } else if (num >= -128 && num <= 127) { // int8
            this._rton.push(0x8);
            depth = 1;
        } else if (num >= 128 && num <= 255) { // uint8
            this._rton.push(0xa);
            depth = 1;
        } else if (num >= -32768 && num <= 32767) { // int16
            this._rton.push(0x10);
            depth = 2;
        } else if (num >= 32768 && num <= 65535) { // uint16
            this._rton.push(0x12);
            depth = 2;
        } else if (num >= -2147483648 && num <= 2147483647) { // int32
            this._rton.push(0x20);
            depth = 4;
        } else if (num >= 2147483648 && num <= 4294967295) { // uint32
            this._rton.push(0x26);
            depth = 4;
        } else { // Что то очень большое или очень маленькое - Algo muy grande o muy pequeño
            throw(`Type is "int", but value is outside the 32-bit range: "${num}"`);
        }

        // Заполняем данными - Llenamos con datos
        for (let i = 0; i < depth; i++) {
            let byte = num & 0xff;
            this._rton.push(byte);
            num = (num - byte) / 256;
        }
    }

    // Преобразование большого числа в RTON - Transformación de número grande a RTON
    _toBigInt(num) {
        // Если число влезает в int64 иначе uint64 - Si el número cabe en int64 sino uint64
        this._rton.push((BigInt(num) >= -9223372036854775808n && BigInt(num) <= 9223372036854775807n) ? 0x40 : 0x46);

        // Преобразуем в буфер - Convertimos a buffer
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setBigInt64(0, num, true); 
        const uint8Array = new Uint8Array(buffer);

        // Заносим в общий массив - Introducimos en el array general
        for (let i = 0; i < uint8Array.length; i++)
            this._rton.push(uint8Array[i]);
    }

    // Преобразование числа с плавающей запятой в RTON - Transformación de número con punto flotante a RTON
    _toDouble(num) {
        if (num === "0.0") {
            this._rton.push(0x43);
        } else {
            this._rton.push(0x42);
            // Преобразовываем в буфер - Convertimos a buffer
            let float = new Uint8Array(new Float64Array([parseFloat(num)]).buffer);
            for (let i = 0; i < float.length; i++)
                this._rton.push(float[i]);
        }
    }
}