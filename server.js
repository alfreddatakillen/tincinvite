const conf = require('smplcnf');
const exec = require('child_process').exec;
const restify = require('restify');
const sessionist_middleware = require('sessionist-middleware');

conf.load('config.json');
const server = restify.createServer();

const keyfn = (keyid, cb) => {
	if (keyid === 'hello') return cb(null, 'topsecret');
	return cb(new Error('Invalid credentials.'));
};
server.use(sessionist_middleware.parseAuthorizationMiddleware(keyfn));
server.use(sessionist_middleware.settleAuthorizationMiddleware());

conf('tinc.config_dir')
.then(tincconfig => {

	server.post('/invitation/:host', (req, res, next) => {

		console.log(req.params.host);

		let timestamp = (new Date()).getTime();
		let host = `${req.params.host}${timestamp}`

		let cmd = `tinc --config=${tincconfig} invite ${host}`;
		console.log(`--> ${cmd}`);
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.error(`exec error: ${err}`);
				return next(new restify.InternalServerError('Error calling tinc.'));
			}
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);

			res.header('Location', `${stdout.trim()}`);
			res.send(302, '');
			next();

		});

	});
})
.then(() => conf('port'))
.then(port => {
	server.listen(port, function() {
		console.log('%s listening at %s', server.name, server.url);
	});
})
