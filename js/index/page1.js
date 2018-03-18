{
	let script1 = document.createElement('script');
	script1.src='./js/index/page1-1.js';
	script1.onload = function(){
		console.log("模块一加载完成")
	}
	document.body.appendChild(script1);

	let script2 = document.createElement('script');
	script2.src='./js/index/page1-2.js';
	script2.onload = function(){
		console.log("模块2加载完成")
	}
	document.body.appendChild(script2);

	let view={
		el:'.page-1',
		init(){
			this.$el = $(this.el);
		},
		show(){
			this.$el.addClass('active');
		},
		hide(){
			this.$el.removeClass('active');
		}
	}
	let model={}
	let controller={
		init(view,model){
			this.view = view;
			this.model = model;
			this.view.init();
			this.bindEventHub();
		},
		bindEventHub(){
			window.eventHub.on('selectTab',(tabName)=>{
				if(tabName==='page-1'){
					this.view.show();
				}else{
					this.view.hide();
				}
			})
		}
	}
	controller.init(view,model);
}