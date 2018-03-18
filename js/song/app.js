{
    let view = {
        el: '#app',
        init() {
            this.$el = $(this.el);
        },
        render(data) {
        	let {song,status} = data;
            this.$el.css('background-image',`url(${song.conver})`)
           	this.$el.find('img.cover').attr('src',song.conver);
            if(this.$el.find('audio').attr('src')!==song.url){
                this.$el.find('audio').attr('src',song.url);
            }
            if(status==='playing'){
                this.$el.find('.disc-container').addClass('playing');
            }else{
                this.$el.find('.disc-container').removeClass('playing');
            }
        },
        play() {
            let audio = this.$el.find('audio')[0];
            audio.play();
        },
        pause() {
            let audio = this.$el.find('audio')[0];
            audio.pause();
        }
    }
    let model = {
        data: {
        	song:{
	            id: '',
	            name: '',
	            siger: '',
	            url: ''
            },
            status:'paused'
        },
        setId(id) {
            this.data.song.id = id;
        },
        get() {
            var query = new AV.Query('Song');
            return query.get(this.data.song.id).then((song) => {
                Object.assign(this.data.song, { id: song.id, ...song.attributes });
                return song;
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view;
            this.view.init();
            this.model = model;
            let songId = this.getSongId();
            this.model.setId(songId);
            this.model.get().then((song) => {
                this.model.data.status='playing';
                this.view.render(this.model.data);
                this.view.play();
            })
            this.bindEvents();
        },
        bindEvents(){
        	this.view.$el.on('click','.icon-play',()=>{
                this.model.data.status='playing';
                this.view.render(this.model.data);
        		this.view.play();
        	})
        	this.view.$el.on('click','.icon-pause',()=>{
        		this.model.data.status='paused';
                this.view.render(this.model.data);
                this.view.pause();
        	})

        },
        getSongId() {
            let search = window.location.search;
            if (search.indexOf('?') === 0) {
                search = search.substring(1);
            }
            let key;
            let value;
            let kv;
            let array = search.split('&').filter((v => v));
            for (let i = 0; i < array.length; i++) {
                kv = array[i].split('=')
                key = kv[0];
                value = kv[1];
                if (key === 'id') {
                    break;
                }
            }
            return value;
        }
    }
    controller.init(view, model);
}