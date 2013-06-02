/*jshint node:true */
/*global io:true */
'use strict';
(function () {

	var socket = io.connect('http://localhost');

		var $leftName = $('#playerLeftName'),
		$rightName = $('#playerRightName'),
		$leftAv = $('#playerLeftAvatar'),
		$rightAv = $('#playerRightAvatar'),
		$leftStep = $('#stepLeft'),
		$rightStep = $('#stepRight'),
		$button = $('#button'),
		$button2 = $('#button2');

	socket.on('playersLimit', function (status) {
		alert("Już nie można dołączyć do gry. Możesz wciąż ją podglądać.");
		$leftName.empty();
		$rightName.empty();
		$leftAv.empty();
		$rightAv.empty();
		$button.empty();
		$button2.empty();

		$('<p>',{html: "<center>Miłego oglądania</center>"}).appendTo($button);
		$('<h2>',{html: status.playerLeftName}).appendTo($leftName);	
		$('<h2>',{html: '<img width=100px height=100px src='+status.playerRightAvatar+'>'}).appendTo($leftAv);
		$('<h2>',{html: '<img width=100px height=100px src='+status.playerRightAvatar+'>'}).appendTo($rightAv);
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
			$('<h2>',{html: '<img width=100px height=100px src='+status.playerLeftAvatar+'>'}).appendTo($leftAv);
		}
		else {
			$('<h2>',{html: 'Empty'}).appendTo($leftName);
			$('<h2>',{html: '<img width=100px height=100px src='+status.playerRightAvatar+'>'}).appendTo($leftAv);
		}
		if (status.playerRightName !== null) {
			$('<h2>',{html: status.playerRightName}).appendTo($rightName);
			$('<h2>',{html: '<img width=100px height=100px src='+status.playerRightAvatar+'>'}).appendTo($rightAv);
		}
		else {
			$('<h2>',{html: 'Empty'}).appendTo($rightName);
			$('<h2>',{html: '<img width=100px height=100px src='+status.playerRightAvatar+'>'}).appendTo($rightAv);
		}
	});
	//odświeżanie akcji
	socket.on('updateSteps', function (status) {
		$leftStep.empty();
		$rightStep.empty();
		// $button2.empty();
			
		/*if (status.playerLeftAllow === 1){
			$('<h2>',{html: ' <center><button id="next-allow" class="btn btn-success btn-large">Zezwól na następny ruch graczowi 1</button></center>'}).appendTo($button2);
		}
		
		if (status.playerRightAllow === 1){
			$('<h2>',{html: ' <center><button id="next-allow" class="btn btn-warning btn-large">Zezwól na następny ruch graczowi 2</button></center>'}).appendTo($button2);
		}
		
		if (status.playerLeftAllow === 0){
			$('<h2>',{html: ''}).appendTo($button2);
		}
		
		if (status.playerRightAllow === 0){
			$('<h2>',{html: ''}).appendTo($button2);
		}*/
		
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
		socket.emit('next');
	});
	
	$('#next-allow').on('click', function () {
		socket.emit('next-allow');
	});

})();