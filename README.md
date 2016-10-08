# tinc invite

This is a small web API server, which will create new tinc invitations.

A shared secret can be used by multiple machines to create tinc invites for
joining your tinc vpn.

## The protocol

Make a HTTP POST request to `/invitation/<some name>`. You need to pass
proper Sessionist HTTP `Autorization:` headers. The invite will be returned
in the `Location:` response header.

## Example bash script

		#!/bin/bash

		keyid="myid"
		secretkey="topsecret"

		time="$(LC_ALL=C LANG=en date +"%a, %d %b %Y %T %z")"
		nonce="$(openssl rand 63 -hex)"
		method="POST"
		path="/invitation/mymachine"
		body="{ \"some\": \"data\" }"
		hexval="$nonce$(echo -n $method$path$body$time | xxd -p | tr -d "\n")"
		hash="$(echo -n "$hexval" | xxd -r -p | openssl dgst -sha512 -mac HMAC -macopt key:$secretkey | cut -d" " -f2)"
		authheader="Authorization: ss1 keyid=$keyid, hash=$hash, nonce=$nonce"

		curl -v -v -X "$method" -H "Accept: text/plain" -H "$authheader" -H "Date: $time" -d "$body" "http://127.0.0.1:8080$path" 2>&1 | grep '^< Location:' | sed -r 's/^[^:]+: //'

