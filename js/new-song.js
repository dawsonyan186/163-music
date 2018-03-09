{
    let view = {
        el: '.newSong',
        template: `
		新建歌曲
		`,
        render(data) {
            $(this.el).html(this.template);
        }
    }
    let model = {}
    let controller = {
        init(model, view) {
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);
            this.active();
            window.eventHub.on('select',(data)=>{
                console.log('你选择了'+JSON.stringify(data));
                this.deactive();
            })
        },
        active() {
            $(this.view.el).addClass('active')
        },
        deactive(){
            $(this.view.el).removeClass('active');
        }
    }
    controller.init(model, view);
}