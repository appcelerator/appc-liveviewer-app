var utils = require('utils');

module.exports = function xhr(url, opts, callback) {
	opts = opts || {};

	var xhr = Ti.Network.createHTTPClient({
		cache: false,
		onload: function onLoad() {

			if (this.status !== 200 || !this.responseText) {
				return callback('No response: ' + this.status);
			}

			var contentType = opts.contentType || this.getResponseHeader('Content-Type');

			console.debug('contentType: ' + contentType);

			if (opts.dir) {
				opts.file = opts.file || 'app.js'

				var file;

				if (contentType === 'application/zip') {
					file = Ti.Filesystem.createTempFile();
					file.write(this.responseData);

					console.log('saved as: ' + file.resolve());

					console.log('ensuring: ' + opts.dir);

					var dir = utils.ensureDirSync(opts.dir);

					console.debug('Unzipping: ' + file.resolve() + ' > ' + dir.resolve());

					require('ti.compression').unzip(dir.resolve(), file.resolve(), true);

					return callback();

				} else {
					file = utils.ensureFileSync(opts.dir + '/' + opts.file);
					file.write(this.responseData);

					return callback();
				}
			}

			var response = this.responseText;

			if (contentType === 'application/json') {
				try {
					response = JSON.parse(response);
				} catch (e) {
					return callback('Invalid response: ' + this.responseText);
				}
			}

			callback(null, response);
		},
		onerror: function onError(e) {
			return callback('No connection: ' + e.error + (e.code ? ' #' + e.code : ''));
		}
	});

	xhr.open('GET', url);
	xhr.send();
};
