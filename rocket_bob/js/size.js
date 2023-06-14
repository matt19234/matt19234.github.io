(function () {
	var gameSpace = document.getElementById('game-space');

	window.GAME_SPACE = {
		width : gameSpace.clientWidth,
		height : gameSpace.clientHeight
	};
})();

function getParentSize (element) {
	var parent = element.parentElement;

	var style = window.getComputedStyle(parent, null);

	var paddingX = parseFloat(style.getPropertyValue('padding-left')) + parseFloat(style.getPropertyValue('padding-right'));
	var paddingY = parseFloat(style.getPropertyValue('padding-top')) + parseFloat(style.getPropertyValue('padding-bottom'));

	return {
		width : parent.clientWidth - paddingX,
		height : parent.clientHeight - paddingY
	};
}