{
    let view = {
        el: '#songList-container',
        template: `
		<ul class="songList">
        </ul>
		`,
        render(data = {}) {
            let { selectSongId, songs } = data;
            songs = songs || [];
            $(this.el).html(this.template);
            var ul = $(this.el).find('.songList');
            ul.empty();
            songs.map((song) => {
                let li = $('<li></li>').text(song.name).attr('data-song-id', song.id);
                if (selectSongId === song.id) li.addClass('active');
                ul.append(li);
            })
        },
        activeItem(li) {
            let $li = $(li);
            $li.addClass('active').siblings('.active').removeClass('active');
        },
        clearActive() {
            $(this.el).find('.active').removeClass('active');
        }
    }
    let model = {
        data: [],
        selectSongId: undefined,
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
                this.view.render(this.model.data);
            })
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                let songId = e.currentTarget.getAttribute('data-song-id');
                this.model.data.selectSongId = songId;
                this.view.render(this.model.data);
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
            window.eventHub.on('create', (data) => {
                this.model.data.songs.push(data);
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', () => {
                this.view.clearActive();
            })
            window.eventHub.on('update', (data) => {
                let songs = this.model.data.songs;
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === data.id) {
                        Object.assign(songs[i], data);
                        break;
                    }
                }
                this.view.render(this.model.data);
            });
        }
    }
    controller.init(view, model);
}