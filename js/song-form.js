{
    let view = {
        el: '.page>main',
        template: `
        <form class="form">
            <div class="row">
                <label>歌名</label>
                <input name="name" type="text" value="__name__">
                <input name="id" type="hidden" value="__id__">
            </div>
            <div class="row">
                <label>歌手</label>
                <input name="siger" type="text" value="__siger__">
            </div>
            <div class="row">
                <label>外链</label>
                <input name="url" type="text" value="__url__">
            </div>
            <div class="row actions">
               <button>保存</button>
            </div>
        </form>`,
        render(data = {}) {
            let placeholders = ['name', 'siger', 'url', 'id'];
            let html = this.template;
            placeholders.map((string) => {
                html = html.replace(`__${string}__`, data[string] || '');
            })
            $(this.el).html(html);
            if (data.id) {
                $(this.el).prepend('<h1>新建歌曲</h1>')
            } else {
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            }
        },
        init() {
            this.$el = $(this.el);
        },
        reset() {
            this.render({})
        }
    }
    let model = {
        data: { id: '', name: '', siger: '', url: '' },
        create(data) {
            let Song = AV.Object.extend('Song');
            let song = new Song();
            song.set('name', data.name);
            song.set('siger', data.siger);
            song.set('url', data.url);
            return song.save().then((newSong) => {
                let { id, attributes } = newSong;
                Object.assign(this.data, {
                    id,
                    ...attributes
                })
            }, (error) => {
                console.log(error);
            })
        }
    };
    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);
            this.view.init();
            this.bindEvents();
            this.bindEventHub();
        },
        bindEvents() {
            this.view.$el.on('submit', 'form', (e) => {
                e.preventDefault();
                let data = {};
                let needs = "name siger url id".split(" ");
                needs.map((string) => {
                    data[string] = this.view.$el.find(`input[name="${string}"]`).val();
                })
                this.model.create(data).then(() => {
                    this.view.reset();
                    var copy = JSON.stringify(this.model.data);
                    var object = JSON.parse(copy);
                    window.eventHub.emit('create', object);
                });

            })
        },
        bindEventHub() {
            window.eventHub.on('upload', (data) => {
                console.log('song from 收到了消息' + JSON.stringify(data));
                this.view.render(data);
            })
            window.eventHub.on('select', (data) => {
                this.model.data = data;
                this.view.render(this.model.data);
            })
            window.eventHub.on('new', () => {
                this.model.data = { id: '', name: '', url: '', siger: '' };
                this.view.render(this.model.data);
            })
        }
    }
    controller.init(view, model);
}