// Преобразование RTON в JSON
class RTONAJSON {
	// Строка в формате RTON
	_rton = null;

	// Массив кеша строк
	_cache_str = [];

	// Массив кеша UTF 8 строк
	_cache_utf = [];

	// Текущий индекс
	_index = 8;

	// Результат
	_result = '';

	// Количество отступов
	_format = 0;

	// Устанавливаем RTON и начальные данные
	set(rton) {
		// Проверяем начало и конец файла rton (RTON и DONE)
		if (rton.slice(0, 4).toString() !== [82, 84, 79, 78].toString() || rton.slice(-4).toString() !== [68, 79, 78, 69].toString())
			throw(`The file is not RTON`);

		// Устанавливаем RTON строку
		this._rton = rton;

		// Обнуляем предыдущие результаты
		this._cache_str = [];
		this._cache_utf = [];
		this._index = 8;
		this._result = '';
		this._format = 0;

		return true;
	}

	// Возвращаем JSON
	get() {
		// Выполняем преобразование
		this._toObject();

		return `{\n${this._result}\n}`;
	}

	// В зависимости от типа выполняем преобразование
	_type() {
		// Получаем тип данных
		let type = this._rton[this._index++];

		switch (type) {
			case 0x00: // false
				this._result += 'false';
				break;
			case 0x01: // true
				this._result += 'true';
				break;
			case 0x08: // int8
				this._result += this._toInt(1);
				break;
			case 0x09: // 0 в int8
				this._result += 0;
				break;
			case 0x0a: // uint8
				this._result += this._toUint(1);
				break;
			case 0x0b: // 0 в uint8
				this._result += 0;
				break;
			case 0x10: // int16
				this._result += this._toInt(2);
				break;
			case 0x11: // 0 в int16
				this._result += 0;
				break;
			case 0x12: // uint16
				this._result += this._toUint(2);
				break;
			case 0x13: // 0 в uint16
				this._result += 0;
				break;
			case 0x20: // int32
				this._result += this._toInt(4);
				break;
			case 0x21: // 0 в int32
				this._result += 0;
				break;
			case 0x22: // float
				this._result += this._toFloat();
				break;
			case 0x23: // 0 в float
				this._result += '0.0';
				break;
			case 0x24: // беззнаковое число RTON
			case 0x28:
			case 0x44:
			case 0x48:
				this._result += this._toUnum();
				break;
			case 0x25: // знаковое число RTON
			case 0x29:
			case 0x45:
			case 0x49:
				this._result += this._toNum();
				break;
			case 0x26: // uint32
				this._result += this._toUint(4);
				break;
			case 0x27: // 0 в uint32
				this._result += 0;
				break;
			case 0x40: // int64
				this._result += this._toInt(8);
				break;
			case 0x41: // 0 в int64
				this._result += 0;
				break;
			case 0x42: // double
				this._result += this._toDouble();
				break;
			case 0x43: // 0 в double
				this._result += '0.0';
				break;
			case 0x46: // uint64
				this._result += this._toUint64();
				break;
			case 0x47: // 0 в uint64
				this._result += 0;
				break;
			case 0x81: // строка
				this._result += '"' + this._toStr() + '"';
				break;
			case 0x82: // utf8 строка
				this._result += '"' + this._toUtf() + '"';
				break;
			case 0x83: // rtid
				this._result += '"' + this._toRtid() + '"';
				break;
			case 0x84: // rtid пустой
				this._result += '"RTID(0)"';
				break;
			case 0x85: // объект
				this._result += "{\n";

				this._toObject();

				// Форматируем строку
				this._result += "\n";
				for (let t = 0; t < this._format; t++)
					this._result += "\t";

				this._result += "}";
				break;
			case 0x86: // массив
				this._result += "[\n";

				this._toArray();

				// Форматируем строку
				this._result += "\n";
				for (let t = 0; t < this._format; t++)
					this._result += "\t";

				this._result += "]";
				break;
			case 0x90: // строка с кэшем
				this._result += '"' + this._toStr(true) + '"';
				break;
			case 0x91: // строка из кэша
				this._result += '"' + this._toStrUncache() + '"';
				break;
			case 0x92: // UTF 8 строка с кэшем
				this._result += '"' + this._toUtf(true) + '"';
				break;
			case 0x93: // UTF 8 строка из кэша
				this._result += '"' + this._toUtfUncache() + '"';
				break;
			default: // что-то не предусмотренное
				throw(`Type ${type} not found in ${this._index}`);
		}
	}

