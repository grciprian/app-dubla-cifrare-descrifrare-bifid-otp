const fs = require('fs');

$(document).ready(() => {

	console.log("Salut! Aici incepe debugarea pentru aplicatie! :)\nContinuam in engleza because why not.");

	// Data
	let data;
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	// Get DOM elements of interest
	const plainTextFileSelector = $('#plainTextFileSelector');
	const plainTextFileRefresh = $('#plainTextFileRefresh');
	const plainTextInfoBox = $('#plainTextInfoBox');
	const plainTextEncryptButton = $('#plainTextEncryptButton');

	const bifidInfoBox = $('#bifidInfoBox');

	const otpFileSelector = $('#otpFileSelector');
	const otpFileRefresh = $('#otpFileRefresh');
	const otpInfoBox = $('#otpInfoBox');
	const otpDecryptButton = $('#otpDecryptButton');

	// Handle events

	plainTextFileSelector.bind('change', (e) => {
		const path = e?.target?.files[0]?.path;
		if (!path) {
			plainTextEncryptButton.attr("disabled", "disabled");
			return;
		}
		otpDecryptButton.attr("disabled", "disabled");
		otpFileSelector[0].value = "";
		showProcessedData({}, bifidInfoBox);
		showProcessedData({}, otpInfoBox);
		plainTextEncryptButton.removeAttr("disabled");
		getPlainData(path);
	});
	plainTextFileRefresh.bind('click', (_) => {
		const path = plainTextFileSelector[0]?.files[0]?.path;
		if (!path) return;
		getPlainData(path);
	});

	plainTextEncryptButton.bind('click', (_) => {
		if (!(data && data.text && data.bifid_key && data.otp_key)) return;
		const bifidEncryptedData = encryptBifid(data.text, data.bifid_key);
		showProcessedData({ text_criptat: bifidEncryptedData }, bifidInfoBox);
		const otpEncryptedData = encryptOtp(bifidEncryptedData, data.otp_key);
		showProcessedData({ text_criptat: otpEncryptedData }, otpInfoBox);
		writeToFile('ENCRYPTED from ' + JSON.stringify(data) + ' to ' + otpEncryptedData);
	});

	//////////

	otpFileSelector.bind('change', (e) => {
		const path = e?.target?.files[0]?.path;
		if (!path) {
			otpDecryptButton.attr("disabled", "disabled");
			return;
		}
		plainTextEncryptButton.attr("disabled", "disabled");
		plainTextFileSelector[0].value = "";
		showProcessedData({}, bifidInfoBox);
		showProcessedData({}, plainTextInfoBox);
		otpDecryptButton.removeAttr("disabled");
		getEncryptedData(path);
	});
	otpFileRefresh.bind('click', (_) => {
		const path = otpFileSelector[0]?.files[0]?.path;
		if (!path) return;
		getEncryptedData(path);
	});

	otpDecryptButton.bind('click', (_) => {
		if (!(data && data.text && data.bifid_key && data.otp_key)) return;
		const otpDecryptedData = decryptOtp(data.text, data.otp_key);
		showProcessedData({ text_decriptat: otpDecryptedData }, bifidInfoBox);
		const bifidDecryptedData = decryptBifid(otpDecryptedData, data.bifid_key);
		showProcessedData({ text_decriptat: bifidDecryptedData }, plainTextInfoBox);
		writeToFile('DECRYPTED from ' + JSON.stringify(data) + ' to ' + bifidDecryptedData);
	});

	// Handle files
	getPlainData = (filepath) => {
		if (!filepath) return;
		fs.readFile(filepath, 'utf-8', (err, d) => {
			if (err) {
				alert("An error ocurred reading the file :" + err.message);
				return;
			}
			console.log("The file content is : " + d);
			try {
				data = capitalize(JSON.parse(d)); console.log(data);
				errorMessages = validate(data);
				if (errorMessages.length === 0) {
					showProcessedData(data, plainTextInfoBox);
				} else {
					showProcessedData({ PARSE_ERRORS: errorMessages }, plainTextInfoBox);
				}
			} catch (e) {
				plainTextFileSelector[0].value = "";
				window.alert('Could not parse JSON file.');
				console.log('Could not parse JSON file.', e);
			}
		});
	}

	getEncryptedData = (filepath) => {
		if (!filepath) return;
		fs.readFile(filepath, 'utf-8', (err, d) => {
			if (err) {
				alert("An error ocurred reading the file :" + err.message);
				return;
			}
			console.log("The file content is : " + d);
			try {
				data = capitalize(JSON.parse(d)); console.log(data);
				errorMessages = validate(data);
				if (errorMessages.length === 0) {
					showProcessedData(data, otpInfoBox);
				} else {
					showProcessedData({ PARSE_ERRORS: errorMessages }, otpInfoBox);
				}
			} catch (e) {
				otpFileSelector[0].value = "";
				window.alert('Could not parse JSON file.');
				console.log('Could not parse JSON file.', e);
			}
		});
	}

	writeToFile = (content) => {
		var date = new Date();
		var log_dt = date.toISOString();

		fs.appendFile('logs.txt', log_dt + ': ' + content + '\n', function (err) {
			if (err) throw err;
			console.log('Done writing to file.');
		});
	}

	// Update GUI
	showProcessedData = (dobj, element) => {
		element.empty();
		const output = Object.keys(dobj).reduce((prev, curr) =>
			`
			${prev}
			<tr>
				<th scope="row">${curr}</th>
				<td>${dobj[curr]}</td>
			</tr>
			`, ``);
		element.append(output);
	}

	// Encrypt
	encryptBifid = (d, k) => {
		const polybiusSquare = generatePolybiusSquare(k);
		console.log(polybiusSquare);

		const firstRow = [];
		const secondRow = [];
		[...d].forEach(c => {
			const [i, j] = getElementIndexInMatrix(c, polybiusSquare);
			firstRow.push(i);
			secondRow.push(j);
		});
		const merged = [...firstRow, ...secondRow];
		console.log(merged);

		let encryptedMessage = "";
		for (let i = 0; i < merged.length - 1; i += 2) {
			console.log(merged[i], merged[i + 1]);
			encryptedMessage += polybiusSquare[merged[i]][merged[i + 1]];
		}
		console.log(encryptedMessage);

		return encryptedMessage;
	}

	encryptOtp = (d, k) => {
		const dIndices = [];
		const kIndices = [];
		console.log(d, k, alphabet);
		[...d].forEach(c => dIndices.push(getElementIndexInVector(c, alphabet)));
		[...k].forEach(c => kIndices.push(getElementIndexInVector(c, alphabet)));
		console.log(dIndices, kIndices);

		let encryptedMessage = "";
		dIndices.forEach((di, i) => {
			const encIndex = (di + kIndices[i]) % 26;
			encryptedMessage += alphabet[encIndex];
		});
		console.log(encryptedMessage);

		return encryptedMessage;
	}

	// Decrypt
	decryptBifid = (m, k) => {
		const polybiusSquare = generatePolybiusSquare(k);
		let merged = [];
		[...m].forEach(c => {
			const [i, j] = getElementIndexInMatrix(c, polybiusSquare);
			merged = [...merged, i, j];
		});
		const firstRow = merged.slice(0, merged.length / 2);
		const secondRow = merged.slice(merged.length / 2, merged.length);

		let decryptedMessage = "";
		firstRow.forEach((di, i) => {
			decryptedMessage += polybiusSquare[di][secondRow[i]];
		});
		console.log(decryptedMessage);

		return decryptedMessage;
	}

	decryptOtp = (m, k) => {
		let decryptedIndices = [];
		const shardedKey = [...k];
		[...m].forEach((mi, i) => {
			const mIndex = getElementIndexInVector(mi, alphabet);
			const kIndex = getElementIndexInVector(shardedKey[i], alphabet);
			index = (mIndex - kIndex) < 0 ? 26 + (mIndex - kIndex) % 26 : (mIndex - kIndex) % 26;
			decryptedIndices = [...decryptedIndices, index];
		});

		let decryptedMessage = "";
		decryptedIndices.forEach(i => decryptedMessage += alphabet[i]);
		console.log(decryptedMessage);

		return decryptedMessage;
	}

	// Utils
	generatePolybiusSquare = (k) => {
		let i, j, cn;
		const alphabetWithoutJ = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // I=J
		let square = [];
		k = [...k].reduce((prev, curr) => [...prev].find((c) => c === curr) ? prev : prev + curr, '');
		for (i = 0; i < 5; i++) {
			square.push([]);
			for (j = 0; j < 5; j++) {
				cn = i * 5 + j;
				const c = k.charAt(cn);
				if (c) {
					square[i].push(c);
				} else {
					const flattenSquare = square.reduce((prev, curr) => [...prev, ...curr], []);
					off = [...alphabetWithoutJ].find(x => !flattenSquare.find(t => t === x));
					square[i].push(off);
				}
			}
		}
		return square;
	}

	getElementIndexInMatrix = (c, m) => {
		let i, j;
		m.find((row, ii) => row.find((v, jj) => {
			if (v === c || (v === 'I' && c === 'J')) {
				i = ii; j = jj;
				return true;
			}
			return false;
		}));
		return [i, j];
	}

	getElementIndexInVector = (c, v) => {
		let i;
		[...v].find((t, ii) => {
			if (t === c) {
				i = ii;
				return true;
			}
			return false;
		});
		return i;
	}

	capitalize = (data) => {
		Object.keys(data).forEach(key =>
			data[key] ?
				data = {
					...data,
					[key]: data[key].toUpperCase()
				} : _);
		return data;
	}

	validate = (data) => {
		let errorMessages = [];

		const hasThreeKeys = Object.keys(data).length === 3;
		if (!hasThreeKeys) errorMessages.push("-is required to have 3 fields: 'text', 'bifid__key' and 'otp_key'\n");
		const hasGoodKeyNames = Object.keys(data).reduce((prev, curr) => prev && ["text", "bifid_key", "otp_key"].find(v => v === curr), true);
		if (!hasGoodKeyNames) errorMessages.push("-is required to have 'text', 'bifid__key' and 'otp_key' field names\n");
		const hasOnlyLetters =
			Object.keys(data).reduce((prev, curr) =>
				prev && typeof data[curr] === "string" &&
				[...data[curr]].reduce((p, c) => [...alphabet].find(v => p && v === c), true), true);
		if (!hasOnlyLetters) errorMessages.push("-fields values should contain only letters\n");
		const hasOtpKeyLengthEqualToTextLength = data["text"]?.length === data["otp_key"]?.length;
		if (data["text"] && data["otp_key"] && !hasOtpKeyLengthEqualToTextLength) errorMessages.push("-otp_key has to be the same length as the text");

		return errorMessages;
	}

});