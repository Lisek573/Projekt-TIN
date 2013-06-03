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
		$leftOczek = $('#oczekLeft'),
		$rightOczek = $('#oczekRight'),
		$button = $('#button'),
		$button2 = $('#button2');

	socket.on('playersLimit', function (status) {
		alert("Już nie można dołączyć do gry. Możesz wciąż ją podglądać.");
		$leftName.empty();
		$rightName.empty();
		$leftAv.empty();
		$rightAv.empty();
		$leftOczek.empty();
		$rightOczek.empty();
		$button.empty();
		$button2.empty();

		$('<p>',{html: "<center>Miłego oglądania</center>"}).appendTo($button);
		$('<h2>',{html: status.playerLeftName}).appendTo($leftName);	
		$('<h2>',{html: '<img src="'+status.playerLeftAvatar+'" width="100" height="100">'}).appendTo($leftAv);
		$('<h2>',{html: status.playerRightName}).appendTo($rightName);
		$('<h2>',{html: '<img src="'+status.playerRightAvatar+'" width="100" height="100">'}).appendTo($rightAv);
	});

	socket.on('allowJoin', function () {
		var username = prompt("Wpisz swoją ksywkę:");
		var randomnumber=Math.floor(Math.random()*100001)
		username = username ? username : "Gość"+randomnumber;
		var avatar = prompt("Podaj link do avataru:");
		avatar = avatar ? avatar : "http://i40.tinypic.com/2u760rk.jpg";
		socket.emit('join', username, avatar);
	});

	socket.on('updatePlayers', function (status) {
		$leftName.empty();
		$rightName.empty();
		$leftAv.empty();
		$rightAv.empty();
				
		if (status.playerLeftName === status.playerRightName){
		status.playerRightName = status.playerLeftName+"(2)";
		}
				
		if (status.playerLeftName !== null) {
			$('<h2>',{html: status.playerLeftName}).appendTo($leftName);
			//$('<h2>',{html: status.playerLeftAllow}).appendTo($leftOczek);
			$('<h2>',{html: '<img src="'+status.playerLeftAvatar+'" width="100" height="100">'}).appendTo($leftAv);
		}
		else {
			$('<h2>',{html: 'Empty'}).appendTo($leftName);
		}
		if (status.playerRightName !== null) {
			$('<h2>',{html: status.playerRightName}).appendTo($rightName);
			//$('<h2>',{html: status.playerRightAllow}).appendTo($rightOczek);
			$('<h2>',{html: '<img src="'+status.playerRightAvatar+'" width="100" height="100">'}).appendTo($rightAv);
		}
		else {
			$('<h2>',{html: 'Empty'}).appendTo($rightName);
		}
	});
	socket.on('updateSteps', function (status) {
		$leftStep.empty();
		$rightStep.empty();
		$leftOczek.empty();
		$rightOczek.empty();
		
		if (status.playerLeftAllow === 1){
			$leftOczek.empty();
			$('<h2>',{html: 'OCZEKUJE NA AKCEPTACJE'}).appendTo($leftOczek);
		}
		else{
		$leftOczek.empty();
		}
		
		if (status.playerRightAllow === 1){
			$rightOczek.empty();
			$('<h2>',{html: 'OCZEKUJE NA AKCEPTACJE'}).appendTo($rightOczek);
		}
		else{
		$rightOczek.empty();
		}
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