	// Преобразование строки
	_toStr(cache = false) {
		// Получаем длину числа и длину строки
		let len = this._len(this._rton.slice(this._index, this._index + 8));
		let length = this._int(this._rton.slice(this._index, this._index + len));

		// Получаем байты
		let bytes = this._rton.slice(this._index + len, this._index + length + len);

		// Преобразуем в строку
		let str = new TextDecoder().decode(bytes);
		str = this._clearStr(str);

		// Добавляем строку в кэш если кэшируемая строка
		if (cache)
			this._cache_str.push(str);

		// Изменяем индекс
		this._index += len + length;

		return str;
	}

	// Преобразование кэша строки
	_toStrUncache() {
		// Получаем длину числа и длину строки
		let len = this._len(this._rton.slice(this._index, this._index + 8));
		let number = this._int(this._rton.slice(this._index, this._index + len));

		// Изменяем индекс
		this._index += len;

		// Выбираем строку из кэша
		return this._cache_str[number];
	}

	// Преобразование UTF строки
	_toUtf(cache = false) {
		// Обрезаем избыточные данные
		let len = this._len(this._rton.slice(this._index, this._index + 8));

		// Изменяем индекс
		this._index += len;

		// Получаем длину числа и длину строки
		len = this._len(this._rton.slice(this._index, this._index + 8));
		let length = this._int(this._rton.slice(this._index, this._index + len));

		// Получаем байты
		let bytes = this._rton.slice(this._index + len, this._index + length + len);

		// Преобразуем в строку
		let str = new TextDecoder().decode(bytes);
		str = this._clearStr(str);

		// Добавляем строку в кэш если кэшируемая строка
		if (cache)
			this._cache_utf.push[str];

		// Изменяем индекс
		this._index += len + length;

		return str;
	}

	// Преобразование кэша UTF строки
	_toUtfUncache() {
		// Получаем длину числа и длину строки
		let len = this._len(this._rton.slice(this._index, this._index + 8));
		let number = this._int(this._rton.slice(this._index, this._index + len));

		// Изменяем индекс
		this._index += len;

		// Выбираем строку из кэша
		return this._cache_utf[number];
	}

	// Преобразование в RTID
	_toRtid() {
		let type = this._rton[this._index++];

		if (type === 0x02) {
			// Получаем длину числа и длину строки
			let len = this._len(this._rton.slice(this._index, this._index + 8));
			let length = this._int(this._rton.slice(this._index, this._index + len));

			// Получаем строку
			let str1 = this._rton.slice(this._index + len + len, this._index + len + len + length);
			str1 = new TextDecoder().decode(str1);

			// Изменяем индекс
			this._index += len + len + length;

			// Получаем первую часть ID
			let u1 = parseInt(this._rton.slice(this._index, this._index + 1));
			this._index += (u1 > 127) ? 2 : 1;

			// Получаем вторую часть ID
			let u2 = parseInt(this._rton.slice(this._index, this._index + 1));
			this._index += (u2 > 127) ? 2 : 1;

			// Получаем ID
			let uid = "";
			this._rton.slice(this._index, this._index + 4).map((el) => {
				uid = el.toString(16).padStart(2, "0") + uid;
			});

			// Изменяем индекс
			this._index += 4;

			return `RTID(${u2.toString(16)}.${u1.toString(16)}.${uid}@${str1})`;

		} else if (type === 0x03) {
			// Получаем длину числа и длину строки
			let len = this._len(this._rton.slice(this._index, this._index + 8));
			let length = this._int(this._rton.slice(this._index, this._index + len));

			// Получаем строку
			let str1 = this._rton.slice(this._index + len + len, this._index + len + len + length);
			str1 = new TextDecoder().decode(str1);

			// Изменяем индекс
			this._index += len + len + length;

			// Получаем длину числа и длину строки
			len = this._len(this._rton.slice(this._index, this._index + 8));
			length = this._int(this._rton.slice(this._index, this._index + len));

			// Получаем строку
			let str2 = this._rton.slice(this._index + len + len, this._index + len + len + length);
			str2 = new TextDecoder().decode(str2);

			// Изменяем индекс
			this._index += len + len + length;

			return `RTID(${str2}@${str1})`;
		} else {
			throw(`RTID ${type} - not found in ${this._index}`);
		}
	}

	// Преобразование знакового числа
	_toInt(len) {
		// Получаем строку
		let str = this._rton.slice(this._index, this._index + len);

		// Преобразуем в число
		let int = 0;
		for (var i = str.length - 1; i >= 0; i--) {
			int = (int * 256) + str[i];
		}

		// Изменяем индекс
		this._index += len;

		return int;
	}

	// Преобразование беззнакового числа
	_toUint(len) {
		// Получаем строку
		let str = this._rton.slice(this._index, this._index + len);

		// Преобразуем в число
		let int = 0;
		for (var i = str.length - 1; i >= 0; i--) {
			int = (int * 256) + str[i];
		}

		// Изменяем индекс
		this._index += len;

		return int;
	}

