{
    let view = {
        el: '#songList-container',
        template: `
		<ul class="songList">
        </ul>
		`,
        render(songs = []) {
            $(this.el).html(this.template);
            var ul = $(this.el).find('.songList');
            ul.empty();
            songs.map((song) => {
                ul.append($('<li></li>').text(song.name).attr('data-song-id', song.id));
            })
        },
        activeItem(li) {
            let $li = $(li);
            $li.addClass('active').siblings('.active').removeClass('active');
        },
        clearActive() {
            $(this.el).find('active').removeClass('active');
        }
    }
    let model = {
        data: [],
        find() {
            var query = new AV.Query("Song");
            return query.find().then((songs) => {
                this.data.songs = songs.map((song) => {
                    return { id: song.id, ...song.attributes };
                })
                return songs;
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.render();
            this.getAllSongs();
            this.bindEvents();
            this.bindEventHub();
        },
        getAllSongs() {
            return this.model.find().then(() => {
                this.view.render(this.model.data.songs);
            })
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                this.view.activeItem(e.currentTarget);
                let songId = e.currentTarget.getAttribute('data-song-id');
                let song;
                let songs = this.model.data.songs;
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === songId) {
                        song = songs[i];
                        break;
                    }
                }
                let object = JSON.parse(JSON.stringify(song));
                window.eventHub.emit('select', object);
            })
        },
        bindEventHub() {
            window.eventHub.on('upload', (data) => {
                console.log('song list  模块收到了消息')
                console.log(data);
                this.view.clearActive();
            })
            window.eventHub.on('create', (data) => {
                this.model.data.songs.push(data);
                this.view.render(this.model.data.songs)
            })
        }
    }
    controller.init(view, model);
}