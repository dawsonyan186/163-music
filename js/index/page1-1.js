{
    let view = {
        el: '',
        init() {
            this.$el = $(this.el);
        }
    }
    let model = {
        data: {
            songs: []
        }
    }
    let controller = {
        init(view, model) {
            this.view = view;
            this.view.init();
            this.model = model;
        }
    }
    controller.init(view, model);
}