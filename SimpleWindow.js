
SimpleWindow.defaultOptions = {

	isVisible : true, 	// 是否可见
	isDragable : true,	// 是否可拖动
	isScalable : true,	// 是否可缩放大小
	isCollapse : false,	// 是否缩起
	isMaximize : false, // 是否最大化

	zIndex : 1000,

	parent : document.body,

	width: 300,
    height: 300,
    left: 200,
    top: 200,

    minWidth : 100,
    minHeight : 100,
    maxWidth : 400,
    maxHeight : 400,

    header : "title",
    body : "body",
    footer : "footer"


}

function SimpleWindow(opts) {

	
	var options = this.constructor.defaultOptions;

	// 扩展默认参数
	this.options = Util.extend(options,opts);

	// 初始化
	this.init();
}



SimpleWindow.prototype = {

	constructor : SimpleWindow,

	// 初始化
	init : function() {
		var opts = this.options;

		this._create(); // 创建窗口元素

		this._setStatus();

		this._headerMax(); // 双击最大化

		this._setDragResize(); // 设置拖拽缩小放大窗体
	},

	// 创建窗口
	_create : function () {
		var opts = this.options;

		// simple-window
		var winElement = this.winElement = document.createElement('div');
		winElement.className = "simple-window";

		// simple-window-container
		var winContainer = this.winContainer = document.createElement('div');
		winContainer.className = "simple-window-container";
		winElement.appendChild(winContainer);

		// simple-window-header
		var winHeader = this.winHeader = document.createElement('div');
		winHeader.className = "simple-window-header";
		winHeader.innerHTML = opts.header;
		winContainer.appendChild(winHeader);

		// simple-window-body
		var winBody = this.winBody = document.createElement('div');
		winBody.className = "simple-window-body";
		winBody.innerHTML = opts.body;
		winContainer.appendChild(winBody);

		// simple-window-footer
		var winFooter = this.winFooter = document.createElement('div');
		winFooter.className = "simple-window-footer";
		winFooter.innerHTML = opts.footer;
		winContainer.appendChild(winFooter);

		this.options.parent.appendChild(winElement);
	},

	
	_setStatus : function(argument) {
		var opts = this.options;

		this.moveTo(opts.left, opts.top);
		this.resizeTo(opts.width, opts.height);

		this.show();

		// this.maximize();

		this.collapse();

		this.setDragAble();
	},

	// 设置可拖动
	setDragAble : function(argument) {
		var _self = this;

		Util.event.on(_self.winHeader, "mousedown", dragDown);

		var startPosition, // 窗口起始位置
			startAxis,	// 鼠标起始位置
			parentSize // 拖动范围大小

		// 点击拖动绑定
		function dragDown(e) {
			var opts = _self.options;

			if(opts.isMaximize){return};

			e = Util.event.getEvent(e);

			startAxis = Util.event.getPageAxis(e);
			startPosition = {
				left : opts.left,
				top : opts.top
			}

			parentSize = {
				width : opts.parent.clientWidth,
				height : opts.parent.clientHeight
			}

			Util.event.on(document, 'mousemove', dragMove);
			Util.event.on(document, 'mouseup', dragStop);
		}

		// 移动过程
		function dragMove(e) {
			e = Util.event.getEvent(e);
			var endAxis =  Util.event.getPageAxis(e);

			var changedAxis = {
				x : endAxis.x - startAxis.x,
				y : endAxis.y - startAxis.y
			}

			var resultLeft = startPosition.left + changedAxis.x;
			var resultTop = startPosition.top + changedAxis.y;

			if(resultLeft < 0){
				resultLeft = 0;
			} 

			if(resultTop < 0){
				resultTop = 0;
			}

			if(resultLeft + _self.options.width > parentSize.width){
				resultLeft = parentSize.width - _self.options.width
			}

			if(resultTop + _self.options.height > parentSize.height){
				resultTop = parentSize.height - _self.options.height
			}

			_self.moveTo(resultLeft, resultTop);
		}

		// 停止拖动
		function dragStop(e){
			e = Util.event.getEvent(e);
			Util.event.off(document, 'mousemove', dragMove)
			Util.event.off(document, 'mouseup', dragStop)
		}
	},

	// 设置是否可拖动
	toggleDragAble : function(isDragable){
		isDragable = isDragable === undefined ? !this.options.isDragable : isDragable;
		this.options.isDragable =isDragable;
		this.winElement.className = isDragable ? "simple-window" : "simple-window simple-window-disdrag-able"
	},

	// 移动到指定位置
	moveTo : function(left, top) {
		var style = this.winElement.style;
		left !== null && (style.left = left + "px", this.options.left = left);
		top !== null && (style.top = top + "px", this.options.top = top);
	},

	// 改变大小
	resizeTo : function(width, height) {
		var style = this.winElement.style;
		width !== null && (style.width = width + "px", this.options.width = width);
		height !== null && (style.height = height + "px", this.options.height = height);
	},


	// 设置显示状态
	show : function(isShow) {
		isShow = isShow === undefined ? this.options.isVisible : isShow;
		this.winElement.style.display = (isShow ? "block" : "none");
		this.isVisible = isShow;
	},

	// 切换显示状态
	toggle : function() {
		this.show[!this.isVisible]()
	},

	// 最大化窗口
	maximize : function() {
		var opts = this.options;
		// 保存原始状态
		this.preStatus = {
			left : opts.left,
			top : opts.top,
			width : opts.width,
			height : opts.height
		}

		this.resizeTo(
			opts.parent.clientWidth,
			opts.parent.clientHeight
		);

		this.moveTo(0, 0);
		opts.isMaximize = true;
		this.toggleDragAble(false);
	},

	// 恢复窗口大小
	restore : function() {
		var preStatus = this.preStatus;
		this.resizeTo(preStatus.width, preStatus.height);
		this.moveTo(preStatus.left, preStatus.top);

		this.options.isMaximize = false;
		this.toggleDragAble(true);
	},

	// 折叠窗口
	collapse : function() {
		
	},

	// 双击切换最大化
	_headerMax : function(){
		var _self = this;
		Util.event.on(this.winHeader, 'dblclick', function(){
			_self.options.isMaximize ? _self.restore() : _self.maximize();
		});
	},

	// 销毁窗口
	destory : function() {
		this.winElement.parentNode.removeChild(this.winElement);
	},

	// 设置缩放鼠标样式
	_setDragCursor : function(){

		var _self = this;

		Util.event.on(this.winElement, "mousemove", changeDragCursor);

		var winStyle = _self.winElement.style, cursor, direction;

		function changeDragCursor(e){

			if(_self.isDraging){return} // 正在拖动，直接返回

			e = Util.event.getEvent(e);
			var winEdge = _self.winElement.getBoundingClientRect();

			if(e.clientX > winEdge.right - 8){ // E
				cursor = "e-resize";
				direction = "E";
				if(e.clientY > winEdge.bottom - 8){ // SE
					cursor = "se-resize";
					direction = "SE";
				}else if(e.clientY < winEdge.top + 8){ // NE
					cursor = "ne-resize";
					direction = "NE";
				}
			}else if(e.clientX < winEdge.left + 8){ // W
				cursor = "w-resize";
				direction = "W";

				if(e.clientY > winEdge.bottom - 8){ // SW
					cursor = "sw-resize";
					direction = "SW";
				}else if(e.clientY < winEdge.top + 8){ // NW
					cursor = "nw-resize";
					direction = "NW";
				}
			}else if(e.clientY > winEdge.bottom - 8){ // S
				cursor = "s-resize";
				direction = "S";
			}else if(e.clientY < winEdge.top + 8){ // N
				cursor = "n-resize";
				direction = "N";
			}else{
				cursor = "default";
				direction = false;
			}
			winStyle.cursor = cursor;
			_self.direction = direction;
		}
	},

	// 拖动 缩小放大窗体
	_setDragResize : function(){
		var _self = this;

		this._setDragCursor(); // 设置鼠标样式

		Util.event.on(this.winElement, "mousedown", resizeDown);

		var startPosition, // 窗口起始位置
			startSize,	// 窗体起始大小
			startAxis,	// 鼠标起始位置
			opts = this.options;

		function resizeDown(e){
			e = Util.event.getEvent(e);

			startPosition = {
				left : opts.left,
				top : opts.top
			}

			startSize = {
				width : opts.width,
				height : opts.height
			}

			startAxis = {
				x : e.clientX,
				y : e.clientY
			}

			Util.event.on(document, 'mousemove', resizeMove);
			Util.event.on(document, 'mouseup', resizeStop);
		}

		function resizeMove(e){
			_self.isDraging = true;
			e = Util.event.getEvent(e);
			var changedAxis = {
				x : e.clientX - startAxis.x,
				y : e.clientY - startAxis.y
			}

			var width = startSize.width, 
				height = startSize.height, 
				left = startPosition.left, 
				top = startPosition.top;

			switch(_self.direction){
				case "E" : 
					width = startSize.width + changedAxis.x;
					break;

				case "S" :
					height = startSize.height + changedAxis.y;
					break;

				case "W" :
					width = startSize.width - changedAxis.x;
					left = startPosition.left + changedAxis.x;
					break;

				case "N" :
					height = startSize.height - changedAxis.y;
					top = startPosition.top + changedAxis.y;
					break;

				case "SE" :
					height = startSize.height + changedAxis.y;
					width = startSize.width + changedAxis.x;
					break;

				case "SW" :
					width = startSize.width - changedAxis.x;
					height = startSize.height + changedAxis.y;
					left = startPosition.left + changedAxis.x;
					break;

				case "NE" :
					width = startSize.width + changedAxis.x;
					height = startSize.height - changedAxis.y;
					top = startPosition.top + changedAxis.y;
					break;

				case "NW" :
					width = startSize.width - changedAxis.x;
					left = startPosition.left + changedAxis.x;
					height = startSize.height - changedAxis.y;
					top = startPosition.top + changedAxis.y;
					break;

				default : 
					return false;
			}

			// 最大最小限制
			width = Math.min(opts.maxWidth , width);
			width = Math.max(opts.minWidth , width);
			height = Math.min(opts.maxHeight , height);
			height = Math.max(opts.minHeight , height);

			_self.resizeTo(width, height);
			_self.moveTo(left, top);
		}

		function resizeStop(){
			_self.isDraging = false;
			Util.event.off(document, 'mousemove', resizeMove);
			Util.event.off(document, 'mouseup', resizeStop);
		}



	}

}






