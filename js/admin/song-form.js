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
            <div class="row">
                <label>封面</label>
                <input name="conver" type="text" value="__conver__">
            </div>
            <div class="row">
                <label>歌词</label>
                <textarea name="lyrics">__lyrics__</textarea>
            </div>
            <div class="row actions">
               <button>保存</button>
            </div>
        </form>`,
        render(data = {}) {
            let placeholders = ['name', 'siger', 'url', 'id', 'conver', 'lyrics'];
            let html = this.template;
            placeholders.map((string) => {
                html = html.replace(`__${string}__`, data[string] || '');
            })
            $(this.el).html(html);
            if (data.id) {
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            } else {
                $(this.el).prepend('<h1>新增歌曲</h1>')
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
        data: { id: '', name: '', siger: '', url: '', conver: '', lyrics: '' },
        create(data) {
            let Song = AV.Object.extend('Song');
            let song = new Song();
            song.set('name', data.name);
            song.set('siger', data.siger);
            song.set('conver', data.conver);
            song.set('lyrics', data.lyrics);
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
        },
        update(data) {
            let song = AV.Object.createWithoutData('Song', data.id);
            song.set('name', data.name);
            song.set('siger', data.siger);
            song.set('conver', data.conver);
            song.set('lyrics', data.lyrics);
            song.set('url', data.url);
            return song.save().then((response) => {
                Object.assign(this.data, data);
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
        create() {
            let data = {};
            let needs = "name siger url id conver lyrics".split(" ");
            needs.map((string) => {
                data[string] = this.view.$el.find(`[name="${string}"]`).val();
            })
            this.model.create(data).then(() => {
                this.view.reset();
                var copy = JSON.stringify(this.model.data);
                var object = JSON.parse(copy);
                window.eventHub.emit('create', object);
            });
        },
        update() {
            let data = {};
            let needs = "name siger url id conver lyrics".split(" ");
            needs.map((string) => {
                data[string] = this.view.$el.find(`[name="${string}"]`).val();
            })
            this.model.update(data).then(() => {
                window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)));
            });
        },
        bindEvents() {
            this.view.$el.on('submit', 'form', (e) => {
                e.preventDefault();
                if (this.model.data.id) {
                    this.update();
                } else {
                    this.create();
                }
            })
        },
        bindEventHub() {
            window.eventHub.on('select', (data) => {
                this.model.data = data;
                this.view.render(this.model.data);
            })
            window.eventHub.on('new', (data) => {
                if (this.model.data.id) {
                    this.model.data = data || { id: '', name: '', url: '', siger: '', conver: '',lyrics: '' };
                } else {
                    Object.assign(this.model.data, data);
                }
                this.view.render(this.model.data);
            })
        }
    }
    controller.init(view, model);
}