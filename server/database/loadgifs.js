const config = require('./config.json')
const gfycatSDK = require('gfycat-sdk')
const fetch = require('node-fetch')
const fs = require('fs')

const GIFSDIR = 'gifs'

const apihost = 'https://api.gfycat.com/v1'

const authBody = {
	grant_type: 'password',
	client_id: config.client_id,
	client_secret: config.client_secret,
	username: config.username,
	password: config.password
}

let token = ''

fetch(`${apihost}/oauth/token`, {
	method: 'POST',
	body: JSON.stringify(authBody),
	headers: {
		'Content-Type': 'application/json'
	}
})
.then(res => res.json())
.then(data => {
	token = data.access_token

	return getRequest('/me/album-folders')
})
.then(data => {
	const albums = data[0].nodes
	for(let i = 0; i < albums.length; i++) {
		const album = albums[i]
		console.log(album)
		getRequest('/me/albums/' + album.id)
			.then(data => {
				const attackToGif = data.publishedGfys.reduce((acc, value) => {
					acc[value.title] = value.gifUrl
					return acc
				}, {})


				fs.writeFile(path.join(__dirname, GIFSDIR, album.title.toLowerCase() + '.json'), JSON.stringify({name: album.title.toLowerCase(), gifs: attackToGif}, null, '\t'), (err) => {
					console.log(album.title + ' complete.')
				})
				return
			})
	}
})



function getRequest(endpoint) {
	return fetch(apihost + endpoint, {
		headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
	}).then(res => res.json())
}