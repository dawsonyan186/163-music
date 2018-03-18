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
                let audio = this.$el.find('audio')[0];
                console.log(audio);
                audio.onended = ()=>{
                   window.eventHub.emit('songEnd');
                }
                audio.ontimeupdate = ()=>{
                    this.showLyric(audio.currentTime);
                }
            }
            if(status==='playing'){
                this.$el.find('.disc-container').addClass('playing');
            }else{
                this.$el.find('.disc-container').removeClass('playing');
            }

            this.$el.find('.song-description>h1').text(song.name);
            let {lyrics} = song;
            let reg = /\[([\d:.\d]+)\](.+)/;
            lyrics.split('\n').map((string)=>{
                let p = document.createElement('p');
                let matches = string.match(reg);
                if(matches){
                    p.textContent = matches[2];
                    let time = matches[1];
                    let parts = time.split(':');
                    let minutes = parts[0];
                    let seconds = parts[1];
                    let newTime = parseInt(minutes,10)*60 + parseFloat(seconds,10);
                    p.setAttribute('data-time',newTime)
                }else{
                    p.textContent = string;
                }
                this.$el.find('.lyric .lines').append(p);
            });
        },
        play() {
            let audio = this.$el.find('audio')[0];
            audio.play();
        },
        pause() {
            let audio = this.$el.find('audio')[0];
            audio.pause();
        },
        showLyric(time){
            let allp = this.$el.find('.lyric .lines > p');
            let p;
            for(let i=0;i<allp.length;i++){
                if(i===allp.length-1){
                    p = allp[i]
                    break;
                }else{
                    let currentTime = parseInt(allp.eq(i).attr('data-time'),10);
                    let nextTime = parseInt(allp.eq(i+1).attr('data-time'),10);
                    if(currentTime <= time && nextTime > time){
                        p = allp[i];
                        break;
                    }   
                }
            }
            if(p){
                let pHeight = p.getBoundingClientRect().top;
                let linesHeight = this.$el.find('.lyric .lines')[0].getBoundingClientRect().top;
                let height = pHeight - linesHeight;
                this.$el.find('.lyric .lines').css('transform',`translateY(${-height}px)`);
                $(p).addClass('active').siblings('.active').removeClass('active');
            }
        }
    }
    let model = {
        data: {
        	song:{
	            id: '',
	            name: '',
	            siger: '',
	            url: '',
                lyrics:''
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
            window.eventHub.on('songEnd',()=>{
                this.model.data.status='paused';
                this.view.render(this.model.data);
                this.view.pause();
            })
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