	// Преобразование беззнакового 64 разрядного числа
	_toUint64() {
		// Получаем строку
		let bytes = this._rton.slice(this._index, this._index + 8);

		// Преобразуем в число
		let digits = [];
		bytes.forEach((byte, j) => {
			for (let i = 0; byte > 0 || i < digits.length; i++) {
				byte += (digits[i] || 0) * 0x100;
				digits[i] = byte % 10;
				byte = (byte - digits[i]) / 10;
			}
		});

		// Изменяем индекс
		this._index += 8;

		return digits.reverse().join('');
	}

	// Преобразование знакового числа
	_toFloat() {
		// Получаем срез
		let bytes = this._rton.slice(this._index, this._index + 4);

		// Преобразуем в float
		const floatView = new DataView(bytes.buffer);
		const float = floatView.getFloat32(0, true);

		// Преобразуем в строку и добавляем конечный 0 если его нет
		let str = float.toString();
		str = str.indexOf('.') === -1 ? str + ".0" : str;

		// Изменяем индекс
		this._index += 4;

		return str;
	}

	// Преобразование знакового числа
	_toDouble() {
		// Получаем срез
		let bytes = this._rton.slice(this._index, this._index + 8);

		// Преобразуем в double
		const doubleView = new DataView(bytes.buffer);
		const double = doubleView.getFloat64(0, true);

		// Преобразуем в строку и добавляем конечный 0 если его нет
		let str = double.toString();
		str = str.indexOf('.') === -1 ? str + ".0" : str;

		// Изменяем индекс
		this._index += 8;

		return str;
	}

	// Преобразование беззнакового числа RTON
	_toUnum() {
		// Получаем длину числа и само число
		let len = this._len(this._rton.slice(this._index, this._index + 8));
		let int = this._int(this._rton.slice(this._index, this._index + len));

		// Изменяем индекс
		this._index += len;

		return int;
	}

	// Преобразование знакового числа RTON
	_toNum() {
		// Получаем длину числа и само число
		let len = this._len(this._rton.slice(this._index, this._index + 8));
		let int = this._int(this._rton.slice(this._index, this._index + len));

		// Преобразуем знак
		if (int % 2)
			int = -(int + 1);
		int /= 2;

		// Изменяем индекс
		this._index += len;

		return int;
	}

	// Преобразование RTON в массив
	_toArray() {
		// Увеличиваем индекс из за 0xfd
		this._index++;

		// Если пустой массив
		if (this._rton[this._index] === 0x00) {
			// Изменяем индекс
			this._index += 2;

			return;
		}

		// Получаем количество элементов массива
		let len = this._len(this._rton.slice(this._index, this._index + 8));
		let count = this._int(this._rton.slice(this._index, this._index + len));

		// Увеличиваем индекс из за количества элементов
		this._index += len;

		this._format++;
		for (let i = 0; i < count; i++) {
			// Форматируем строку
			for (let t = 0; t < this._format; t++)
				this._result += "\t";

			// Запускаем проверку
			this._type();

			// Если не последний элемент массива
			if (i + 1 !== count)
				this._result += ",\n";
		}
		this._format--;

		// Увеличиваем индекс из за 0xfe
		this._index++;
	}

	// Преобразование RTON в объект
	_toObject() {
		// Если пустой объект
		if (this._rton[this._index] === 0xff) {
			// Изменяем индекс
			this._index++;

			return;
		}

		this._format++;
		for (;this._index + 4 < this._rton.length;) {
			// Форматируем строку
			for (let t = 0; t < this._format; t++)
				this._result += "\t";

			// Запускаем проверку
			this._type();
			this._result += ': ';
			this._type();

			// Проверяем на конец объекта
			if (this._rton[this._index] === 0xff) {
				break;
			} else {
				this._result += ",\n";
			}
		}
		this._format--;

		// Увеличиваем индекс из за 0xff
		this._index++;
	}

	// Подсчет количества символов в числе RTON
	_len(bytes) {
		let length = 1;
		for (let y = 0; bytes[y] > 0x7f; y++)
			length++;

		return length;
	}

	// Преобразование RTON в число
	_int(bytes) {
		let res = 0;
		for (let i = bytes.length; i > 0; i--) {
			let byte = bytes[i - 1];
			if (res % 2 == 0)
				byte &= 0x7f;
			res /= 2;
			res = byte + parseInt(res) * 0x100;
		}

		return res;
	}

	// Очистка строки от спецсимволов
	_clearStr(str) {
		str = str.replaceAll(/\r\n|\r|\n/gi, '\\n');
		str = str.replaceAll(/\t/gi, "\\t");
		str = str.replaceAll('"', '\"');

		return str;
	}
}