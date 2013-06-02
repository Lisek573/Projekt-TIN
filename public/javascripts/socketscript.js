/*jshint node:true */
/*global io:true */
'use strict';
(function () {

	var socket = io.connect('http://localhost');

		var $leftName = $('#playerLeftName'),
		$rightName = $('#playerRightName'),
		$leftStep = $('#stepLeft'),
		$rightStep = $('#stepRight'),
		$button = $('#button'),
		$button2 = $('#button2');

	socket.on('playersLimit', function (status) {
		alert("Już nie można dołączyć do gry. Możesz wciąż ją podglądać.");
		$leftName.empty();
		$rightName.empty();
		$button.empty();

		$('<p>',{html: "<center>Miłego oglądania</center>"}).appendTo($button);
		$('<h2>',{html: status.playerLeftName}).appendTo($leftName);	
		$('<h2>',{html: status.playerRightName}).appendTo($rightName);
	});

	socket.on('allowJoin', function () {
		var username = prompt("Wpisz swoją ksywkę:");
		username = username ? username : "Ktokolwiek";
		socket.emit('join', username);
	});

	socket.on('updatePlayers', function (status) {
		$leftName.empty();
		$rightName.empty();
		if (status.playerLeftName !== null) {
			$('<h2>',{html: status.playerLeftName}).appendTo($leftName);
		}
		else {
			$('<h2>',{html: 'Empty'}).appendTo($leftName);
		}
		if (status.playerRightName !== null) {
			$('<h2>',{html: status.playerRightName}).appendTo($rightName);
		}
		else {
			$('<h2>',{html: 'Empty'}).appendTo($rightName);
		}
	});
	//odświeżanie akcji
	socket.on('updateSteps', function (status) {

		$leftStep.empty();
		$rightStep.empty();
		if (status.playerLeftName !== null) {
			if (status.actions[status.playerLeftAction] !== undefined) {
				$('<p>',{html: status.actions[status.playerLeftAction]}).appendTo($leftStep);
			}
			else {
				$('<p>',{html: 'Wszystkie zadania wykonane. Gratulacje!'}).appendTo($leftStep);
			}
		}
		if (status.playerRightName !== null) {
			if (status.actions[status.playerRightAction] !== undefined) {
				$('<p>',{html: status.actions[status.playerRightAction]}).appendTo($rightStep);
			}
			else {
				$('<p>',{html: 'Wszystkie zadania wykonane. Gratulacje!'}).appendTo($rightStep);
			}

		}
	});
	
	$('#next').on('click', function () {
		$button2.empty();
		$('<h2>',{html: ' <center><button id="next-allow" class="btn btn-warning btn-large">Zezwól na następny ruch</button></center>'}).appendTo($button2);
		socket.emit('next');
	});
	
	$('#next-allow').on('click', function () {
		$button2.empty();
		socket.emit('next-allow');
	});

})();